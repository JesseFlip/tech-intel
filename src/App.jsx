import { useState, useEffect } from 'react';
import ArchiveViewer from './components/ArchiveViewer';

// --- INLINE CSS FOR TICKER ANIMATION ---
const styles = `
  @keyframes ticker {
    0% { transform: translate3d(0, 0, 0); }
    100% { transform: translate3d(-50%, 0, 0); }
  }
  .animate-ticker {
    animation: ticker 30s linear infinite;
  }
  .animate-ticker:hover {
    animation-play-state: paused;
  }
`;

// --- TOOLTIP COMPONENT ---
const Tooltip = ({ enabled, title, content, children }) => {
  return (
    <div className="relative group inline-flex items-center cursor-help">
      {children}
      {enabled && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 p-3 bg-slate-800 text-slate-200 text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-slate-700">
          <strong className="text-indigo-400 block mb-1 uppercase tracking-wider">{title}</strong>
          {content}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [tooltipsEnabled, setTooltipsEnabled] = useState(true);
  const [showCyberArchive, setShowCyberArchive] = useState(false);
  const [showAiArchive, setShowAiArchive] = useState(false);
  
  // Simulated Live Data State
  const [marketData, setMarketData] = useState({
    us10y: 4.425,
    vix: 14.25,
    es: 5310.50,
    dxy: 104.80
  });

  // Tick Simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prev => ({
        us10y: prev.us10y + (Math.random() * 0.01 - 0.005),
        vix: prev.vix + (Math.random() * 0.2 - 0.1),
        es: prev.es + (Math.random() * 2 - 1),
        dxy: prev.dxy + (Math.random() * 0.04 - 0.02)
      }));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const headlines = [
    "CME FEDWATCH: 68% PROBABILITY OF NO HIKE AT NEXT MEETING",
    "US 10-YEAR TREASURY YIELD TESTS CRITICAL 4.50% RESISTANCE",
    "CREDIT SPREADS REMAIN TIGHT DESPITE GEOPOLITICAL NOISE",
    "VIX INDEX FLIRTS WITH 15.0 - COMPLACENCY REMAINS HIGH",
    "S&P FUTURES INDICATE FLAT OPEN PENDING PCE INFLATION DATA",
    "DXY DOLLAR INDEX CONSOLIDATES NEAR 6-MONTH HIGHS"
  ];

  // Tech Intel Data State with initial fallbacks
  const [cyberIntel, setCyberIntel] = useState([
    {
      title: "Mini Shai-Hulud Campaign Compromises npm Packages",
      content: "A new software supply chain attack campaign, dubbed Mini Shai-Hulud, has compromised numerous npm packages within the @antv ecosystem. Attackers leveraged a compromised maintainer account to push trojanized versions of widely used packages, embedding credential-stealing code that targets various token types, cloud credentials, and SSH keys.",
      linkText: "Read Professional Analysis →",
      url: "#"
    },
    {
      title: "CISA Contractor Leaks Highly Privileged AWS GovCloud Keys on GitHub",
      content: "A contractor for the Cybersecurity & Infrastructure Security Agency (CISA) publicly exposed credentials to several highly privileged AWS GovCloud accounts and internal CISA systems via a public GitHub repository. This significant lapse in security hygiene included cloud keys, plaintext passwords, and internal software deployment details, raising concerns about potential unauthorized access.",
      linkText: "Read Professional Analysis →",
      url: "#"
    },
    {
      title: "Critical Vulnerability (CVE-2026-8153) Exposes Industrial Robot Fleets to Hacking",
      content: "Universal Robots has patched a critical OS command injection vulnerability, CVE-2026-8153, affecting its PolyScope 5 operating system used in collaborative industrial robots (cobots). An unauthenticated attacker with network access to the Dashboard Server port can exploit this flaw to execute arbitrary commands, leading to remote code execution and compromise of the robot controller.",
      linkText: "Read Professional Analysis →",
      url: "#"
    },
    {
      title: "Leading U.S. Communications Firms Form C2 ISAC to Enhance Cybersecurity",
      content: "Eight major U.S. communications companies, including AT&T, Comcast, and Verizon, have established the Communications Cybersecurity Information Sharing and Analysis Center (C2 ISAC). This non-profit aims to strengthen cybersecurity across the sector by facilitating faster and more actionable threat intelligence sharing, especially in response to increasingly sophisticated and AI-driven cyber threats.",
      linkText: "Read Professional Analysis →",
      url: "#"
    }
  ]);

  const [aiIntel, setAiIntel] = useState([
    {
      title: "Meta AI Unveils TRIBE v2: A Digital Twin of Human Neural Activity",
      content: "Meta AI has launched TRIBE v2, a groundbreaking predictive foundation model designed as a digital twin of human neural activity, capable of forecasting brain responses to complex stimuli including sights, sounds, and language. This model achieves a 70-fold increase in resolution compared to prior efforts and excels at zero-shot generalization for new subjects and tasks, poised to accelerate neuroscience discovery and inform future AI design.",
      linkText: "Read Professional Article →",
      url: "#"
    },
    {
      title: "Gartner Forecasts Worldwide AI Spending to Grow 47% in 2026",
      content: "Gartner predicts global AI spending will reach $2.59 trillion in 2026, marking a substantial 47% year-over-year increase, primarily fueled by vendors and hyperscalers investing heavily in AI infrastructure. This growth is largely driven by the expanding adoption of generative AI models and new AI agents within enterprise workflows, making AI-optimized infrastructure the dominant market segment.",
      linkText: "Read Professional Article →",
      url: "#"
    },
    {
      title: "OpenAI Launches $4 Billion Enterprise Deployment and Consulting Business",
      content: "OpenAI has established the OpenAI Deployment Company, backed by over $4 billion, to accelerate enterprise AI adoption through dedicated engineering teams and consulting services. This strategic initiative aims to assist organizations in identifying and implementing high-impact AI use cases, intensifying competition in the enterprise AI market and broadening OpenAI's reach beyond consumer-focused tools.",
      linkText: "Read Professional Article →",
      url: "#"
    },
    {
      title: "Penn Researchers Pioneer Light-Matter Particles for Ultra-Efficient AI Computing",
      content: "Researchers at the University of Pennsylvania have developed a novel hybrid light-matter particle that promises to dramatically accelerate AI computing while significantly reducing energy consumption. This breakthrough offers the potential to replace certain electronic computing processes with ultra-efficient light-based technology, addressing the limitations of electron-based hardware for increasingly demanding AI applications.",
      linkText: "Read Professional Article →",
      url: "#"
    }
  ]);

  // Fetch live operational data from automation bots
  useEffect(() => {
    fetch('/cyber-intel.json')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setCyberIntel(data);
        }
      })
      .catch(err => console.error('Error loading dynamic cyber-intel:', err));

    fetch('/ai-intel.json')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setAiIntel(data);
        }
      })
      .catch(err => console.error('Error loading dynamic ai-intel:', err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white flex flex-col">
      <style>{styles}</style>
      
      {/* SCROLLING TICKER */}
      <div className="bg-indigo-950 border-b border-indigo-900 overflow-hidden flex items-center h-8">
        <div className="bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 h-full flex items-center z-10 whitespace-nowrap uppercase tracking-widest shadow-[4px_0_10px_rgba(0,0,0,0.5)]">
          LIVE MACRO FEED
        </div>
        <div className="overflow-hidden w-full relative">
          <div className="whitespace-nowrap animate-ticker flex text-[11px] text-indigo-200 font-mono tracking-wide">
            {[...headlines, ...headlines].map((headline, i) => (
              <span key={i} className="mx-8 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                {headline}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN HEADER */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              MACRO INTEL RECAP <span className="text-xs font-mono text-emerald-400 border border-emerald-900 bg-emerald-950 px-1.5 py-0.5 rounded">● LIVE</span>
            </h1>
            <p className="text-xs text-slate-400">Tracking the variables that price the market.</p>
          </div>
          
          {/* Tooltip Toggle */}
          <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-lg border border-slate-800">
            <span className="text-xs font-semibold text-slate-400">Expert Mode (Hide Intel Tooltips)</span>
            <button 
              onClick={() => setTooltipsEnabled(!tooltipsEnabled)}
              className={`w-10 h-5 rounded-full relative transition-colors ${!tooltipsEnabled ? 'bg-indigo-600' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${!tooltipsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </header>

      {/* DASHBOARD GRID */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* SECTION 1: LIVE WEATHER CHECK */}
        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Telemetry / The 20-Second Weather Check</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <Tooltip enabled={tooltipsEnabled} title="10-Year Yield (US10Y)" content="The single most important number in finance. It's the 'risk-free rate'. When it rises sharply, growth stocks and long-duration assets get hit.">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 w-full hover:border-indigo-500/50 transition">
                <div className="text-xs text-slate-400 font-semibold mb-1">US10Y Yield</div>
                <div className={`text-3xl font-mono ${marketData.us10y > 4.5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {marketData.us10y.toFixed(3)}%
                </div>
              </div>
            </Tooltip>

            <Tooltip enabled={tooltipsEnabled} title="VIX Fear Index" content="Below 15 = Complacency. 15-20 = Normal. Above 25 = Anxiety. Above 35 = Panic (historical buy signal).">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 w-full hover:border-indigo-500/50 transition">
                <div className="text-xs text-slate-400 font-semibold mb-1">VIX Index</div>
                <div className={`text-3xl font-mono ${marketData.vix > 20 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {marketData.vix.toFixed(2)}
                </div>
              </div>
            </Tooltip>

            <Tooltip enabled={tooltipsEnabled} title="S&P Futures (ES=F)" content="Frontline baseline equity sentiment tracker. Tells you the broad market direction before the opening bell.">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 w-full hover:border-indigo-500/50 transition">
                <div className="text-xs text-slate-400 font-semibold mb-1">ES=F (S&P 500)</div>
                <div className="text-3xl font-mono text-white">
                  {marketData.es.toFixed(2)}
                </div>
              </div>
            </Tooltip>

            <Tooltip enabled={tooltipsEnabled} title="US Dollar Index (DXY)" content="A spiking dollar tightens global liquidity and usually precedes equity weakness.">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 w-full hover:border-indigo-500/50 transition">
                <div className="text-xs text-slate-400 font-semibold mb-1">DXY Index</div>
                <div className="text-3xl font-mono text-white">
                  {marketData.dxy.toFixed(2)}
                </div>
              </div>
            </Tooltip>

          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* SECTION 2: MACRO VARIABLES */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Downstream Macro Stack</h2>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
              
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <Tooltip enabled={tooltipsEnabled} title="Fed Policy Expectations" content="Not what the Fed did, but what the market expects. Watch implied probabilities for rate cuts/hikes. Surprises move the market.">
                    <h3 className="font-semibold text-white border-b border-dashed border-slate-600 cursor-help">Fed Rate Probabilities</h3>
                  </Tooltip>
                  <p className="text-xs text-slate-400 mt-1">Next FOMC Meeting Pricing</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono bg-slate-950 border border-slate-800 px-2 py-1 rounded text-slate-300">NO CHANGE: 68%</span>
                </div>
              </div>

              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <Tooltip enabled={tooltipsEnabled} title="Inflation Prints" content="CPI (mid-month) and PCE (end of month). Hot prints = higher-for-longer rates = downward pressure on stock multiples.">
                    <h3 className="font-semibold text-white border-b border-dashed border-slate-600 cursor-help">Inflation Trajectory</h3>
                  </Tooltip>
                  <p className="text-xs text-slate-400 mt-1">Core PCE (YoY)</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono bg-slate-950 border border-slate-800 px-2 py-1 rounded text-slate-300">LATEST: 2.8%</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <Tooltip enabled={tooltipsEnabled} title="Jobs Report" content="Counterintuitively, 'too strong' jobs data can hurt markets because it keeps the Fed hawkish and rates high.">
                    <h3 className="font-semibold text-white border-b border-dashed border-slate-600 cursor-help">Labor Market Heat</h3>
                  </Tooltip>
                  <p className="text-xs text-slate-400 mt-1">Non-Farm Payrolls Trend</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono bg-slate-950 border border-slate-800 px-2 py-1 rounded text-slate-300">STATUS: HOT</span>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 3: VECTORS & ALERTS */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Vectors</h2>
            
            <div className="bg-rose-950/20 border border-rose-900/30 rounded-xl p-4">
              <Tooltip enabled={tooltipsEnabled} title="Red Flags (Threats)" content="Market conditions indicating structural risk. Examples: Yield curve inverted, credit spreads widening, hawkish Fed surprises, broad guidance cuts.">
                <h3 className="text-sm font-bold text-rose-400 mb-3 border-b border-dashed border-rose-900/50 inline-block cursor-help">🚨 Threat Radar</h3>
              </Tooltip>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center justify-between">
                  <span>Yield Curve (2y/10y)</span>
                  <span className="font-mono text-rose-400">INVERTED</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>High Yield Spreads</span>
                  <span className="font-mono text-slate-400">STABLE</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Corporate Guidance</span>
                  <span className="font-mono text-slate-400">MIXED</span>
                </li>
              </ul>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4">
              <Tooltip enabled={tooltipsEnabled} title="Green Lights (Opportunities)" content="Market conditions indicating structural tailwinds. Examples: Fed pivoting dovish, tightening credit spreads, earnings beats with *raised* guidance.">
                <h3 className="text-sm font-bold text-emerald-400 mb-3 border-b border-dashed border-emerald-900/50 inline-block cursor-help">🟢 Opportunity Radar</h3>
              </Tooltip>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center justify-between">
                  <span>Market Breadth</span>
                  <span className="font-mono text-emerald-400">IMPROVING</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Insider Buying</span>
                  <span className="font-mono text-slate-400">NEUTRAL</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* SECTION 4: TECH INTEL (CYBER & AI) */}
        <div className="pt-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Tech Intel: Cyber & AI Formations</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Cyber Intel Column */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Cyber Intelligence Brief
                </h3>
                <button
                  onClick={() => setShowCyberArchive(true)}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  Archive
                </button>
              </div>
              <div className="space-y-6">
                {cyberIntel.map((item, index) => (
                  <div key={index} className="border-l-2 border-slate-700 pl-4 space-y-2">
                    <h4 className="font-bold text-white text-sm leading-snug">{item.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.content}</p>
                    <a href={item.url || "#"} target="_blank" rel="noopener noreferrer" className="inline-block text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition mt-1">{item.linkText}</a>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Intel Column */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  AI Intelligence Brief
                </h3>
                <button
                  onClick={() => setShowAiArchive(true)}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  Archive
                </button>
              </div>
              <div className="space-y-6">
                {aiIntel.map((item, index) => (
                  <div key={index} className="border-l-2 border-slate-700 pl-4 space-y-2">
                    <h4 className="font-bold text-white text-sm leading-snug">{item.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.content}</p>
                    <a href={item.url || "#"} target="_blank" rel="noopener noreferrer" className="inline-block text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition mt-1">{item.linkText}</a>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* Archive Viewers */}
      {showCyberArchive && (
        <ArchiveViewer
          category="cyber"
          onClose={() => setShowCyberArchive(false)}
        />
      )}
      {showAiArchive && (
        <ArchiveViewer
          category="ai"
          onClose={() => setShowAiArchive(false)}
        />
      )}
    </div>
  );
}
