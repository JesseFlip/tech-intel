# AGENTS.md — Tech & Finance Intelligence Digest

> Instructions for autonomous coding agents (Antigravity, Claude Code, Cursor, etc.) working in this repository. This project blends AI, Cybersecurity, and Financial Market intelligence into a daily automated digest. Read this file in full before planning any task.

---

## 1. Mission

You are working on the **Tech & Finance Intelligence Digest** — a unified platform that provides high-signal news across three critical pillars:
- **AI & Emerging Tech:** Model releases, technical breakthroughs, policy shifts.
- **Cybersecurity:** CVEs, active breaches, federal mandates, defensive trends.
- **Financial Markets:** Daily market overview, tech sector stock trends, and AI-driven market analysis.

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
│   ├── src/intel_pipeline/
│   │   ├── sources.py     # Unified source management
│   │   ├── sentiment.py   # Ticker and Fear & Greed tracking
│   │   ├── generate.py    # Orchestrator
│   │   └── models/        # Pydantic schemas
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

---

## 3. Operating principles (read every task)

1. **Plan before you build.** For any task larger than a single-file edit, output a 3–7 bullet plan and stop. Wait for approval unless explicitly told to "just ship it."
2. **Smallest viable change.** Prefer a 20-line patch over a 200-line refactor.
3. **No silent scope creep.** New dependency, env var, or external service → call it out before adding it.
4. **Real over mocked.** Don't stub a function and call it done.
5. **Cite sources in code.** APIs change.
6. **Fail loud.** No bare `except:`. No swallowed errors. Use the logger.
7. **Stay in your lane.** A frontend task does not touch `pipeline/`. A pipeline task does not touch `src/`.

---

## 4. Technical Architecture

### Pipeline (`pipeline/`)
- **Engine:** Uses `google-genai` (Gemini 2.5 Flash) with **Google Search grounding**.
- **Search Grounding is Mandatory:** Use `types.Tool(google_search=types.GoogleSearch())` for real-time accuracy.
- **Source Selection:** Blended pool including technical sources (CISA, BleepingComputer) and mainstream financial outlets (Bloomberg, Yahoo Finance, CNBC).

### Frontend (`src/`)
- **Framework:** React + Vite (JavaScript).
- **Styling:** Tailwind CSS + Lucide React.
- **Data Loading:** Fetches `public/digests/latest.json` at runtime.
- **Market Pulse:** Dashboard header with real-time sentiment icons and Fear & Greed status.

---

## 5. The Data Contract (`public/digests/`)

All data must conform to the `FinancialReport` schema.

```json
{
  "schema_version": 1,
  "date": "YYYY-MM-DD",
  "generated_at": "2026-05-10T07:00:00Z",
  "sentiment_pulse": {
    "fear_greed": "string",
    "retail_sentiment": "string",
    "tickers": [
      { "symbol": "NVDA", "sentiment": "BULLISH", "price_context": "..." }
    ]
  },
  "sections": {
    "ai": { "prose": "...", "items": [...] },
    "cybersecurity": { "vulnerabilities": [...], "breaches": [...], "policy": "..." },
    "financial": {
      "market_sentiment": "BULLISH | BEARISH | NEUTRAL",
      "executive_summary": "...",
      "key_drivers": [...],
      "news_items": [...],
      "insights": [...]
    }
  }
}
```

---

## 6. Pipeline Tech Stack & Conventions

- **Language:** Python 3.12+. Type hints mandatory.
- **Package manager:** `uv`.
- **HTTP client:** `httpx` (async).
- **LLM client:** Google GenAI SDK (`google-genai`).
- **Data validation:** Pydantic v2.
- **Tests:** `pytest`.

---

## 7. Workflows & Deployment

- **`deploy.yml`**: Builds React app and deploys to GitHub Pages on push to `main`.
- **`ingest.yml`**: Cron job that runs the pipeline and commits new JSON to `main`.
- **Secrets:** `GEMINI_API_KEY` must be in repo Actions secrets.

---

## 8. Definition of Done

- Code lints clean (`ruff` for Python, ESLint for JS).
- New code has tests.
- Public functions have docstrings.
- A real run was executed (`uv run ...` or `npm run build`) and output is sane.
- If the JSON contract changed, both pipeline and frontend were updated.

---

*Last updated: 2026-05-11. (Blended Tech & Finance update)*
