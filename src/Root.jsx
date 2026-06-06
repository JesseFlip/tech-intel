// Root.jsx
// Mounts the unified Tech Intel product: one shell, two first-class workspaces.
// Defaults to the Intelligence dashboard (restoring the original identity) with
// the Idea Lab one click away. The active workspace is remembered across visits.

import { useEffect, useState, lazy, Suspense } from 'react';
import Shell, { TABS } from './Shell.jsx';
import IdeaEvaluatorApp from './ideaEvaluator/IdeaEvaluatorApp.jsx';

const Dashboard = lazy(() => import('./App.jsx'));

const VIEW_KEY = 'tech-intel:workspace';

function loadView() {
  try {
    const v = localStorage.getItem(VIEW_KEY);
    return TABS.some((t) => t.id === v) ? v : 'intelligence';
  } catch {
    return 'intelligence';
  }
}

export default function Root() {
  const [view, setView] = useState(loadView);

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, view);
    } catch {
      /* ignore */
    }
  }, [view]);

  return (
    <Shell active={view} onChange={setView}>
      {view === 'intelligence' ? (
        <Suspense
          fallback={
            <div className="flex-grow flex items-center justify-center text-slate-400 text-sm">
              Loading intelligence…
            </div>
          }
        >
          <Dashboard />
        </Suspense>
      ) : (
        <IdeaEvaluatorApp onOpenIntel={() => setView('intelligence')} />
      )}
    </Shell>
  );
}
