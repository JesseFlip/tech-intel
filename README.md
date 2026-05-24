# Tech Intel Dashboard

A live intelligence dashboard providing automated daily updates on:
- **Cyber Threat Intelligence** - Powered by AlienVault OTX
- **AI & Emerging Technology News** - Powered by Claude API

## Features

- ✅ **Auto-updating Intelligence Feeds** - Daily automated updates via GitHub Actions
- ✅ **Archive System** - Browse historical intelligence briefs with easy navigation
- ✅ **Real-time Market Data** - Live telemetry dashboard with macro indicators
- ✅ **Professional Intelligence Briefs** - Curated, analyst-ready summaries
- ✅ **Clean, Modern UI** - Dark mode dashboard with tooltips and animations

## Quick Start

### 1. Setup API Keys

You'll need two API keys:

1. **AlienVault OTX API Key** - Get it from [otx.alienvault.com](https://otx.alienvault.com/settings)
2. **Anthropic Claude API Key** - Get it from [console.anthropic.com](https://console.anthropic.com)

### 2. Local Development

```bash
# Install frontend dependencies
npm install

# Set up Python pipeline
cd pipeline
uv sync

# Configure API keys
echo "your-otx-api-key" > ../otx_api_key
echo "your-anthropic-api-key" > ../anthropic_api_key

# Test the pipeline
uv run python -m intel_pipeline.update_intel --output-dir ../public

# Start the dev server
cd ..
npm run dev
```

### 3. Deploy with GitHub Actions

1. Fork this repository
2. Add GitHub Secrets:
   - `OTX_API_KEY` - Your AlienVault OTX API key
   - `ANTHROPIC_API_KEY` - Your Anthropic Claude API key
3. Enable GitHub Actions
4. The workflow will run daily at 6 AM UTC

See [SETUP.md](./SETUP.md) for detailed setup instructions.

## Architecture

### Intelligence Pipeline (`pipeline/`)

Python-based intelligence fetchers:

- **`otx_fetcher.py`** - Fetches cyber threat intelligence from AlienVault OTX
- **`ai_news_fetcher.py`** - Fetches AI news using Claude API with web search
- **`update_intel.py`** - Unified orchestrator for all intelligence feeds

### Frontend (`src/`)

React-based dashboard:

- **`App.jsx`** - Main dashboard with live telemetry and intelligence briefs
- **`ArchiveViewer.jsx`** - Historical intelligence archive browser

### Automation (`.github/workflows/`)

- **`daily-intel-update.yml`** - Automated daily updates at 6 AM UTC
- **`deploy.yml`** - Deployment workflow

## Usage

### Manual Update

```bash
cd pipeline

# Update both feeds
uv run python -m intel_pipeline.update_intel --output-dir ../public

# Update only cyber intel
uv run python -m intel_pipeline.update_intel --cyber-only --output-dir ../public

# Update only AI news
uv run python -m intel_pipeline.update_intel --ai-only --output-dir ../public
```

### GitHub Actions

Trigger manually via GitHub UI:

1. Go to **Actions** tab
2. Select **Daily Intelligence Update**
3. Click **Run workflow**

## Data Format

Intelligence items follow this structure:

```json
[
  {
    "title": "Brief headline (10-15 words)",
    "content": "Detailed summary paragraph explaining significance (60-80 words)",
    "linkText": "Read Full Article →",
    "url": "https://source-url.com"
  }
]
```

Output files:
- `public/cyber-intel.json` - Latest cyber threat intelligence
- `public/ai-intel.json` - Latest AI news
- `public/archives/` - Historical archives organized by date

## Archive System

Archives are automatically created for each update:

- **Cyber Intel Archives**: `public/archives/cyber-intel/`
- **AI News Archives**: `public/archives/ai-news/`

Each archive includes:
- Date-stamped files (e.g., `2026-05-23.json`)
- Archive index for navigation (`index.json`)

Browse archives via the **Archive** button on the dashboard.

## Stack

**Frontend:**
- React + Vite
- TailwindCSS
- Custom animations & ticker

**Backend/Pipeline:**
- Python 3.12+
- [OTXv2](https://github.com/AlienVault-OTX/OTX-Python-SDK) - AlienVault OTX SDK
- [Anthropic](https://docs.anthropic.com) - Claude API
- [uv](https://docs.astral.sh/uv/) - Python package manager

**Automation:**
- GitHub Actions
- Scheduled workflows (cron)

## Configuration

### Pipeline Options

See [SETUP.md](./SETUP.md) for all command-line options and configuration details.

### Schedule

Default schedule: **Daily at 6:00 AM UTC**

Modify in `.github/workflows/daily-intel-update.yml`:

```yaml
schedule:
  - cron: '0 6 * * *'  # Adjust time here
```

## Security

- API keys are **never committed** to the repository
- GitHub Secrets for production
- Local key files for development (gitignored)
- Automated updates run in isolated GitHub Actions environment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

- **Documentation**: [SETUP.md](./SETUP.md)
- **Issues**: [GitHub Issues](https://github.com/JesseFlip/tech-intel/issues)
- **OTX Docs**: [https://otx.alienvault.com/api](https://otx.alienvault.com/api)
- **Claude Docs**: [https://docs.anthropic.com](https://docs.anthropic.com)

---

Built with ❤️ for professional intelligence analysis
