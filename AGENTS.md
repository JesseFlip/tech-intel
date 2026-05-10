# AGENTS.md

> Instructions for autonomous coding agents (Antigravity, Claude Code, Cursor, etc.) working in this repository. Read this file in full before planning any task. If anything here conflicts with a user instruction, surface the conflict and ask.

---

## 1. Mission

You are working on an **AI & Cybersecurity News Digest** — a hybrid project with two cooperating parts in a single repository:

- A **Python pipeline** that ingests trusted security and AI sources, deduplicates and ranks stories, and produces a daily digest as structured JSON.
- A **React + Vite frontend** that reads those JSON files and renders the digest as a static site deployed to GitHub Pages.

The two parts meet at one well-defined contract: digest JSON files in `public/digests/`. Everything else about them is independent.

**Primary user:** one technical reader who already knows the field. Optimize for signal density, not breadth.

**Non-goals:** SEO content farms, listicles, generic explainers, marketing copy, multi-tenant features.

---

## 2. Repo shape (read before doing anything)

```
/
├── .github/workflows/
│   ├── deploy.yml         # builds React app, deploys to Pages on push to main
│   └── ingest.yml         # cron: runs pipeline daily, commits new digest JSON
├── pipeline/              # Python pipeline — self-contained
│   ├── pyproject.toml
│   ├── uv.lock
│   ├── src/cyberdigest/
│   │   ├── sources/
│   │   ├── fetchers/
│   │   ├── normalize/
│   │   ├── dedupe/
│   │   ├── rank/
│   │   ├── digest/
│   │   ├── publish/
│   │   ├── models/
│   │   ├── prompts/
│   │   └── cli.py
│   ├── tests/
│   └── config/sources.yaml
├── public/digests/        # pipeline output — served as static JSON by Vite
│   ├── latest.json
│   ├── index.json
│   └── YYYY-MM-DD.json
├── src/                   # React app (Vite default location)
├── index.html
├── vite.config.js
├── package.json
├── README.md
└── AGENTS.md
```

**Critical rule:** the pipeline lives entirely under `pipeline/`. Python tooling, dependencies, lint config, and tests stay scoped to that directory. The React app at the root never imports from `pipeline/` and never runs Python. The only thing the frontend reads from the pipeline is JSON files in `public/digests/`.

If a task crosses this boundary (e.g., "have the React app trigger ingestion"), stop and ask. That's an architectural change, not a feature.

---

## 3. Operating principles (read every task)

1. **Plan before you build.** For any task larger than a single-file edit, output a 3–7 bullet plan and stop. Wait for approval unless explicitly told to "just ship it."
2. **Smallest viable change.** Prefer a 20-line patch over a 200-line refactor. If you're tempted to rewrite a module, ask first.
3. **No silent scope creep.** New dependency, env var, or external service → call it out before adding it.
4. **Real over mocked.** Don't stub a function and call it done. If a live source is unreachable in your environment, write the integration plus a fixture-backed test, then say so.
5. **Cite sources in code.** When implementing logic that depends on an API contract or vendor quirk, drop a comment with the doc URL and date you read it. APIs change.
6. **Fail loud.** No bare `except:`. No swallowed errors. No `print` for diagnostics — use the logger.
7. **One job per PR.** Bundle commits within a feature, never bundle unrelated features. If you find a bug while doing feature work, file it as a TODO and keep going unless it blocks you.
8. **Ask when ambiguous, decide when not.** If two reasonable interpretations imply different code, ask. If one is obviously dominant, proceed and state your assumption inline.
9. **Stay in your lane.** A frontend task does not touch `pipeline/`. A pipeline task does not touch `src/`. Cross-cutting changes (the JSON contract, workflows) require explicit acknowledgment in the plan.

---

## 4. Pipeline architecture

```
sources/  → fetchers/   → normalize/  → dedupe/  → rank/  → digest/  → publish/
(URLs)     (HTTP+RSS)    (schema)      (cluster)  (LLM)    (LLM)      (JSON to public/digests/)
```

- **Source layer:** declarative list of feeds + scrapers in `pipeline/config/sources.yaml`. One adapter per source type (RSS, JSON API, HTML scrape).
- **Normalize layer:** every item conforms to the `Story` schema (`pipeline/src/cyberdigest/models/story.py`). No source-specific fields leak past this boundary.
- **Dedupe layer:** cluster by URL canonicalization first, then title shingling (Jaccard ≥ 0.7), then embedding similarity (cosine ≥ 0.85) as a tiebreaker.
- **Rank layer:** LLM-scored on a 1–5 importance rubric (`pipeline/src/cyberdigest/prompts/rank.md`). Batch in groups of 10 to cap LLM calls.
- **Digest layer:** LLM composes prose sections per category against strict word budgets. Build fails if budgets are exceeded.
- **Publish layer:** writes JSON to `public/digests/`. See §6 for the contract.

