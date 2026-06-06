// coworkTemplates.js
// Generates ready-to-paste prompts, project setups and skills for Claude Cowork.
// The evaluator decides *whether* to build; Claude Cowork helps you *actually*
// build it — running projects, building your skills, and holding you accountable.
// Everything here is a string the user can copy straight into a Cowork session.

function ideaSummary(idea) {
  const parts = [];
  if (idea.name) parts.push(`Idea: ${idea.name}`);
  if (idea.oneLiner) parts.push(`One-liner: ${idea.oneLiner}`);
  if (idea.customer) parts.push(`Target customer: ${idea.customer}`);
  if (idea.problem) parts.push(`Problem it solves: ${idea.problem}`);
  if (idea.modelLabel) parts.push(`Business shape: ${idea.modelLabel}`);
  return parts.join('\n');
}

// One Cowork project scaffold per plan phase.
export function projectScaffold(idea, phase) {
  return [
    `Create a Claude Cowork project called "${idea.name || 'My Idea'} — ${phase.title}".`,
    '',
    'Context for this project:',
    ideaSummary(idea),
    '',
    `Goal of this phase: ${phase.objective}`,
    '',
    'Tasks to track:',
    ...phase.milestones.map((m, i) => `${i + 1}. ${m}`),
    '',
    `We will measure success by: ${phase.metric}.`,
    'Act as my co-worker on this: break these tasks into the next concrete action,',
    'do the parts you can do, and flag where you need a decision or input from me.',
  ].join('\n');
}

// A library of focused "skills" (reusable Cowork agents/prompts) tailored to the
// idea. These map to the muscles a founder needs and are derived from the plan.
export function coworkSkills(idea, evaluation) {
  const summary = ideaSummary(idea);
  const skills = [
    {
      id: 'validation',
      title: 'Customer Interview Synthesizer',
      why: 'Turn messy customer conversations into clear signal about real demand.',
      prompt: [
        'You are my customer-discovery analyst.',
        summary,
        '',
        'I will paste raw notes or transcripts from customer interviews.',
        'For each batch, extract: (1) the problems people actually described in',
        'their own words, (2) what they currently do instead, (3) signals of real',
        'willingness to pay, (4) quotes that confirm or kill my assumptions, and',
        '(5) the single riskiest assumption I should test next. Be skeptical —',
        'tell me when I am hearing politeness, not demand.',
      ].join('\n'),
    },
    {
      id: 'mvp',
      title: 'MVP Spec Writer',
      why: 'Ruthlessly scope the smallest thing that proves the core value.',
      prompt: [
        'You are my product lead. Help me scope the smallest possible MVP.',
        summary,
        '',
        'Propose: the ONE core job the MVP must do, the 3–5 features that are',
        'truly required to do it, an explicit "not now" list, and the simplest',
        'tech/no-code stack to ship it fastest. Challenge every feature: if it',
        'is not needed to test the core value, cut it.',
      ].join('\n'),
    },
    {
      id: 'gtm',
      title: 'Go-to-Market Channel Tester',
      why: 'Find and run the cheapest channel that reaches real customers.',
      prompt: [
        'You are my growth marketer.',
        summary,
        '',
        'List 5 specific, low-cost channels to reach this exact customer, ranked',
        'by likely fit. For the top channel, give me a one-week experiment with a',
        'concrete daily action, the message/hook to test, and the metric that',
        'tells me it works. Keep it doable solo.',
      ].join('\n'),
    },
  ];

  // Subscription / retention focus only when it matters.
  if (idea.model === 'subscription' || evaluation?.model === 'subscription') {
    skills.push({
      id: 'retention',
      title: 'Retention & Pricing Coach',
      why: 'Subscriptions live or die on churn — design for the habit and the price.',
      prompt: [
        'You are my subscription metrics coach.',
        summary,
        '',
        'Help me design for retention from day one: what is the recurring "reason',
        'to come back", what is the natural habit loop, and what early churn',
        'signals should I watch? Then propose a starting price and a simple',
        'pricing experiment, and explain MRR, churn and LTV in terms of THIS idea.',
      ].join('\n'),
    });
  }

  skills.push({
    id: 'accountability',
    title: 'Weekly Accountability Coach',
    why: 'A standing check-in that keeps you honest and moving every week.',
    prompt: weeklyCheckinPrompt(idea),
  });

  return skills;
}

// The recurring accountability ritual — paste once a week into Cowork.
export function weeklyCheckinPrompt(idea) {
  return [
    'You are my weekly accountability coach for this venture.',
    ideaSummary(idea),
    '',
    'Run our weekly check-in. Ask me, one at a time:',
    '1. What did I commit to last week, and what actually got done?',
    '2. What got in the way, honestly?',
    '3. What is the single most important outcome for next week?',
    '4. What are the 3 concrete actions to get there, with days attached?',
    '',
    'Then: call out any pattern of slipping commitments without being soft about',
    'it, help me cut scope if I am overcommitting, and end by restating my 3',
    'commitments and the metric we are moving. Keep me focused on the riskiest',
    'assumption, not busywork.',
  ].join('\n');
}

// A kickoff message that sets up the whole Cowork workspace at once.
export function masterKickoff(idea, evaluation, phases) {
  return [
    `I am starting work on "${idea.name || 'a new venture'}". Be my co-founder in Claude Cowork.`,
    '',
    ideaSummary(idea),
    '',
    evaluation
      ? `My evaluation: ${evaluation.success}% likelihood of success as a ${idea.modelLabel || evaluation.model}, ` +
        `${evaluation.worth}% personal worthwhileness. Verdict: ${evaluation.tier.label}.`
      : '',
    '',
    'Here is the phased plan I want to execute:',
    ...phases.map(
      (p, i) => `Phase ${i}: ${p.title} — ${p.objective} (target: ${p.metric})`
    ),
    '',
    'Set us up to work through this together: keep a running project per phase,',
    'hold me accountable weekly, and proactively help with the tasks you can do.',
    'Start by helping me with Phase 0.',
  ]
    .filter(Boolean)
    .join('\n');
}
