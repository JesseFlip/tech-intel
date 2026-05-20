import { useState, useEffect } from 'react';

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
            {/* Render twice for seamless loop */}
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
      </main>
    </div>
  );
}
