// Step 1 — Describe the idea. Captures the minimum context the engine and the
// Cowork prompts need to be specific rather than generic.

import { Card, Field, Button } from '../ui.jsx';
import { MODEL_TYPES } from '../evaluationEngine.js';

export default function IdeaInput({ idea, setIdea, onNext }) {
  const update = (key) => (e) => setIdea({ ...idea, [key]: e.target.value });
  const canContinue = idea.name.trim() && idea.oneLiner.trim();

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-bold text-white">Describe your idea</h2>
        <p className="text-sm text-slate-400 mt-1">
          A few honest sentences. This shapes both the evaluation and the Claude Cowork plan you’ll get.
        </p>
      </header>

      <Card className="space-y-5">
        <Field
          label="Name your idea"
          placeholder="e.g. RouteWise — smart delivery routing for local couriers"
          value={idea.name}
          onChange={update('name')}
        />
        <Field
          label="One-liner"
          hint="Explain it to a smart friend in one sentence."
          placeholder="An app that plans the fastest multi-stop route and re-orders drops in real time."
          value={idea.oneLiner}
          onChange={update('oneLiner')}
        />
        <div className="grid sm:grid-cols-2 gap-5">
          <Field
            as="textarea"
            label="Who is it for?"
            hint="The specific target customer."
            placeholder="Independent couriers and small same-day delivery firms."
            value={idea.customer}
            onChange={update('customer')}
          />
          <Field
            as="textarea"
            label="What problem does it solve?"
            hint="The pain you remove."
            placeholder="Drivers waste fuel and time planning routes by hand and miss delivery windows."
            value={idea.problem}
            onChange={update('problem')}
          />
        </div>

        <div>
          <span className="block text-sm font-medium text-slate-200 mb-2">
            What shape do you imagine it taking?
          </span>
          <div className="grid sm:grid-cols-3 gap-3">
            {MODEL_TYPES.map((m) => {
              const selected = idea.model === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setIdea({ ...idea, model: m.id })}
                  className={`text-left rounded-xl border p-4 transition-all ${
                    selected
                      ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/40'
                      : 'border-slate-700 bg-slate-950/40 hover:border-slate-600'
                  }`}
                >
                  <span className="block font-semibold text-slate-100">{m.label}</span>
                  <span className="block text-xs text-slate-400 mt-1">{m.blurb}</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Not sure? Pick the closest — the evaluation scores all three and tells you which fits best.
          </p>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!canContinue}>
          Start the evaluation →
        </Button>
      </div>
    </div>
  );
}
