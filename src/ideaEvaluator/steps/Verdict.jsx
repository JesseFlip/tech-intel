// Step 3 — The verdict. Shows the success likelihood, personal worthwhileness,
// the per-model breakdown, green/red flags, and a clear GO / REFINE / NO-GO call
// with the reasoning behind it. This is the "truly worthwhile?" gate.

import { Card, ScoreRing, Pill, Button } from '../ui.jsx';
import { MODEL_TYPES } from '../evaluationEngine.js';

export default function Verdict({ evaluation, onBack, onPlan }) {
  if (!evaluation) return null;
  const { tier, success, worth, model, bestModel, modelScores, greenFlags, redFlags, biggestLevers, reasoning } =
    evaluation;

  const modelLabel = MODEL_TYPES.find((m) => m.id === model)?.label ?? model;
  const showBetterFit = bestModel !== model && modelScores[bestModel] - modelScores[model] >= 8;

  return (
    <div className="space-y-5">
      {/* Headline verdict */}
      <Card className={`border-2 ${tierBorder(tier.tone)}`}>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ScoreRing value={success} tone={tier.tone} label="Likelihood of success" />
          <div className="flex-1 text-center sm:text-left">
            <Pill tone={tier.tone}>{verdictIcon(tier.tone)} Verdict: {tier.label}</Pill>
            <h2 className="text-2xl font-bold text-white mt-3">{tier.headline}</h2>
            <p className="text-sm text-slate-300 mt-1">
              Evaluated as {anArticle(modelLabel)} <span className="font-semibold">{modelLabel}</span>.
            </p>
          </div>
          <ScoreRing value={worth} tone="indigo" label="Worthwhile to you" />
        </div>
      </Card>

      {/* Reasoning */}
      <Card className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">The reasoning</h3>
        {reasoning.map((line, i) => (
          <p key={i} className="text-sm leading-relaxed text-slate-300">
            {line}
          </p>
        ))}
        {showBetterFit && (
          <p className="text-sm leading-relaxed text-amber-300 mt-2">
            💡 This idea actually scores higher as {anArticle(MODEL_TYPES.find((m) => m.id === bestModel)?.label)}{' '}
            <span className="font-semibold">{MODEL_TYPES.find((m) => m.id === bestModel)?.label}</span> (
            {modelScores[bestModel]}%). Consider reshaping it that way.
          </p>
        )}
      </Card>

      {/* Per-model breakdown */}
      <Card>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
          How it scores by shape
        </h3>
        <div className="space-y-3">
          {MODEL_TYPES.map((m) => (
            <div key={m.id} className="flex items-center gap-3">
              <span className="w-28 text-sm text-slate-300 shrink-0">{m.label}</span>
              <div className="flex-1 h-3 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${m.id === bestModel ? 'bg-emerald-400' : 'bg-indigo-500'}`}
                  style={{ width: `${modelScores[m.id]}%`, transition: 'width 0.9s ease' }}
                />
              </div>
              <span className="w-12 text-right text-sm font-semibold text-slate-200 tabular-nums">
                {modelScores[m.id]}%
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Flags */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-sm font-semibold text-emerald-300 mb-3">✅ Working in your favour</h3>
          {greenFlags.length ? (
            <ul className="space-y-1.5">
              {greenFlags.map((d) => (
                <li key={d.id} className="text-sm text-slate-300">
                  • {d.label}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No standout strengths yet — that’s the first thing to build.</p>
          )}
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-rose-300 mb-3">⚠️ Risks to address</h3>
          {redFlags.length ? (
            <ul className="space-y-1.5">
              {redFlags.map((d) => (
                <li key={d.id} className="text-sm text-slate-300">
                  • {d.label}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No glaring weaknesses — solid across the board.</p>
          )}
        </Card>
      </div>

      {/* Biggest levers */}
      {biggestLevers.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Your highest-leverage moves
          </h3>
          <p className="text-sm text-slate-400 mb-3">
            Improving these would move the needle most. The plan turns them into concrete experiments.
          </p>
          <div className="flex flex-wrap gap-2">
            {biggestLevers.map((d) => (
              <Pill key={d.id} tone="indigo">
                {d.label}
              </Pill>
            ))}
          </div>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          ← Adjust scores
        </Button>
        <Button onClick={onPlan}>
          {tier.id === 'nogo' ? 'See how to de-risk it →' : 'Build my plan with Claude Cowork →'}
        </Button>
      </div>
    </div>
  );
}

function tierBorder(tone) {
  return {
    go: 'border-emerald-500/40',
    refine: 'border-amber-500/40',
    nogo: 'border-rose-500/40',
  }[tone];
}

function verdictIcon(tone) {
  return { go: '🚀', refine: '🔧', nogo: '🛑' }[tone];
}

function anArticle(word = '') {
  return /^[aeiou]/i.test(word) ? 'an' : 'a';
}
