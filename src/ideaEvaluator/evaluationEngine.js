// evaluationEngine.js
// Pure, deterministic scoring engine for evaluating whether an idea is worth
// pursuing as an App, a Business, or a Subscription service. No network / API
// calls — everything here is defensible, transparent rubric math that runs in
// the browser. Claude Cowork is used downstream (see coworkTemplates.js) to
// help execute the plan, not to produce the score.

// The model types we score an idea against.
export const MODEL_TYPES = [
  { id: 'app', label: 'App', blurb: 'A product people download / open repeatedly.' },
  { id: 'business', label: 'Business', blurb: 'A broader company that sells a product or service.' },
  { id: 'subscription', label: 'Subscription', blurb: 'Recurring revenue for ongoing value.' },
];

// The evaluation rubric. Each dimension is scored 1–5 by the user, with plain
// anchors so the scoring is honest rather than vibes. `weights` are *relative*
// importance per model type and are normalised at compute time.
export const DIMENSIONS = [
  {
    id: 'problem',
    label: 'Problem Severity',
    hint: 'Painkiller vs. vitamin — how badly does the customer feel this?',
    critical: true,
    weights: { app: 3, business: 3, subscription: 3 },
    anchors: {
      1: 'Minor annoyance, rarely noticed',
      2: 'A "nice to fix" inconvenience',
      3: 'A real, recurring problem people tolerate',
      4: 'Painful — people actively look for fixes',
      5: 'Urgent, frequent, expensive pain they will pay to remove',
    },
  },
  {
    id: 'demand',
    label: 'Market Demand & Size',
    hint: 'Is there a large or fast-growing group of people who have this problem?',
    weights: { app: 3, business: 3, subscription: 2 },
    anchors: {
      1: 'Tiny or shrinking audience',
      2: 'Niche, hard to reach',
      3: 'Decent, stable audience',
      4: 'Large or clearly growing audience',
      5: 'Huge, fast-growing, easy to identify',
    },
  },
  {
    id: 'wtp',
    label: 'Willingness to Pay',
    hint: 'Will the target customer actually open their wallet — and how much?',
    critical: true,
    weights: { app: 2, business: 3, subscription: 3 },
    anchors: {
      1: 'They expect it free / won’t pay',
      2: 'Maybe a token amount',
      3: 'Would pay if clearly better',
      4: 'Already pays for alternatives',
      5: 'Budget exists and is actively spent on this',
    },
  },
  {
    id: 'differentiation',
    label: 'Differentiation & Moat',
    hint: 'Why you, and why can’t a competitor copy it next month?',
    weights: { app: 2, business: 3, subscription: 2 },
    anchors: {
      1: 'Identical to many existing options',
      2: 'Slightly different, easily copied',
      3: 'A clear angle competitors lack today',
      4: 'Hard to copy (data, network, brand, IP)',
      5: 'Strong defensible moat that compounds',
    },
  },
  {
    id: 'founderFit',
    label: 'Founder–Market Fit',
    hint: 'Your unfair advantage: expertise, network, or genuine obsession.',
    weights: { app: 1, business: 2, subscription: 1 },
    anchors: {
      1: 'No real connection or edge here',
      2: 'Curious but starting from zero',
      3: 'Relevant skills or interest',
      4: 'Deep domain experience or network',
      5: 'Uniquely positioned — this is "your" problem',
    },
  },
  {
    id: 'feasibility',
    label: 'Feasibility to Build',
    hint: 'Can a usable first version exist with your time, skills and money?',
    weights: { app: 3, business: 2, subscription: 2 },
    anchors: {
      1: 'Requires capabilities far beyond reach',
      2: 'Very hard / expensive to build a v1',
      3: 'Doable but stretches current resources',
      4: 'Clearly buildable in weeks',
      5: 'Could ship a real MVP almost immediately',
    },
  },
  {
    id: 'distribution',
    label: 'Distribution & Go-to-Market',
    hint: 'Do you have a concrete, low-cost way to reach customers?',
    weights: { app: 3, business: 3, subscription: 2 },
    anchors: {
      1: 'No idea how to reach people',
      2: 'Only expensive paid channels',
      3: 'A plausible channel to test',
      4: 'An owned audience or proven channel',
      5: 'Built-in virality or existing pipeline',
    },
  },
  {
    id: 'monetization',
    label: 'Monetization Fit',
    hint: 'Does how you charge match how the value is delivered?',
    weights: { app: 2, business: 2, subscription: 3 },
    anchors: {
      1: 'No clear way to make money',
      2: 'Monetization feels forced',
      3: 'A reasonable revenue model',
      4: 'Pricing maps cleanly to value',
      5: 'Value and price compound over time',
    },
  },
  {
    id: 'retention',
    label: 'Retention & Stickiness',
    hint: 'Will people keep coming back / keep paying? (Make-or-break for subscriptions.)',
    critical: true,
    criticalFor: ['subscription'],
    weights: { app: 2, business: 2, subscription: 4 },
    anchors: {
      1: 'One-and-done, no reason to return',
      2: 'Occasional, easy to forget',
      3: 'Useful enough to return sometimes',
      4: 'Becomes a habit / hard to leave',
      5: 'Embedded in daily life or workflow',
    },
  },
  {
    id: 'timing',
    label: 'Timing — "Why Now?"',
    hint: 'Is there a tailwind (tech, behaviour, regulation) making now the moment?',
    weights: { app: 1, business: 1, subscription: 1 },
    anchors: {
      1: 'Too early or already too late',
      2: 'No particular reason it’s now',
      3: 'Neutral — could work anytime',
      4: 'A clear emerging tailwind',
      5: 'A wave is cresting right now',
    },
  },
];

