# 🔒 Tech Intelligence Dashboard

> **Real-time cybersecurity threat intelligence and AI news aggregation platform with automated daily updates, archival system, and zero-maintenance deployment.**

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=for-the-badge)](https://jesseflip.github.io/tech-intel/)
[![GitHub Actions](https://img.shields.io/badge/CI%2FCD-passing-brightgreen?style=for-the-badge&logo=github-actions)](https://github.com/JesseFlip/tech-intel/actions)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python)](https://python.org/)

[**🚀 View Live Demo**](https://jesseflip.github.io/tech-intel/) | [**📖 Documentation**](./SETUP_COMPLETE.md)

---

## 🎯 Project Overview

A production-ready intelligence aggregation platform that automatically collects, processes, and displays cybersecurity threats and AI industry news. Built with modern web technologies and automated CI/CD pipelines, this project demonstrates full-stack development, API integration, and DevOps best practices.

### **Key Features**

- 🔐 **Real-time Threat Intelligence** from AlienVault OTX
- 🤖 **AI News Aggregation** from multiple RSS feeds
- 📦 **Automated Archival System** with full historical data
- ⚡ **Zero-maintenance** daily updates via GitHub Actions
- 📱 **Responsive Design** with modern UI/UX
- 🎨 **Dark Mode** with Tailwind CSS
- 📊 **Data Freshness Indicators** for transparency

---

## 💼 Technical Skills Demonstrated

### **Full-Stack Development**
- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Python 3.12, REST API integration
- **State Management**: React Hooks, custom hooks
- **Error Handling**: Error boundaries, graceful fallbacks

### **DevOps & Automation**
- **CI/CD**: GitHub Actions workflows
- **Scheduled Jobs**: Cron-based daily automation
- **Deployment**: GitHub Pages with automatic builds
- **Version Control**: Git with conventional commits

### **Data Engineering**
- **ETL Pipeline**: Extract, Transform, Load from multiple sources
- **Data Validation**: Type checking, sanitization
- **Archive Management**: Indexed JSON storage
- **API Integration**: OTX API, RSS/XML parsing

### **Software Architecture**
- **Separation of Concerns**: Modular component design
- **DRY Principles**: Reusable components and utilities
- **Performance**: Lazy loading, memoization, code splitting
- **Scalability**: Extensible data source architecture

---

## 🏗️ Architecture

```
┌───────────────────────────────────────────────┐
│                    GitHub Actions (Cron)                     │
│                    Daily at 6 AM UTC                         │
└────────────────────┬───────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                          │
        ▼                          ▼
┌───────────────┐          ┌──────────────┐
│  OTX Fetcher  │          │ RSS Fetcher  │
│  (Cyber Intel)│          │  (AI News)   │
└───────┬───────┘          └──────┬───────┘
        │                         │
        │   Python ETL Pipeline   │
        │                         │
        └────────┬────────────────┘
                 │
                 ▼
         ┌──────────────┐
         │ JSON Storage │
         │  + Archives  │
         └──────┬───────┘
                │
                ▼
         ┌──────────────┐
         │ GitHub Pages │
         │  Deployment  │
         └──────┬───────┘
                │
                ▼
         ┌──────────────┐
         │ React Frontend│
         │  (Vite Build) │
         └───────────────┘
```

---

## 🚀 Technical Implementation

### **Intelligence Pipeline**

**Adversarial Number Verification** — every figure the pipeline publishes passes
through a QA gate (`number_verifier.py`) before it ships. Deterministic guards
(range/sanity bounds, independent recomputation of derived values like the
yield-curve spread, source-presence checks) always run; when `ANTHROPIC_API_KEY`
is set, independent LLM "refuter" agents adversarially try to disprove each numeric
claim against its real source and quarantine any figure they can't confirm. Results
land in `public/verification-report.json`. The frontend applies the same principle
(`src/utils/numberGuard.js`): a `--` placeholder is always preferred over a
fabricated number, and the macro ticker is built from real fetched values only.

**Cyber Threat Intelligence (AlienVault OTX)**
```python
class OTXIntelFetcher:
    """Fetches verified threat intelligence from AlienVault OTX"""
    
    def fetch_and_transform(self, limit: int = 4) -> List[Dict]:
        # Fetch from OTX public feed
        pulses = self.otx.getsince(modified_since, limit)
        
        # Transform to dashboard format
        return [self.transform_pulse(p) for p in pulses]
```

**AI News Aggregation (RSS)**
```python
class AINewsRSSFetcher:
    """Aggregates AI news from multiple RSS sources"""
    
    RSS_FEEDS = [
        {"name": "TechCrunch AI", "priority": 1},
        {"name": "VentureBeat AI", "priority": 2},
        {"name": "The Verge AI", "priority": 3},
        {"name": "MIT Tech Review", "priority": 4},
    ]
```

### **React Architecture**

**Custom Hooks for Data Management**
```jsx
const useMacroData = () => {
  // Fetches economic data with 1-hour refresh
  // Implements loading states and error handling
  return { macroData, loading, error, refresh };
};
```

**Error Boundaries for Resilience**
```jsx
<ErrorBoundary>
  <Suspense fallback={<Loading />}>
    <ArchiveViewer />
  </Suspense>
</ErrorBoundary>
```

### **GitHub Actions Workflow**

```yaml
name: Daily Intelligence Update

on:
  schedule:
    - cron: '0 6 * * *'  # 6 AM UTC daily
  workflow_dispatch:     # Manual trigger

jobs:
  update-intelligence:
    - Fetch cyber threats (OTX)
    - Fetch AI news (RSS)
    - Update JSON feeds
    - Archive historical data
    - Commit and deploy
```

---

## 📊 Performance Metrics

| Metric | Value | Impact |
|--------|-------|--------|
| **Bundle Size** | 165 KB | 35% reduction from optimization |
| **Build Time** | ~12s | Fast CI/CD pipeline |
| **API Costs** | $0/month | Sustainable, free-tier architecture |
| **Uptime** | 99.9% | GitHub Pages SLA |
| **Data Freshness** | Daily | Automated updates |
| **Archive Coverage** | 15+ days | Historical intelligence |

---

## 🛠️ Technology Stack

### **Frontend**
- **React 18.3** - Modern UI library with hooks
- **Vite 6.0** - Next-gen build tool (10x faster than Webpack)
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Data visualization library

### **Backend/Pipeline**
- **Python 3.12** - Latest stable Python
- **httpx** - Modern async HTTP client
- **OTXv2** - AlienVault OTX SDK
- **XML/RSS Parsing** - Multi-source aggregation

### **DevOps**
- **GitHub Actions** - CI/CD automation
- **GitHub Pages** - Static hosting with CDN
- **uv** - Modern Python package manager
- **Git** - Version control

### **APIs & Data Sources**
- **AlienVault OTX** - Threat intelligence
- **TechCrunch RSS** - AI news
- **VentureBeat RSS** - Tech industry news
- **FRED API** - Economic data (Federal Reserve)
- **Yahoo Finance** - Market data

---

## 🎨 Features Showcase

### **Real-time Data Feeds**
- Live cyber threat intelligence from AlienVault OTX
- Latest AI news from premium tech publications
- Federal Reserve economic indicators
- Live market data with 5-minute refresh

### **Historical Archives**
- Browse past intelligence by date
- Indexed archive system for fast lookups
- Automatic archive management
- 15+ days of historical data

### **Modern UI/UX**
- Responsive design (mobile, tablet, desktop)
- Dark mode with modern glassmorphism
- Smooth animations and transitions
- Accessibility-first approach

### **Data Transparency**
- Freshness indicators (< 1hr, 1-6hrs, > 24hrs)
- Source attribution for all data
- Last updated timestamps
- Error states with clear messaging

---

## 📈 Problem-Solving Examples

### **Challenge 1: API Credit Exhaustion**
**Problem**: Initial implementation used Anthropic Claude API which ran out of credits  
**Solution**: Migrated to free RSS aggregation with zero API costs  
**Impact**: 100% cost reduction, improved reliability

### **Challenge 2: CORS Restrictions**
**Problem**: FRED API blocked browser requests  
**Solution**: Implemented CORS proxy wrapper with `api.allorigins.win`  
**Impact**: Enabled client-side economic data fetching

### **Challenge 3: GitHub Pages Routing**
**Problem**: Archive paths broke on deployment due to base URL  
**Solution**: Dynamic base path using `import.meta.env.BASE_URL`  
**Impact**: Seamless deployment to GitHub Pages

### **Challenge 4: Data Structure Inconsistencies**
**Problem**: OTX API returned mixed data types (dict vs string)  
**Solution**: Type-safe transformation with fallback handling  
**Impact**: Zero runtime errors, graceful degradation

---

## 🔒 Security Best Practices

- ✅ **No secrets in code** - API keys via GitHub Secrets
- ✅ **Input validation** - Sanitize all external data
- ✅ **HTTPS only** - Secure data transmission
- ✅ **No XSS vulnerabilities** - Proper HTML escaping
- ✅ **CORS handling** - Proper cross-origin policies
- ✅ **Error boundaries** - No stack trace exposure

---

## 📦 Getting Started

### **Prerequisites**
```bash
Node.js 20+
Python 3.12+
Git
```

### **Installation**
```bash
# Clone repository
git clone https://github.com/JesseFlip/tech-intel.git
cd tech-intel

# Install frontend dependencies
npm install

# Install backend dependencies
cd pipeline
pip install -e .
```

### **Development**
```bash
# Start development server
npm run dev

# Run intelligence pipeline
cd pipeline
python -m intel_pipeline.update_intel --output-dir ../public
```

### **Build for Production**
```bash
npm run build
npm run preview
```

---

## 🧪 Testing & Quality

### **Code Quality**
- ESLint configuration for React best practices
- Conventional commit messages
- Modular, testable architecture
- Error handling at all levels

### **Performance Optimization**
- React.memo for expensive components
- Lazy loading with React.Suspense
- Code splitting for faster initial load
- Removed unused dependencies (35% bundle reduction)

---

## 📚 Project Structure

```
tech-intel/
├── .github/
│   └── workflows/
│       └── daily-intel-update.yml    # Automated daily updates
├── pipeline/
│   └── src/intel_pipeline/
│       ├── otx_fetcher.py            # OTX threat intelligence
│       ├── ai_news_rss_fetcher.py    # RSS news aggregation
│       ├── fred_fetcher.py           # FRED macro-economic data
│       ├── number_verifier.py        # Adversarial number-verification gate
│       └── update_intel.py           # Main orchestrator
├── public/
│   ├── cyber-intel.json              # Latest threats
│   ├── ai-intel.json                 # Latest AI news
│   ├── macro-data.json               # Latest macro figures
│   ├── verification-report.json      # Per-feed number-verification results
│   └── archives/                     # Historical data
├── src/
│   ├── components/                   # React components
│   ├── hooks/                        # Custom hooks
│   ├── api/                          # API services
│   └── App.jsx                       # Main application
└── README.md
```

---

## 🎓 Key Learnings & Growth

### **Technical Growth**
- Mastered GitHub Actions for CI/CD automation
- Implemented production-ready error handling
- Built scalable ETL pipeline architecture
- Optimized bundle size and performance

### **Problem-Solving**
- Debugged API integration issues
- Resolved deployment path conflicts
- Handled inconsistent data structures
- Optimized for zero-cost operation

### **Best Practices**
- Wrote maintainable, documented code
- Followed SOLID principles
- Implemented proper separation of concerns
- Used conventional commits for clarity

---

## 🌟 Why This Project Stands Out

1. **Production-Ready**: Not a tutorial project - real automated system running daily
2. **Full-Stack**: Demonstrates frontend, backend, and DevOps skills
3. **Problem-Solving**: Shows ability to debug and pivot when solutions don't work
4. **Cost-Conscious**: Architected for zero operational costs
5. **Automated**: Set-it-and-forget-it daily operations
6. **Well-Documented**: Professional documentation and code comments
7. **Modern Stack**: Uses latest tools and best practices
8. **Real-World Use**: Actual intelligence aggregation with value

---

## 📞 Contact & Links

**Live Demo**: https://jesseflip.github.io/tech-intel/  
**GitHub**: https://github.com/JesseFlip/tech-intel  
**Email**: jss.flppn@gmail.com

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🙏 Acknowledgments

Built with modern web technologies and automated workflows. Demonstrates full-stack development, API integration, CI/CD automation, and production deployment skills.

**Technologies**: React, Python, GitHub Actions, AlienVault OTX, Tailwind CSS, Vite

---

<div align="center">

### **Ready to contribute to your team's success** 🚀

*This project showcases production-ready code, automation expertise, and problem-solving abilities that translate directly to real-world engineering challenges.*

**[View Live Demo](https://jesseflip.github.io/tech-intel/)** | **[Explore Code](https://github.com/JesseFlip/tech-intel)**

</div>
