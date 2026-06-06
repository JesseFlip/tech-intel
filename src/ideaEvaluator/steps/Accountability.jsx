// Step 5 — Accountability. The plan's milestones become a checkable tracker, and
// a weekly check-in log builds a streak. All persisted to localStorage by the
// parent. This is the "hold them accountable" half of the brief.

import { useMemo, useState } from 'react';
import { Card, Button, Pill, CopyBlock } from '../ui.jsx';
import { generatePlan } from '../planGenerator.js';
import { weeklyCheckinPrompt } from '../coworkTemplates.js';
import { MODEL_TYPES } from '../evaluationEngine.js';

export default function Accountability({
  idea,
  evaluation,
  progress,
  setProgress,
  checkins,
  setCheckins,
  onBack,
}) {
  const enrichedIdea = useMemo(
    () => ({ ...idea, modelLabel: MODEL_TYPES.find((m) => m.id === idea.model)?.label }),
    [idea]
  );
  const plan = useMemo(() => generatePlan(enrichedIdea, evaluation), [enrichedIdea, evaluation]);

  const allMilestones = plan.phases.flatMap((p, pi) =>
    p.milestones.map((m, mi) => ({ key: `${pi}:${mi}`, text: m, phase: p.title, phaseIndex: pi }))
  );
  const doneCount = allMilestones.filter((m) => progress[m.key]).length;
  const pctDone = allMilestones.length ? Math.round((doneCount / allMilestones.length) * 100) : 0;
  const streak = computeStreak(checkins);

  const toggle = (key) => setProgress({ ...progress, [key]: !progress[key] });

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-bold text-white">Accountability tracker</h2>
        <p className="text-sm text-slate-400 mt-1">
          Saved on this device. Check off milestones and log a weekly check-in to build your streak.
        </p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Milestones done" value={`${doneCount}/${allMilestones.length}`} />
        <StatCard label="Plan progress" value={`${pctDone}%`} />
        <StatCard label="Check-in streak" value={`${streak} 🔥`} />
      </div>

      <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-emerald-400 rounded-full"
          style={{ width: `${pctDone}%`, transition: 'width 0.6s ease' }}
        />
      </div>

      {/* Milestones grouped by phase */}
      {plan.phases.map((phase, pi) => (
        <Card key={phase.id}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white">
              Phase {pi}: {phase.title}
            </h3>
            <Pill tone="slate">{phase.timeframe}</Pill>
          </div>
          <ul className="space-y-2">
            {phase.milestones.map((m, mi) => {
              const key = `${pi}:${mi}`;
              const checked = !!progress[key];
              return (
                <li key={key}>
                  <button
                    onClick={() => toggle(key)}
                    className="flex items-start gap-3 text-left w-full group"
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                        checked
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-600 group-hover:border-slate-400'
                      }`}
                    >
                      {checked && '✓'}
                    </span>
                    <span className={`text-sm ${checked ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                      {m}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      ))}

      {/* Weekly check-in */}
      <CheckinLog idea={enrichedIdea} checkins={checkins} setCheckins={setCheckins} />

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          ← Back to plan
        </Button>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <Card className="!p-4 text-center">
      <div className="text-2xl font-bold text-white tabular-nums">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </Card>
  );
}

function CheckinLog({ idea, checkins, setCheckins }) {
  const [form, setForm] = useState({ done: '', blockers: '', next: '' });
  const canLog = form.done.trim() || form.next.trim();

  const add = () => {
    if (!canLog) return;
    setCheckins([{ date: new Date().toISOString(), ...form }, ...checkins]);
    setForm({ done: '', blockers: '', next: '' });
  };

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white">Weekly check-in</h3>
        <Pill tone="indigo">{checkins.length} logged</Pill>
      </div>

      <div className="space-y-3">
        {[
          ['done', 'What got done this week?'],
          ['blockers', 'What got in the way?'],
          ['next', 'Top commitment for next week?'],
        ].map(([key, label]) => (
          <label key={key} className="block">
            <span className="block text-sm text-slate-300 mb-1">{label}</span>
            <textarea
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none min-h-[60px] resize-y"
              placeholder="Be specific and honest…"
            />
          </label>
        ))}
        <Button onClick={add} disabled={!canLog}>
          Log this week’s check-in
        </Button>
      </div>

      <CopyBlock
        title="Run it with your Cowork coach"
        subtitle="Paste into Claude Cowork to be coached through the check-in."
        text={weeklyCheckinPrompt(idea)}
      />

      {checkins.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">History</h4>
          {checkins.map((c, i) => (
            <div key={i} className="rounded-lg bg-slate-950/50 border border-slate-800 p-3 text-sm">
              <div className="text-xs text-slate-500 mb-1">{new Date(c.date).toLocaleDateString()}</div>
              {c.done && (
                <p className="text-slate-300">
                  <span className="text-emerald-400">Done:</span> {c.done}
                </p>
              )}
              {c.blockers && (
                <p className="text-slate-300">
                  <span className="text-rose-400">Blocked:</span> {c.blockers}
                </p>
              )}
              {c.next && (
                <p className="text-slate-300">
                  <span className="text-indigo-400">Next:</span> {c.next}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// Streak = consecutive calendar weeks with at least one check-in, counting back
// from the most recent. A simple, forgiving "are you showing up?" measure.
function computeStreak(checkins) {
  if (!checkins.length) return 0;
  const weeks = new Set(checkins.map((c) => weekKey(new Date(c.date))));
  let streak = 0;
  const cursor = new Date();
  // Allow the current week to count even if last check-in was last week.
  for (let i = 0; i < 520; i++) {
    if (weeks.has(weekKey(cursor))) {
      streak++;
    } else if (i > 0) {
      break;
    }
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

function weekKey(d) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  // Move to Thursday of this week (ISO week anchor) for stable week numbering.
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7) + 3);
  const firstThursday = new Date(date.getFullYear(), 0, 4);
  firstThursday.setDate(firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7) + 3);
  const week = 1 + Math.round((date - firstThursday) / (7 * 24 * 3600 * 1000));
  return `${date.getFullYear()}-W${week}`;
}