// Personal "is it truly worthwhile for *me*" dimensions. Success likelihood and
// personal worthwhileness are scored separately on purpose: a great idea you
// won’t stick with, or a passion project no one will pay for, both fail.
export const WORTH_DIMENSIONS = [
  {
    id: 'conviction',
    label: 'Conviction & Stamina',
    hint: 'Would you happily work on this for 2+ years, including the boring middle?',
    anchors: {
      1: 'Excitement would fade in weeks',
      3: 'Interested for a while',
      5: 'Could obsess over this for years',
    },
  },
  {
    id: 'opportunityCost',
    label: 'Opportunity Cost',
    hint: 'Is this the best use of your time vs. everything else you could do?',
    anchors: {
      1: 'Better options on the table',
      3: 'One of several decent options',
      5: 'Clearly the highest-value thing I could do',
    },
  },
  {
    id: 'alignment',
    label: 'Life & Values Alignment',
    hint: 'Does the day-to-day work and lifestyle this creates fit the life you want?',
    anchors: {
      1: 'Conflicts with my goals/values',
      3: 'Mostly compatible',
      5: 'Exactly the life and work I want',
    },
  },
  {
    id: 'downside',
    label: 'Survivable Downside',
    hint: 'If it fails, can you absorb the time/money lost and be fine?',
    anchors: {
      1: 'Failure would be devastating',
      3: 'A real but recoverable setback',
      5: 'Cheap to try, easy to recover',
    },
  },
];

const VALUE_MIN = 1;
const VALUE_MAX = 5;

// Convert a 1–5 rating into a 0–100 contribution.
function scaled(value) {
  const v = Math.min(VALUE_MAX, Math.max(VALUE_MIN, Number(value) || VALUE_MIN));
  return ((v - VALUE_MIN) / (VALUE_MAX - VALUE_MIN)) * 100;
}

// Weighted 0–100 success score for a single model type.
export function scoreForModel(ratings, modelType) {
  let weightSum = 0;
  let acc = 0;
  for (const dim of DIMENSIONS) {
    const w = dim.weights[modelType] ?? 0;
    weightSum += w;
    acc += w * scaled(ratings[dim.id]);
  }
  return weightSum === 0 ? 0 : Math.round(acc / weightSum);
}

// Score across every model type so the user can see which shape fits best.
export function scoreAllModels(ratings) {
  const out = {};
  for (const m of MODEL_TYPES) out[m.id] = scoreForModel(ratings, m.id);
  return out;
}

export function worthwhileScore(worthRatings) {
  if (!WORTH_DIMENSIONS.length) return 0;
  const sum = WORTH_DIMENSIONS.reduce((a, d) => a + scaled(worthRatings[d.id]), 0);
  return Math.round(sum / WORTH_DIMENSIONS.length);
}

// Dimensions rated very low that act as hard caps on the verdict.
function fatalFlaws(ratings, primaryModel) {
  const flaws = [];
  for (const dim of DIMENSIONS) {
    const isCritical =
      dim.critical && (!dim.criticalFor || dim.criticalFor.includes(primaryModel));
    if (isCritical && (Number(ratings[dim.id]) || 0) <= 2) {
      flaws.push(dim);
    }
  }
  return flaws;
}

