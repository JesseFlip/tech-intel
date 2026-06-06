// Step 2 — The assessment. Two rounds of honest 1–5 ratings: first the market /
// success dimensions, then the personal "is it worthwhile to me" dimensions.

import { useMemo } from 'react';
import { Card, RatingScale, Button, Pill } from '../ui.jsx';
import { DIMENSIONS, WORTH_DIMENSIONS } from '../evaluationEngine.js';

export default function Assessment({ ratings, setRatings, worthRatings, setWorthRatings, onNext, onBack }) {
  const setR = (id, v) => setRatings({ ...ratings, [id]: v });
  const setW = (id, v) => setWorthRatings({ ...worthRatings, [id]: v });

  const answered = useMemo(
    () => DIMENSIONS.filter((d) => ratings[d.id]).length + WORTH_DIMENSIONS.filter((d) => worthRatings[d.id]).length,
    [ratings, worthRatings]
  );
  const total = DIMENSIONS.length + WORTH_DIMENSIONS.length;
  const complete = answered === total;

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Score it honestly</h2>
          <p className="text-sm text-slate-400 mt-1">
            Rate each factor 1–5. Be brutally honest — a flattering score only fools you.
          </p>
        </div>
        <Pill tone={complete ? 'go' : 'indigo'}>
          {answered}/{total} answered
        </Pill>
      </header>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Part 1 — Will it succeed in the market?
        </h3>
        {DIMENSIONS.map((dim) => (
          <Card key={dim.id} className="!p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-slate-100">{dim.label}</h4>
                  {dim.critical && <Pill tone="nogo">Make-or-break</Pill>}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{dim.hint}</p>
              </div>
            </div>
            <RatingScale value={ratings[dim.id]} onChange={(v) => setR(dim.id, v)} anchors={dim.anchors} />
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Part 2 — Is it worthwhile for <em>you</em>?
        </h3>
        {WORTH_DIMENSIONS.map((dim) => (
          <Card key={dim.id} className="!p-4">
            <h4 className="font-semibold text-slate-100">{dim.label}</h4>
            <p className="text-xs text-slate-400 mt-0.5 mb-3">{dim.hint}</p>
            <RatingScale value={worthRatings[dim.id]} onChange={(v) => setW(dim.id, v)} anchors={dim.anchors} />
          </Card>
        ))}
      </section>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <Button onClick={onNext} disabled={!complete}>
          {complete ? 'See the verdict →' : `Answer all ${total} to continue`}
        </Button>
      </div>
    </div>
  );
}