The flow is a DAG, not a pipeline of mutations. Each stage takes immutable input and returns new output. No stage writes to a global store.

---

## 5. Pipeline tech stack & conventions

- **Language:** Python 3.12+. Type hints mandatory on public functions.
- **Package manager:** `uv`. Don't introduce `poetry` or raw `pip`.
- **HTTP client:** `httpx` (async). Don't use `requests` for new code.
- **LLM client:** Anthropic SDK. Default model: `claude-sonnet-4-5` for ranking/dedupe, `claude-opus-4-7` for digest composition. Read model IDs from env, never hardcode.
- **Data validation:** Pydantic v2. All cross-stage data passes through a model.
- **Config:** YAML for declarative (sources, rubrics), `.env` for secrets. Never commit `.env`.
- **Logging:** `structlog`, JSON output in CI, pretty in dev. Log level via env.
- **Tests:** `pytest`, `pytest-asyncio`. Aim for >80% on dedupe and rank — they're where bugs hide.
- **Lint/format:** `ruff` (lint + format). `mypy --strict` on `pipeline/src/`.
- **CLI entry:** `pipeline/src/cyberdigest/cli.py`, exposed as a `uv run` script. Should be invokable as `cd pipeline && uv run cyberdigest ingest`.

---

## 6. The contract: digest JSON files

This is the only interface between pipeline and frontend. Treat it like a public API.

**Files written by the pipeline to `public/digests/`:**

- `YYYY-MM-DD.json` — one digest per run, named by date.
- `latest.json` — copy (not symlink — the Vite build needs a real file) of the most recent digest.
- `index.json` — array of `{date, slug, headline}` for every available digest, sorted newest-first.

**Schema for a single digest file:**

```json
{
  "schema_version": 1,
  "date": "2026-05-10",
  "generated_at": "2026-05-10T07:00:00Z",
  "tldr": ["string", "string", "string"],
  "sections": {
    "ai": {
      "prose": "string",
      "items": [{"headline": "string", "url": "string", "source": "string"}]
    },
    "cybersecurity": {
      "vulnerabilities": [
        {"cve": "string", "cvss": 0.0, "product": "string", "status": "string", "url": "string"}
      ],
      "breaches": [{"org": "string", "scale": "string", "url": "string"}],
      "policy_prose": "string"
    }
  },
  "worth_a_click": [{"title": "string", "url": "string", "framing": "string"}]
}
```

**Rules on this contract:**
- The schema lives in `pipeline/src/cyberdigest/models/digest.py` (Pydantic) **and** mirrored as JSON Schema at `public/digests/_schema.json`. They must agree.
- Breaking the schema requires a migration: bump `schema_version` and update the frontend reader in the same PR.
- The frontend never assumes fields beyond this schema. New field? Add it to the schema first, then implement.

---

## 7. Frontend tech stack & conventions

- **Framework:** React + Vite. JavaScript (not TypeScript) unless explicitly migrated.
- **Styling:** Tailwind, as currently configured. Don't add CSS-in-JS or styled-components.
- **Routing:** if `react-router-dom` is added, use the SPA-on-Pages 404 fallback (`public/404.html`).
- **Data loading:** fetch digest JSON from `${import.meta.env.BASE_URL}digests/latest.json` at runtime. Don't import JSON statically — that bloats the bundle and breaks the archive view.
- **State:** local component state and `useState`/`useReducer` are enough. No Redux, no Zustand, no React Query unless justified.
- **Build:** `npm run build`. Output goes to `dist/`. The deploy workflow handles the rest.
- **Lint:** ESLint config that ships with the Vite template. Don't replace it.
- **No browser storage** unless explicitly asked. No localStorage, no IndexedDB.

---

## 8. Source handling rules (pipeline only — read carefully)

The quality of the digest depends entirely on source curation. Treat sources as code, not config.

### Trusted by default
- CISA advisories and KEV catalog
- The Hacker News, BleepingComputer, KrebsOnSecurity, eSecurityPlanet
- Vendor advisories: Microsoft MSRC, Palo Alto, Cisco Talos, Ivanti, Atlassian
- Anthropic, OpenAI, Google DeepMind, Meta AI official blogs
- arXiv (cs.CR, cs.AI) — only if cross-referenced by a human-edited source

