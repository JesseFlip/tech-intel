// Step 4 — The plan + Claude Cowork integration. Renders the phased execution
// plan, the skills to build, and copy-paste-ready Cowork prompts that turn the
// plan into a managed, accountable workspace.

import { useMemo, useState } from 'react';
import { Card, Button, CopyBlock } from '../ui.jsx';
import { generatePlan } from '../planGenerator.js';
import {
  masterKickoff,
  projectScaffold,
  coworkSkills,
  weeklyCheckinPrompt,
} from '../coworkTemplates.js';
import { MODEL_TYPES } from '../evaluationEngine.js';

export default function Plan({ idea, evaluation, onBack, onAccountability }) {
  const enrichedIdea = useMemo(
    () => ({ ...idea, modelLabel: MODEL_TYPES.find((m) => m.id === idea.model)?.label }),
    [idea]
  );
  const plan = useMemo(() => generatePlan(enrichedIdea, evaluation), [enrichedIdea, evaluation]);
  const skills = useMemo(() => coworkSkills(enrichedIdea, evaluation), [enrichedIdea, evaluation]);
  const [tab, setTab] = useState('plan');

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-bold text-white">Your plan, run with Claude Cowork</h2>
        <p className="text-sm text-slate-400 mt-1">{plan.summary}</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800">
        {[
          ['plan', 'Phased plan'],
          ['cowork', 'Claude Cowork setup'],
          ['skills', 'Skills to build'],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === id
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'plan' && <PlanView plan={plan} />}
      {tab === 'cowork' && <CoworkView plan={plan} idea={enrichedIdea} evaluation={evaluation} skills={skills} />}
      {tab === 'skills' && <SkillsView plan={plan} skills={skills} />}

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          ← Back to verdict
        </Button>
        <Button onClick={onAccountability}>Set up accountability tracking →</Button>
      </div>
    </div>
  );
}

function PlanView({ plan }) {
  return (
    <div className="space-y-4">
      {plan.phases.map((phase, i) => (
        <Card key={phase.id}>
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-300 text-sm font-bold">
              {i}
            </span>
            <div className="flex-1">
              <h3 className="font-bold text-white">{phase.title}</h3>
              <p className="text-xs text-slate-400">{phase.timeframe}</p>
            </div>
          </div>
          <p className="text-sm text-slate-300 mb-3">{phase.objective}</p>
          <ul className="space-y-1.5 mb-3">
            {phase.milestones.map((m, j) => (
              <li key={j} className="flex gap-2 text-sm text-slate-300">
                <span className="text-indigo-400 mt-0.5">▸</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
          <div className="text-xs text-slate-400 border-t border-slate-800 pt-3">
            <span className="font-semibold text-slate-300">Phase done when:</span> {phase.metric}
          </div>
        </Card>
      ))}
    </div>
  );
}

function CoworkView({ plan, idea, evaluation, skills }) {
  return (
    <div className="space-y-4">
      <Card className="bg-indigo-500/5 border-indigo-500/20">
        <h3 className="font-semibold text-white flex items-center gap-2">
          🤝 How this works with Claude Cowork
        </h3>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          Claude Cowork is your co-founder for execution. Paste the kickoff below to set up your workspace,
          then spin up a project per phase. Cowork manages the tasks, builds the skills you’re missing, and
          runs a weekly check-in to hold you accountable — so the plan actually gets done.
        </p>
      </Card>

      <CopyBlock
        title="1. Master kickoff"
        subtitle="Paste this first to brief Cowork as your co-founder."
        text={masterKickoff(idea, evaluation, plan.phases)}
      />

      <div>
        <h4 className="text-sm font-semibold text-slate-300 mb-2">2. One project per phase</h4>
        <div className="space-y-3">
          {plan.phases.map((phase, i) => (
            <CopyBlock
              key={phase.id}
              title={`Phase ${i}: ${phase.title}`}
              subtitle="Create this as a Cowork project to track the phase."
              text={projectScaffold(idea, phase)}
            />
          ))}
        </div>
      </div>

      <CopyBlock
        title="3. Weekly accountability check-in"
        subtitle="Run this every week to stay honest and on track."
        text={weeklyCheckinPrompt(idea)}
      />

      <p className="text-xs text-slate-500">
        {skills.length} reusable Cowork skills are ready on the “Skills to build” tab.
      </p>
    </div>
  );
}

function SkillsView({ plan, skills }) {
  return (
    <div className="space-y-4">
      <Card>
        <h3 className="font-semibold text-white mb-2">Muscles to build, by phase</h3>
        <div className="space-y-2">
          {plan.phases.map((phase) => (
            <div key={phase.id} className="text-sm">
              <span className="text-slate-400">{phase.title}: </span>
              <span className="text-slate-200">{phase.skills.join(' · ')}</span>
            </div>
          ))}
        </div>
      </Card>

      <h4 className="text-sm font-semibold text-slate-300">Reusable Claude Cowork skills</h4>
      {skills.map((s) => (
        <div key={s.id} className="space-y-2">
          <CopyBlock title={s.title} subtitle={s.why} text={s.prompt} />
        </div>
      ))}
    </div>
  );
}
