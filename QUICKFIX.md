# Quick Fix Guide - Intelligence Feed URLs & Market Data

## Issue #1: Links Not Working (Looping Back to Site)

### Root Cause
The intelligence JSON files (`cyber-intel.json` and `ai-intel.json`) contained placeholder "#" URLs because the GitHub Actions workflow hasn't run yet with your API keys.

### Solution

**Option A: Wait for Automated Update (Recommended)**
- The workflow runs daily at 6 AM UTC
- It will automatically populate real URLs from OTX and Claude APIs
- No action needed if GitHub secrets are configured

**Option B: Manual Trigger (Immediate Fix)**
1. Go to your GitHub repository
2. Click on **Actions** tab
3. Select **Daily Intelligence Update** workflow
4. Click **Run workflow**
5. Wait 2-3 minutes for completion
6. URLs will be populated with real OTX pulse links and AI article sources

**Option C: Temporary Working URLs (Applied)**
I've updated the placeholder files with working URLs:
- Cyber Intel → Links to AlienVault OTX search results
- AI Intel → Links to Meta AI blog and relevant sources

---

## Issue #2: Numbers Stopped Updating

### Root Cause
FRED API (Federal Reserve Economic Data) has CORS restrictions when called from browser.

### Solution Applied

**Fixed FRED API Integration:**
```javascript
// Now uses CORS proxy (same as Yahoo Finance)
const proxyUrl = `https://api.allorigins.win/raw?url=${fredUrl}`;
```

**How to Verify Fix:**
1. Open browser console (F12)
2. Look for any error messages
3. Check for successful API calls

**Expected Behavior:**
- Market data updates every 5 minutes
- FRED macro data updates every hour
- Visual freshness indicators show data age

**If Still Not Working:**

Check for these in browser console:
```
Console → Network tab → Look for:
- api.allorigins.win requests (should be 200 OK)
- Any CORS errors (should be none now)
```

---

## Testing the Fixes

### 1. Test Market Data
```javascript
// Open browser console on dashboard
// Should see periodic fetch requests every 5 minutes
// No CORS errors
```

### 2. Test FRED Data
```javascript
// Should see data populate within 10-15 seconds of page load
// Economic indicators show real values (not "Loading...")
```

### 3. Test Intelligence Links
- Click any "View on AlienVault OTX →" link
- Should open OTX website (not loop back)
- After GitHub Actions runs, links will be pulse-specific

---

## Manual Intelligence Update (Local)

To generate real URLs locally:

### Step 1: Set API Keys (One-Time Setup)
```bash
# In project root
echo "your-otx-api-key" > otx_api_key
echo "your-anthropic-api-key" > anthropic_api_key
```

### Step 2: Run Pipeline
```bash
cd pipeline
uv sync  # Install dependencies
uv run python -m intel_pipeline.update_intel --output-dir ../public
```

### Step 3: Verify
```bash
# Check that URLs are populated
cat ../public/cyber-intel.json
# Should see real OTX pulse URLs like:
# "url": "https://otx.alienvault.com/pulse/6745abc..."
```

---

## Monitoring Data Updates

### Visual Indicators

**Freshness Dots:**
- 🟢 **Green**: Data < 1 hour old (GOOD)
- 🟡 **Yellow**: Data 1-6 hours old (OK)
- 🔴 **Red**: Data > 24 hours old (STALE - check logs)

**What To Check:**
1. Market data freshness indicator (should be green after 5-min refresh)
2. Economic data freshness (should update hourly)
3. No console errors

### Troubleshooting

**If market numbers show "--":**
```
1. Check browser console for errors
2. Verify api.allorigins.win is accessible
3. Check Yahoo Finance API status
```

**If FRED data shows "Loading...":**
```
1. Check CORS proxy is working
2. Verify FRED API is accessible
3. Check console for specific errors
```

**If links still don't work after Actions run:**
```
1. Check GitHub Actions logs for errors
2. Verify API keys are set in secrets
3. Check workflow completed successfully
```

---

## Expected Timeline

| Issue | Fix Applied | When It Works |
|-------|-------------|---------------|
| FRED API CORS | ✅ Committed | Immediately after deploy |
| Market Data | ✅ Committed | Immediately after deploy |
| Temp URLs | ✅ Committed | Immediately after deploy |
| Real OTX URLs | ⏳ Needs workflow | After next 6 AM UTC run OR manual trigger |
| Real Claude URLs | ⏳ Needs workflow | After next 6 AM UTC run OR manual trigger |

---

## Recommended Next Steps

1. **Immediate:**
   - Deploy latest changes (git push done)
   - Manually trigger GitHub Actions workflow
   - Verify links work

2. **Within 24h:**
   - Monitor automated workflow run
   - Verify real URLs populate
   - Check data freshness indicators

3. **Optional:**
   - Get FRED API key (free) for better rate limits
   - Add to `.env`: `VITE_FRED_API_KEY=your_key`

---

## API Rate Limits

**Current Setup (No Keys):**
- FRED: Unlimited for non-commercial use
- Yahoo Finance: ~2000 requests/hour via CORS proxy
- OTX: Limited without key
- Claude: Limited without key

**With Keys (Recommended):**
- FRED: Higher priority queue
- OTX: 10,000 requests/hour
- Claude: Based on your tier

---

## Support

If issues persist after these fixes:

1. Check browser console for specific errors
2. Review GitHub Actions workflow logs
3. Verify all API keys are configured
4. Open GitHub issue with error details

---

Last Updated: 2026-05-23