// Find the dimensions with the most upside: high weight, currently low score.
// These are the levers the plan should attack first.
function biggestLevers(ratings, primaryModel) {
  return DIMENSIONS.map((dim) => {
    const w = dim.weights[primaryModel] ?? 0;
    const gap = 100 - scaled(ratings[dim.id]);
    return { dim, potential: w * gap, value: Number(ratings[dim.id]) || 0 };
  })
    .filter((x) => x.value < 4 && x.potential > 0)
    .sort((a, b) => b.potential - a.potential)
    .slice(0, 3)
    .map((x) => x.dim);
}

const TIERS = {
  go: {
    id: 'go',
    label: 'Pursue it',
    tone: 'go',
    headline: 'This looks truly worthwhile.',
  },
  refine: {
    id: 'refine',
    label: 'Refine first',
    tone: 'refine',
    headline: 'Promising — but fix the gaps before you commit.',
  },
  nogo: {
    id: 'nogo',
    label: 'Reconsider',
    tone: 'nogo',
    headline: 'The evidence says pause or pivot before investing more.',
  },
};

// The headline judgement, combining success likelihood + personal worthwhileness,
// gated by any fatal flaws. "Truly worthwhile" deliberately requires BOTH a
// credible path to success AND that it’s worth it to you personally.
export function evaluate({ ratings, worthRatings, primaryModel }) {
  const modelScores = scoreAllModels(ratings);
  const bestModel = Object.entries(modelScores).sort((a, b) => b[1] - a[1])[0][0];
  const model = primaryModel || bestModel;
  const success = modelScores[model];
  const worth = worthwhileScore(worthRatings);
  const flaws = fatalFlaws(ratings, model);
  const levers = biggestLevers(ratings, model);

  const greenFlags = DIMENSIONS.filter((d) => (Number(ratings[d.id]) || 0) >= 4);
  const redFlags = DIMENSIONS.filter((d) => (Number(ratings[d.id]) || 0) <= 2);

  // Verdict, in priority order. "Truly worthwhile" demands BOTH a credible path
  // to success AND that it's worth it to you — and no broken critical dimension.
  const hardFlaw = flaws.some((f) => (Number(ratings[f.id]) || 0) <= 1);
  let tier;
  if (hardFlaw) {
    // A make-or-break dimension is essentially absent — pause and pivot.
    tier = TIERS.nogo;
  } else if (success < 45 || worth < 40) {
    // The case is too weak overall to justify the time, regardless of any one strength.
    tier = TIERS.nogo;
  } else if (success >= 65 && worth >= 65 && flaws.length === 0) {
    tier = TIERS.go;
  } else {
    // Promising but with gaps to close (or a critical dim still only at "2").
    tier = TIERS.refine;
  }

  return {
    tier,
    success,
    worth,
    model,
    bestModel,
    modelScores,
    greenFlags,
    redFlags,
    fatalFlaws: flaws,
    biggestLevers: levers,
    reasoning: buildReasoning({ tier, success, worth, model, flaws, levers }),
  };
}

function pct(n) {
  return `${n}%`;
}

function buildReasoning({ tier, success, worth, model, flaws, levers }) {
  const modelLabel = MODEL_TYPES.find((m) => m.id === model)?.label ?? model;
  const lines = [];
  lines.push(
    `As a ${modelLabel.toLowerCase()}, the idea scores ${pct(success)} on likelihood of success and ${pct(
      worth
    )} on how worthwhile it is for you personally.`
  );
  if (flaws.length) {
    const names = flaws.map((f) => `“${f.label}”`).join(' and ');
    const verb = flaws.length > 1 ? 'are' : 'is';
    lines.push(
      tier.id === 'nogo'
        ? `Before anything else, ${names} ${verb} rated so low that ${flaws.length > 1 ? 'they look' : 'it looks'} fatal — these are make-or-break dimensions.`
        : `Watch closely: ${names} ${verb} make-or-break and still sitting too low to call this a clean yes.`
    );
  }
  if (tier.id === 'go') {
    lines.push(
      'Both the market case and your personal fit clear the bar, and no critical dimension is broken. The plan below turns that into momentum.'
    );
  } else if (tier.id === 'refine') {
    lines.push(
      'The bones are good, but it is not yet a clear yes. Treat the levers below as cheap experiments — if you can move them, re-score and the verdict can flip to a confident go.'
    );
  } else {
    lines.push(
      'Rather than sink time into building, the honest move is to either pivot the weakest parts or choose a different idea. That is a win — you just saved yourself months.'
    );
  }
  if (levers.length) {
    lines.push(`Highest-leverage things to improve: ${levers.map((l) => l.label).join(', ')}.`);
  }
  return lines;
}

// Verdict tiers exported for any UI that needs the colour mapping.
export { TIERS };
