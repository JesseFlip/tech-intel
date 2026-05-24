# Tech Intel Setup Guide

This guide will help you set up automated daily intelligence updates for both Cyber Threat Intelligence (via AlienVault OTX) and AI News (via Claude API).

## Prerequisites

- Python 3.12+
- [uv](https://docs.astral.sh/uv/) (Python package manager)
- GitHub repository access
- API Keys:
  - AlienVault OTX API Key
  - Anthropic Claude API Key

## Getting API Keys

### AlienVault OTX API Key

1. Go to [https://otx.alienvault.com](https://otx.alienvault.com)
2. Create an account or sign in
3. Navigate to Settings → API Integration
4. Copy your API key

### Anthropic Claude API Key

1. Go to [https://console.anthropic.com](https://console.anthropic.com)
2. Create an account or sign in
3. Navigate to API Keys
4. Create a new API key and copy it

## Local Setup

### 1. Install Dependencies

```bash
# Navigate to the pipeline directory
cd pipeline

# Install dependencies using uv
uv sync
```

### 2. Configure API Keys

Create API key files in the project root (these files are gitignored):

```bash
# From the project root directory
echo "your-otx-api-key-here" > otx_api_key
echo "your-anthropic-api-key-here" > anthropic_api_key
```

Alternatively, set environment variables:

```bash
export OTX_API_KEY="your-otx-api-key-here"
export ANTHROPIC_API_KEY="your-anthropic-api-key-here"
```

### 3. Test the Integration

Test each component individually:

```bash
# Test OTX cyber intelligence fetcher
cd pipeline
uv run python -m intel_pipeline.otx_fetcher --output ../public/cyber-intel.json

# Test Claude AI news fetcher
uv run python -m intel_pipeline.ai_news_fetcher --output ../public/ai-intel.json --archive

# Test full unified update
uv run python -m intel_pipeline.update_intel --output-dir ../public
```

### 4. Verify Output

Check that the following files were created:

- `public/cyber-intel.json` - Latest cyber threat intelligence
- `public/ai-intel.json` - Latest AI news
- `public/archives/cyber-intel/` - Cyber intel archive
- `public/archives/ai-news/` - AI news archive

## GitHub Actions Setup

### 1. Add GitHub Secrets

Go to your GitHub repository:

1. Navigate to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add the following secrets:
   - `OTX_API_KEY` - Your AlienVault OTX API key
   - `ANTHROPIC_API_KEY` - Your Anthropic Claude API key

### 2. Enable GitHub Actions

1. Go to **Actions** tab in your repository
2. Enable GitHub Actions if not already enabled
3. The workflow file `.github/workflows/daily-intel-update.yml` will automatically run daily at 6 AM UTC

### 3. Manual Trigger

You can manually trigger an update:

1. Go to **Actions** tab
2. Click on **Daily Intelligence Update** workflow
3. Click **Run workflow**
4. Optionally select:
   - Update only cyber intel
   - Update only AI news
   - Or both (default)

## Usage

### Command Line Options

#### OTX Cyber Intelligence Fetcher

```bash
uv run python -m intel_pipeline.otx_fetcher [OPTIONS]

Options:
  --limit INT          Number of pulses to fetch (default: 4)
  --days INT           Fetch pulses from last N days (default: 7)
  --output PATH        Output file path (default: public/cyber-intel.json)
  --api-key TEXT       OTX API key (optional, can use env var)
```

#### Claude AI News Fetcher

```bash
uv run python -m intel_pipeline.ai_news_fetcher [OPTIONS]

Options:
  --count INT          Number of news items to fetch (default: 4)
  --output PATH        Output file path (default: public/ai-intel.json)
  --archive            Archive the news items
  --archive-dir PATH   Archive directory (default: public/archives/ai-news)
  --api-key TEXT       Anthropic API key (optional, can use env var)
  --model TEXT         Claude model to use (default: claude-3-7-sonnet-20250219)
```

#### Unified Update Script

```bash
uv run python -m intel_pipeline.update_intel [OPTIONS]

Options:
  --cyber-only         Update only cyber intel
  --ai-only            Update only AI news
  --cyber-limit INT    Number of cyber items (default: 4)
  --ai-count INT       Number of AI items (default: 4)
  --cyber-days INT     Days to look back for cyber intel (default: 7)
  --output-dir PATH    Output directory (default: public)
  --no-archive         Disable archiving
  --otx-key TEXT       OTX API key
  --claude-key TEXT    Claude API key
```

## Archive Navigation

The dashboard includes an archive viewer for both intelligence feeds:

1. Click the **Archive** button on either the Cyber Intelligence or AI Intelligence section
2. Browse historical intelligence briefs by date
3. Click on a date to view the archived items from that day

Archives are stored in:
- `public/archives/cyber-intel/` - Cyber threat intelligence archives
- `public/archives/ai-news/` - AI news archives

Each archive includes:
- Date-stamped JSON files (e.g., `2026-05-23.json`)
- An `index.json` file for easy navigation

## Automation Schedule

The GitHub Actions workflow runs:
- **Daily at 6:00 AM UTC** (1 AM EST / 10 PM PST)
- Can be manually triggered anytime via GitHub Actions UI

## Troubleshooting

### API Key Issues

If you get API key errors:

1. Verify your API keys are valid
2. Check that secrets are properly set in GitHub
3. Ensure key files are in the correct location (project root)
4. Check environment variables are exported

### No Data Returned

If no intelligence items are returned:

**For OTX:**
- Verify you have subscribed to pulses on [otx.alienvault.com](https://otx.alienvault.com)
- Try increasing the `--days` parameter
- Check OTX API status

**For Claude:**
- Verify your API key has sufficient credits
- Check Anthropic API status
- Review logs for specific error messages

### Archive Not Showing

If archives don't appear in the UI:

1. Verify archive files exist in `public/archives/`
2. Check that `index.json` was created
3. Clear browser cache
4. Check browser console for errors

## Support

For issues or questions:
- Check GitHub repository issues
- Review workflow run logs in Actions tab
- Verify all prerequisites are met

## Security Notes

- **Never commit API keys** to the repository
- Use GitHub Secrets for production
- Use environment variables or key files for local development
- Key files are already in `.gitignore`
