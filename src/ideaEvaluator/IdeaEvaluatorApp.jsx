// IdeaEvaluatorApp.jsx
// Orchestrates the five-step flow: Describe → Assess → Verdict → Plan →
// Accountability. Holds all state, persists it to localStorage, and computes the
// evaluation. Fully client-side; Claude Cowork is integrated via the generated
// prompts in the Plan and Accountability steps.

import { useEffect, useMemo, useState } from 'react';
import { loadState, saveState, clearState } from './storage.js';
import { evaluate } from './evaluationEngine.js';
import { Button } from './ui.jsx';
import IdeaInput from './steps/IdeaInput.jsx';
import Assessment from './steps/Assessment.jsx';
import Verdict from './steps/Verdict.jsx';
import Plan from './steps/Plan.jsx';
import Accountability from './steps/Accountability.jsx';

const STEPS = [
  { id: 'idea', label: 'Idea' },
  { id: 'assess', label: 'Assess' },
  { id: 'verdict', label: 'Verdict' },
  { id: 'plan', label: 'Plan' },
  { id: 'track', label: 'Accountability' },
];

export default function IdeaEvaluatorApp({ onOpenIntel }) {
  const persisted = useMemo(() => loadState(), []);
  const [step, setStep] = useState(0);
  const [idea, setIdea] = useState(persisted.idea);
  const [ratings, setRatings] = useState(persisted.ratings);
  const [worthRatings, setWorthRatings] = useState(persisted.worthRatings);
  const [progress, setProgress] = useState(persisted.progress);
  const [checkins, setCheckins] = useState(persisted.checkins);

  // Persist on any meaningful change.
  useEffect(() => {
    saveState({ idea, ratings, worthRatings, progress, checkins });
  }, [idea, ratings, worthRatings, progress, checkins]);

  const evaluation = useMemo(
    () => evaluate({ ratings, worthRatings, primaryModel: idea.model }),
    [ratings, worthRatings, idea.model]
  );

  // Steps reachable only once prerequisites are met.
  const hasIdea = idea.name?.trim() && idea.oneLiner?.trim();
  const hasScores = Object.keys(ratings).length >= 10 && Object.keys(worthRatings).length >= 4;
  const reachable = (i) => {
    if (i <= 1) return hasIdea || i === 0;
    return hasIdea && hasScores;
  };

  const goto = (i) => reachable(i) && setStep(i);

  const reset = () => {
    if (!window.confirm('Start over? This clears your saved idea, scores and check-ins on this device.')) return;
    const fresh = clearState();
    setIdea(fresh.idea);
    setRatings(fresh.ratings);
    setWorthRatings(fresh.worthRatings);
    setProgress(fresh.progress);
    setCheckins(fresh.checkins);
    setStep(0);
  };

  return (
    <div className="flex-grow text-slate-100">
      <BackgroundGlow />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Header onReset={reset} onOpenIntel={onOpenIntel} />
        <Stepper steps={STEPS} current={step} reachable={reachable} onGoto={goto} />

        <main className="mt-8">
          {step === 0 && <IdeaInput idea={idea} setIdea={setIdea} onNext={() => setStep(1)} />}
          {step === 1 && (
            <Assessment
              ratings={ratings}
              setRatings={setRatings}
              worthRatings={worthRatings}
              setWorthRatings={setWorthRatings}
              onBack={() => setStep(0)}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <Verdict evaluation={evaluation} onBack={() => setStep(1)} onPlan={() => setStep(3)} />
          )}
          {step === 3 && (
            <Plan
              idea={idea}
              evaluation={evaluation}
              onBack={() => setStep(2)}
              onAccountability={() => setStep(4)}
            />
          )}
          {step === 4 && (
            <Accountability
              idea={idea}
              evaluation={evaluation}
              progress={progress}
              setProgress={setProgress}
              checkins={checkins}
              setCheckins={setCheckins}
              onBack={() => setStep(3)}
            />
          )}
        </main>

        <Footer onOpenIntel={onOpenIntel} />
      </div>
    </div>
  );
}

function Header({ onReset, onOpenIntel }) {
  return (
    <header className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl shadow-lg shadow-indigo-500/30">
            💡
          </span>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white leading-tight">Idea Lab</h1>
            <p className="text-xs text-slate-400">Evaluate · plan · execute with Claude Cowork</p>
          </div>
        </div>
        <Button variant="ghost" className="!px-3 !py-1.5 text-xs" onClick={onReset}>
          Start over
        </Button>
      </div>
      {onOpenIntel && (
        <p className="text-xs text-slate-500">
          Spotted an opening in the{' '}
          <button onClick={onOpenIntel} className="text-indigo-400 hover:text-indigo-300 font-medium">
            Intelligence feed
          </button>
          ? Pressure-test it here before you build.
        </p>
      )}
    </header>
  );
}

function Stepper({ steps, current, reachable, onGoto }) {
  return (
    <nav className="mt-8 flex items-center">
      {steps.map((s, i) => {
        const active = i === current;
        const done = i < current;
        const canGo = reachable(i);
        return (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => onGoto(i)}
              disabled={!canGo}
              className={`flex items-center gap-2 ${canGo ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  active
                    ? 'bg-indigo-500 text-white ring-4 ring-indigo-500/20'
                    : done
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : canGo
                    ? 'bg-slate-800 text-slate-300'
                    : 'bg-slate-900 text-slate-600'
                }`}
              >
                {done ? '✓' : i + 1}
              </span>
              <span
                className={`hidden sm:block text-xs font-medium ${
                  active ? 'text-white' : 'text-slate-400'
                }`}
              >
                {s.label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-2 ${done ? 'bg-emerald-500/40' : 'bg-slate-800'}`} />
            )}
          </div>
        );
      })}
    </nav>
  );
}

function Footer({ onOpenIntel }) {
  return (
    <footer className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
      <p>Evaluation runs entirely in your browser. Nothing is uploaded.</p>
      {onOpenIntel && (
        <button onClick={onOpenIntel} className="hover:text-slate-300 transition-colors">
          ← Back to Intelligence
        </button>
      )}
    </footer>
  );
}

function BackgroundGlow() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-80 w-[40rem] rounded-full bg-indigo-600/10 blur-3xl" />
      <div className="absolute top-1/3 -right-40 h-80 w-80 rounded-full bg-violet-600/10 blur-3xl" />
    </div>
  );
}