### Treat with caution
- Aggregators that re-headline (chase the link to the original)
- AI-generated news sites (heuristic: no byline, vague "team" attribution, suspicious cadence)
- LinkedIn/Medium posts — usable as primary only when the author is the subject

### Never as a primary source
- Reddit threads, forum posts, Twitter/X screenshots, generic SEO sites

### Copyright & attribution
- **Never reproduce article text.** Paraphrase always. Quotes ≤ 15 words, used once per source maximum.
- Every story links to the original source. No ad-redirect wrappers.
- Don't summarize behind paywalls beyond the visible excerpt.

### CVE & advisory normalization
- Always extract: CVE ID, CVSS score, affected products, exploit status, CISA KEV inclusion.
- If a story mentions a CVE without an ID, log a warning and flag for review — don't guess.

---

## 9. Workflows (`.github/workflows/`)

- **`deploy.yml`** triggers on push to `main` and `workflow_dispatch`. Builds the React app and deploys to GitHub Pages. Don't gate on tests here — keep deploy fast.
- **`ingest.yml`** triggers on a daily cron (UTC) and `workflow_dispatch`. Runs the pipeline, commits the new digest JSON to `main`. The commit naturally triggers `deploy.yml`, which ships the new content. No webhook, no extra glue.
- The ingest workflow uses a deploy key or fine-grained PAT to commit. Never use the default `GITHUB_TOKEN` — its commits don't trigger downstream workflows by default.
- Pipeline secrets (Anthropic API key, source credentials if any) live in repo Actions secrets. Never read them at frontend build time.

---

## 10. Testing

**Pipeline:**
- Every adapter (`sources/*.py`) ships with a fixture-based test using a saved HTTP response. No live calls in CI.
- Dedupe gets a corpus of known-duplicate and known-distinct pairs. Regressions on either set fail the build.
- Rank is tested against 50 human-labeled stories; track Cohen's kappa target ≥ 0.6.
- Digest composition is tested for structural conformance (sections present, word budgets respected, schema valid), not prose quality.
- Run `cd pipeline && uv run pytest -q` before claiming a pipeline task done.

**Frontend:**
- Component tests with Vitest + React Testing Library. Optional but encouraged.
- The one mandatory test: a render test against a fixture digest JSON in `tests/fixtures/`. If the schema changes and breaks rendering, this catches it.
- Run `npm test` before claiming a frontend task done.

---

## 11. Git & workflow

- Branch naming: `feat/<short>`, `fix/<short>`, `chore/<short>`. Prefix with `pipeline/` or `web/` if scope is one-sided: `feat/pipeline/add-msrc-adapter`, `fix/web/archive-link`.
- Commit messages: imperative, present tense.
- Never force-push `main`. Never commit `.env`, `dist/`, `pipeline/.venv/`, or fixture caches.
- PR description: what changed, why, how it was tested, follow-ups.
- Schema-affecting changes get an explicit "Schema change: yes" line in the PR description.

---

## 12. Definition of done

A task is done when **all** of the following are true:
- Code in the affected stack lints clean and types check (`ruff` + `mypy --strict` for pipeline; ESLint for frontend).
- New code has tests; existing tests still pass.
- Public functions have docstrings explaining intent.
- README or relevant doc updated if behavior changed.
- A real run was executed (`uv run cyberdigest ingest --dry-run` for pipeline, `npm run build` for frontend) and the output looked sane. State what you ran.
- If the JSON contract changed, both pipeline schema and frontend reader were updated in the same PR.

If any of these isn't true, say so explicitly. Don't claim done when it isn't.

---

## 13. Don'ts

- Don't introduce a database. SQLite via `sqlite3` is fine for caches; anything bigger needs approval.
- Don't add a backend server. The pipeline writes static JSON; that is the API surface.
- Don't add observability SaaS (Datadog, Sentry, etc.). Logs to stdout are enough.
- Don't refactor working code "for clarity" without a ticket asking for it.
- Don't use `requests`, `flask`, or `pandas` (use `polars` if tabular work appears).
- Don't add TypeScript to the frontend without an explicit migration task.
- Don't import pipeline code from the frontend or vice versa.
- Don't add a new external dependency without justifying it in the PR. "Convenience" is not a justification.
- Don't expose the Anthropic key to the browser. Ever. The frontend reads pre-generated JSON only.

---

## 14. When you're stuck

In order:
1. Re-read the relevant section of this file.
2. Check `docs/decisions/` for prior ADRs.
3. Read the actual code in the affected module.
4. If still stuck after ~15 minutes, stop and ask. Ship a question with: what you tried, what you expected, what happened.

---

*Last updated: 2026-05-10. If you change a rule here, update the date and call it out in your PR.*
