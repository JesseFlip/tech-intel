// planGenerator.js
// Turns an idea + its evaluation into a concrete, phased execution plan with
// milestones, the skills to build, and how to wire Claude Cowork into each step.
// The plan is adaptive: weak dimensions in the evaluation become explicit early
// experiments so you de-risk the riskiest things first.

import { DIMENSIONS } from './evaluationEngine.js';

function dimLabel(id) {
  return DIMENSIONS.find((d) => d.id === id)?.label ?? id;
}

// Milestones injected when a particular dimension scored low, so the plan
// directly attacks the idea's specific weak spots.
const WEAKNESS_REMEDIES = {
  problem: 'Interview 8–10 target customers to confirm the problem is real and painful (not just yours).',
  demand: 'Size the audience with real data (search volume, communities, competitors’ users).',
  wtp: 'Run a pricing/pre-sale test — a landing page with a real "Buy/Join" button to measure intent.',
  differentiation: 'Map the top 5 alternatives and write the one sentence on why you win.',
  founderFit: 'Recruit an advisor or partner who fills your biggest domain gap.',
  feasibility: 'Build a throwaway prototype of the single hardest technical piece first.',
  distribution: 'Pick ONE channel and run a 1-week test to prove you can reach customers cheaply.',
  monetization: 'Write out the full revenue model on one page and stress-test the unit economics.',
  retention: 'Define the core "reason to return" and design the habit loop before building features.',
  timing: 'Write the "why now" memo — the tailwind you are riding. If you can’t, reconsider.',
};

// Build the phased plan. Each phase has objective, milestones (checkable),
// the key metric that ends the phase, and the skills to build during it.
export function generatePlan(idea, evaluation) {
  const weakIds = (evaluation?.biggestLevers || []).map((d) => d.id);
  const isSub = (idea.model || evaluation?.model) === 'subscription';

  // Phase 0 — Validate. The weakest dimensions become the validation tasks.
  const validateMilestones = [
    'Write down your single riskiest assumption — the one that, if false, kills the idea.',
    ...weakIds.map((id) => WEAKNESS_REMEDIES[id]).filter(Boolean),
  ];
  if (validateMilestones.length < 3) {
    validateMilestones.push(
      'Interview 8–10 target customers and confirm the problem in their own words.',
      'Stand up a simple landing page and measure real sign-up / pre-order intent.'
    );
  }

  const phases = [
    {
      id: 'validate',
      title: 'Validate',
      timeframe: 'Weeks 1–2',
      objective: 'Prove the problem and demand are real before writing serious code.',
      metric: 'Clear evidence of demand: e.g. 10 problem-confirming interviews or 25+ genuine sign-ups.',
      milestones: dedupe(validateMilestones).slice(0, 5),
      skills: ['Customer interviewing', 'Landing page + basic analytics', 'Writing a crisp value proposition'],
    },
    {
      id: 'mvp',
      title: 'Build the MVP',
      timeframe: 'Weeks 3–8',
      objective: 'Ship the smallest version that delivers the core value to real users.',
      metric: 'A working MVP in the hands of 5–10 real users who completed the core action.',
      milestones: [
        'Define the ONE core job the MVP must do and cut everything else.',
        'Choose the fastest stack (no-code / low-code is fine) and ship a v1.',
        'Get it in front of 5–10 real users and watch them use it.',
        'Instrument the one metric that proves the core value lands.',
      ],
      skills: ['Rapid prototyping / chosen tech stack', 'Scoping & saying no to features', 'User onboarding'],
    },
    {
      id: 'launch',
      title: 'Launch & Charge',
      timeframe: 'Weeks 9–12',
      objective: 'Put it in the market, ask for money, and learn from real customers.',
      metric: isSub
        ? 'First paying subscribers and a measured week-1 retention number.'
        : 'First paying customers and a repeatable way to get the next ten.',
      milestones: [
        'Launch publicly on your chosen channel with a clear offer.',
        'Turn on payments and ask for money — even a small price.',
        isSub
          ? 'Track activation and early churn; talk to anyone who cancels.'
          : 'Track conversion and talk to anyone who almost bought but didn’t.',
        'Double down on the one channel that actually brings customers.',
      ],
      skills: ['Go-to-market & launch', 'Pricing & sales basics', isSub ? 'Subscription metrics (MRR, churn, LTV)' : 'Conversion optimization'],
    },
    {
      id: 'grow',
      title: 'Grow & Retain',
      timeframe: 'Month 4+',
      objective: 'Build a repeatable growth loop and keep customers around.',
      metric: isSub
        ? 'Net revenue retention trending up and churn under control.'
        : 'A growth channel that reliably returns more than it costs.',
      milestones: [
        'Find your one north-star metric and review it weekly.',
        isSub
          ? 'Systematically reduce churn — fix the top reasons people leave.'
          : 'Build one repeatable acquisition loop and optimize it.',
        'Decide deliberately: stay solo, hire, or raise — based on the numbers.',
        'Set a quarterly goal and let it drive the weekly accountability loop.',
      ],
      skills: ['Analytics & metrics literacy', 'Retention / lifecycle', 'Operating cadence & planning'],
    },
  ];

  return {
    phases,
    weaknesses: weakIds.map(dimLabel),
    summary: planSummary(idea, evaluation),
  };
}

function planSummary(idea, evaluation) {
  if (!evaluation) return '';
  if (evaluation.tier.id === 'go') {
    return 'You have a green light. The plan front-loads de-risking, then moves fast to a paid MVP. Work it phase by phase with Claude Cowork.';
  }
  if (evaluation.tier.id === 'refine') {
    return 'Treat Phase 0 as a gate: run the validation experiments, then re-score. Only pour real time into building once the weak levers move.';
  }
  return 'The honest plan is to spend just a few cheap days on Phase 0 validation. If the evidence doesn’t improve, redirect your energy to a stronger idea.';
}

function dedupe(arr) {
  return [...new Set(arr.filter(Boolean))];
}
