# Worth It? — Idea Evaluator & Accountability Coach

A self-contained app that helps you decide whether an idea is **truly worthwhile**
to pursue as an **app, business, or subscription service** — and, if it is, turns
that decision into a concrete plan you execute with **Claude Cowork**, building the
skills you need and holding you accountable along the way.

It runs entirely in the browser. There is no backend and no API key required — the
scoring is transparent rubric math, and Claude Cowork is integrated through
ready-to-paste prompts you take into a Cowork session to actually do the work.

## The flow

1. **Describe** — name the idea, who it's for, the problem it solves, and the
   shape you imagine (app / business / subscription).
2. **Assess** — score it honestly 1–5 across ten market dimensions, then four
   personal "is it worth it to *me*" dimensions.
3. **Verdict** — get a likelihood-of-success score, a personal-worthwhileness
   score, a per-shape breakdown, green/red flags, your highest-leverage moves,
   and a clear **Pursue / Refine / Reconsider** call with the reasoning.
4. **Plan** — if it's worth pursuing, get a phased plan (Validate → MVP → Launch
   → Grow) whose early experiments target the idea's specific weak spots, plus
   copy-paste **Claude Cowork** setup: a master kickoff, a project per phase, and
   reusable Cowork skills (customer-interview synthesizer, MVP spec writer, GTM
   tester, retention coach, weekly accountability coach).
5. **Accountability** — the plan's milestones become a checkable tracker with a
   weekly check-in log and a streak counter, all saved on your device.

## How the score works

`evaluationEngine.js` weights each dimension differently per model type (e.g.
**Retention** dominates for subscriptions, **Feasibility** and **Distribution**
matter more for apps) and normalises to a 0–100 score. Critical dimensions
(Problem, Willingness to Pay, and Retention for subscriptions) act as hard caps:
if one is broken, the idea can't earn a clean "go" no matter the average. The
verdict requires **both** a credible path to success and that it's worth it to
you personally — a great idea you won't stick with, and a passion project no one
will pay for, both fail honestly.

## Files

| File | Responsibility |
| --- | --- |
| `evaluationEngine.js` | Rubric, weighting, scoring, verdict logic (pure functions) |
| `planGenerator.js` | Phased plan, milestones, skills — adaptive to weak dimensions |
| `coworkTemplates.js` | Generates copy-paste Claude Cowork prompts & project scaffolds |
| `storage.js` | localStorage persistence (device-only) |
| `ui.jsx` | Shared presentational components |
| `IdeaEvaluatorApp.jsx` | Step orchestration, state, persistence |
| `steps/*` | One component per step |

This is the **Idea Lab** workspace of the unified Tech Intel product. `src/Shell.jsx`
provides the shared brand and the global nav that switches between **Intelligence**
(the macro/cyber/AI dashboard in `src/App.jsx`) and **Idea Lab**; `src/Root.jsx`
wires them together and remembers the active workspace. The product tells one
story: market & tech *signal* → *ideas* worth building → *execution* with Cowork.
