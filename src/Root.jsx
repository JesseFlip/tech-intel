// Root.jsx
// Top-level switch between the new Idea Evaluator app (default) and the existing
// Tech Intel Dashboard. Keeps both reachable without either disturbing the other.

import { useState, lazy, Suspense } from 'react';
import IdeaEvaluatorApp from './ideaEvaluator/IdeaEvaluatorApp.jsx';

const Dashboard = lazy(() => import('./App.jsx'));

export default function Root() {
  const [view, setView] = useState('evaluator');

  if (view === 'dashboard') {
    return (
      <Suspense
        fallback={<div className="min-h-screen flex items-center justify-center text-slate-400">Loading…</div>}
      >
        <button
          onClick={() => setView('evaluator')}
          className="fixed top-4 left-4 z-50 rounded-lg bg-slate-800/90 backdrop-blur px-3 py-1.5 text-xs font-semibold text-slate-100 border border-slate-700 hover:bg-slate-700 transition-colors"
        >
          ← Idea Evaluator
        </button>
        <Dashboard />
      </Suspense>
    );
  }

  return <IdeaEvaluatorApp onOpenDashboard={() => setView('dashboard')} />;
}
