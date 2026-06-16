# Gemini API Migration Guide

**Migration from Anthropic Claude to Google Gemini for intelligence feeds**

Your Tech Intel dashboard now uses Google's Gemini API instead of Anthropic's Claude API to avoid credit exhaustion issues.

---

## ✅ What Changed

### Before:
- **Claude Opus 4.8** with Anthropic's web_search server tool
- Pay-per-use pricing (you ran out of credits)

### After:
- **Gemini 2.0 Flash Thinking** with Google Search grounding
- **Free tier**: 1,500 requests/day
- **Your usage**: ~1-2 requests/day for daily updates

Both Cyber and AI feeds are now powered by Gemini with Google Search grounding, ensuring real source URLs.

---

## 🚀 Setup Instructions

### Step 1: Get Your Gemini API Key

1. Visit **[Google AI Studio](https://aistudio.google.com/apikey)**
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy the key (starts with `AIza...`)

### Step 2: Add to GitHub Secrets

1. Go to: `https://github.com/JesseFlip/tech-intel/settings/secrets/actions`
2. Click **"New repository secret"**
3. Add:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Paste your API key
4. Click **"Add secret"**

### Step 3: Test the Migration

#### Option A: Manual Workflow Trigger (Recommended)

1. Go to **Actions** tab in your repository
2. Select **"Daily Intelligence Update"**
3. Click **"Run workflow"**
4. Options:
   - Leave both unchecked for full update (cyber + AI)
   - OR check "ai_only" to test just AI feed first
5. Click **"Run workflow"**

#### Option B: Test Locally (Optional)

```powershell
# Set API key
$env:GEMINI_API_KEY = "AIzaSy...your-key-here..."

# Navigate to pipeline
cd pipeline

# Install dependencies
pip install -e .

# Test AI feed only
python -m intel_pipeline.update_intel --ai-only --output-dir ../public

# Or test full update
python -m intel_pipeline.update_intel --output-dir ../public
```

---

## 🔍 Verify It's Working

### Check GitHub Actions:

1. Go to **Actions** → Click the running workflow
2. Expand **"Update Intelligence Feeds"** step
3. Look for:

```
[INFO] Web intel fetcher (Gemini) initialized successfully
[INFO] Fetching 4 'ai' items via Gemini Google Search...
[INFO] Fetched 4 verified 'ai' items
```

### Check Your Dashboard:

1. Wait 2-3 minutes for GitHub Pages to deploy
2. Visit: `https://jesseflip.github.io/tech-intel/`
3. Hard refresh: `Ctrl + Shift + R`
4. Both Cyber and AI feeds should show fresh content with working URLs

---

## 📊 API Usage & Limits

### Gemini Free Tier:
- **15 RPM** (requests per minute)
- **1M TPM** (tokens per minute)
- **1,500 RPD** (requests per day)

### Your Daily Usage:
- **Cyber feed**: ~1 request/day
- **AI feed**: ~1 request/day
- **Total**: ~2 requests/day

**Well within free limits!** ✅

Monitor usage: [https://aistudio.google.com/usage](https://aistudio.google.com/usage)

---

## 🛠️ Optional: Use AlienVault OTX for Cyber Feed

If you prefer, you can source cyber intelligence from AlienVault OTX instead of Gemini:

### Setup:

1. Get OTX API key: [https://otx.alienvault.com/settings](https://otx.alienvault.com/settings)
2. Add to GitHub Secrets:
   - Name: `OTX_API_KEY`
   - Value: Your OTX key
3. Update workflow to add `--use-otx` flag

This reduces Gemini usage to ~1 request/day (AI only).

---

## ❌ Troubleshooting

### Error: "No Gemini API key found"

**Fix**: 
- Verify secret name is exactly `GEMINI_API_KEY` (case-sensitive)
- Re-trigger workflow after adding secret

### Error: "API key not valid"

**Fix**:
- Confirm key starts with `AIza`
- Generate new key at [Google AI Studio](https://aistudio.google.com/apikey)
- Update GitHub Secret

### Error: "Quota exceeded"

**Fix**:
- Check usage at [AI Studio Usage](https://aistudio.google.com/usage)
- Free tier resets daily (midnight Pacific Time)
- Your usage (~2/day) should never hit 1,500 limit

### Dashboard shows old content

**Fix**:
1. Verify workflow succeeded (✓ green checkmark)
2. Check `public/cyber-intel.json` was updated
3. Wait 2-3 min for GitHub Pages
4. Hard refresh: `Ctrl + Shift + R`

---

## 📁 Files Changed

- `pipeline/src/intel_pipeline/web_intel_fetcher_gemini.py` (new)
- `pipeline/src/intel_pipeline/update_intel.py` (updated import)
- `.github/workflows/daily-intel-update.yml` (GEMINI_API_KEY)
- `pipeline/pyproject.toml` (google-generativeai added)

---

## ✨ Migration Checklist

- [ ] Get Gemini API key from Google AI Studio
- [ ] Add `GEMINI_API_KEY` to GitHub Secrets
- [ ] Trigger test workflow run
- [ ] Verify logs show "Gemini initialized successfully"
- [ ] Check dashboard shows fresh feeds with real URLs
- [ ] (Optional) Remove old `ANTHROPIC_API_KEY` secret

---

## 🎉 You're All Set!

Your intelligence feeds will now update daily at 6 AM UTC using Google Gemini:

- ✅ **Free tier** (no credit card required for basic use)
- ✅ **Real source URLs** via Google Search grounding
- ✅ **Automatic daily updates**
- ✅ **No more credit exhaustion errors**

Monitor your feeds at: `https://jesseflip.github.io/tech-intel/`
