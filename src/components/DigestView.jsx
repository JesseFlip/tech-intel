import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Compass, 
  Sliders, 
  AlertOctagon, 
  CheckCircle2, 
  XCircle,
  FileText,
  ShieldAlert,
  Shield
} from 'lucide-react';
import liveFinanceService from '../api/liveFinanceService';

const DigestView = () => {
  const [tickerData, setTickerData] = useState([
    { symbol: 'US10Y', name: 'The Risk-Free Rate', desc: 'Prices every other asset globally', price: 4.42, change_pct: 0.0 },
    { symbol: 'VIX', name: 'The Fear Index', desc: 'Measures implied volatility of options', price: 13.50, change_pct: 0.0 },
    { symbol: 'ES=F', name: 'S&P Futures', desc: 'Frontline equity sentiment tracker', price: 5120.00, change_pct: 0.0 }
  ]);

  // Fetch live signals
  useEffect(() => {
    const fetchLiveSignals = async () => {
      try {
        const updated = await Promise.all(
          tickerData.map(async (t) => {
            const live = await liveFinanceService.getTickerPrice(t.symbol, t.price, 0.0);
            return {
              ...t,
              price: live.price,
              change_pct: live.change_pct
            };
          })
        );
        setTickerData(updated);
      } catch (err) {
        console.error('[DigestView] Failed fetching live signals:', err);
      }
    };

    fetchLiveSignals();

    // Minor simulated ticks matching MarketTicker
    const interval = setInterval(() => {
      setTickerData(prev => 
        prev.map(t => {
          const tickChange = t.symbol === 'US10Y' 
            ? (Math.random() - 0.5) * 0.01 
            : t.symbol === 'VIX' 
              ? (Math.random() - 0.5) * 0.05 
              : (Math.random() - 0.5) * 1.5;

          const newPrice = Math.max(0.01, t.price + tickChange);
          let updatedChange = t.change_pct;
          if (t.price !== 0) {
            updatedChange += (tickChange / t.price) * 100;
          }

          return {
            ...t,
            price: parseFloat(newPrice.toFixed(t.symbol === 'US10Y' ? 3 : 2)),
            change_pct: parseFloat(updatedChange.toFixed(2))
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.article 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto space-y-16 pb-24"
    >
      {/* HERO BRANDING */}
      <header className="space-y-4 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/25 rounded-full text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <Activity size={12} className="animate-pulse" /> Unified Telemetry Node
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent leading-none">
          MACRO INTEL RECAP <span className="text-indigo-500 font-light">|</span> <span className="font-light tracking-wide text-slate-300">Grounded Intelligence</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 font-medium italic font-sans max-w-3xl">
          "Filtering the broadcast noise. Updating the variables that actually price the market."
        </p>
      </header>

      {/* LIVE SIGNAL: THE 20-SECOND WEATHER CHECK */}
      <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-xl relative overflow-hidden group hover:border-indigo-500/20 transition-all duration-300">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/60 pb-4 mb-6">
          <div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Live Signal Monitor</span>
            <h2 className="text-lg font-black text-white uppercase tracking-wide font-mono mt-0.5">THE 20-SECOND WEATHER CHECK</h2>
          </div>
          <p className="text-xs text-slate-400 font-mono italic">
            (Check these three numbers daily to determine the environment before looking at any individual asset.)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tickerData.map((t) => {
            const isUp = t.change_pct >= 0;
            const formattedPrice = t.symbol === 'US10Y' 
              ? `${t.price.toFixed(2)}%` 
              : t.price.toLocaleString(undefined, { minimumFractionDigits: 2 });
              
            return (
              <div 
                key={t.symbol} 
                className="bg-slate-950/50 border border-slate-800/50 rounded-xl p-5 hover:border-slate-700 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-black text-slate-500 font-mono uppercase">{t.symbol}</span>
                    <h3 className="text-sm font-bold text-slate-200 leading-tight">{t.name}</h3>
                  </div>
                  <span className={`flex items-center text-xs font-black px-2 py-0.5 rounded font-mono ${
                    isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {isUp ? '+' : ''}{t.change_pct.toFixed(2)}%
                  </span>
                </div>
                <div className="text-3xl font-black font-mono tracking-tight text-white mt-4">
                  {formattedPrice}
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-1 leading-snug">
                  {t.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* TELEMETRY SECTION 01: THE MACRO STACK */}
      <section className="space-y-6">
        <div className="border-b border-slate-800/80 pb-3">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Telemetry Section 01</span>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">THE MACRO STACK</h2>
          <p className="text-sm text-slate-400 mt-1">
            The dominant force in markets is the Fed and interest rates. Everything else is downstream. These are the variables that actually move portfolios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700/60 hover:bg-slate-900/40 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Activity size={18} />
              </div>
              <h3 className="font-bold text-white text-base">The 10-Year Treasury Yield</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The single most important number in finance. It prices every other asset. It represents the cost of capital, dictating mortgage rates, discount rates, and global debt pricing.
              </p>
            </div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-4">
              Variable Reference: US10Y
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700/60 hover:bg-slate-900/40 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Compass size={18} />
              </div>
              <h3 className="font-bold text-white text-base">Fed Policy Expectations</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Not what the Fed *did*, but what the market *expects*. Watch implied probability curves derived from Fed Funds Futures to preempt market repricings.
              </p>
            </div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-4">
              Variable Reference: Fed Probabilities
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700/60 hover:bg-slate-900/40 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <FileText size={18} />
              </div>
              <h3 className="font-bold text-white text-base">Inflation Prints</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                CPI (Consumer Price Index, mid-month) and PCE (Personal Consumption Expenditures, end of month). CPI forms narrative headlines; PCE is the Fed's preferred policy compass.
              </p>
            </div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-4">
              Variable Reference: CPI & PCE
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700/60 hover:bg-slate-900/40 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Sliders size={18} />
              </div>
              <h3 className="font-bold text-white text-base">Jobs Report</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                First Friday of the month. Non-farm payrolls, unemployment rates, and average hourly earnings. Key indicator of economic resilience and potential wage-push inflation.
              </p>
            </div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-4">
              Variable Reference: NFP / Wages
            </div>
          </div>

          {/* Card 5 */}
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700/60 hover:bg-slate-900/40 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <ShieldAlert size={18} />
              </div>
              <h3 className="font-bold text-white text-base">The VIX</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Implied equity risk gauge. Below 15 indicates high Complacency; 15–20 represents Normal state; above 25 signifies Anxiety; above 35 signals extreme Panic and often constitutes a Buy Signal.
              </p>
            </div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-4">
              Variable Reference: VIX Bounds
            </div>
          </div>

          {/* Card 6 */}
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700/60 hover:bg-slate-900/40 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Shield size={18} />
              </div>
              <h3 className="font-bold text-white text-base">DXY & Credit Spreads</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                A spiking US Dollar (DXY index) or widening high-yield corporate credit spreads indicates underlying liquidity drains, typically preceding equity market corrections.
              </p>
            </div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-4">
              Variable Reference: Spreads / USD
            </div>
          </div>
        </div>
      </section>

      {/* TELEMETRY SECTION 02: MARKET CONDITIONS & VECTORS */}
      <section className="space-y-6">
        <div className="border-b border-slate-800/80 pb-3">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Telemetry Section 02</span>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">MARKET CONDITIONS & VECTORS</h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time split vector mapping. Tracking structural triggers to determine deployment parameters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* RED FLAGS */}
          <div className="bg-rose-950/10 border border-rose-950/40 rounded-2xl p-6 md:p-8 hover:border-rose-900/40 transition-colors">
            <div className="flex items-center gap-3 border-b border-rose-900/20 pb-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                <XCircle size={22} />
              </div>
              <div>
                <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest font-mono">Structural Risks</span>
                <h3 className="text-lg font-black text-white uppercase tracking-wide">🚨 RED FLAGS (Threats)</h3>
              </div>
            </div>
            <ul className="space-y-4">
              {[
                { title: 'Yield Curve Inverted (2yr > 10yr)', desc: 'Classic bond market warning of macroeconomic structural friction.' },
                { title: 'Widening Credit Spreads', desc: 'Indicates stress in the commercial debt pipeline and potential defaults.' },
                { title: 'Hawkish Fed Surprises', desc: 'Unexpectedly aggressive rate hikes or hawkish FOMC narrative pivot.' },
                { title: 'Broad Guidance Cuts', desc: 'Multi-industry corporate downgrades indicating declining aggregate demand.' },
                { title: '"This Time is Different" narratives', desc: 'Excessive valuation handwaving bypassing traditional pricing matrices.' },
                { title: 'Insider Selling Clusters', desc: 'Concentrated C-suite liquidations indicating local valuations have peaked.' }
              ].map((item, idx) => (
                <li key={idx} className="flex gap-3 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-2" />
                  <div>
                    <h4 className="font-bold text-slate-200 text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-400 leading-snug">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* GREEN LIGHTS */}
          <div className="bg-emerald-950/10 border border-emerald-950/40 rounded-2xl p-6 md:p-8 hover:border-emerald-900/40 transition-colors">
            <div className="flex items-center gap-3 border-b border-emerald-900/20 pb-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest font-mono">Structural Tailwinds</span>
                <h3 className="text-lg font-black text-white uppercase tracking-wide">🟢 GREEN LIGHTS (Opportunities)</h3>
              </div>
            </div>
            <ul className="space-y-4">
              {[
                { title: 'Fed Pivoting Dovish', desc: 'Lower borrowing costs, expanding credit pipeline, capital injection support.' },
                { title: 'Tightening Credit Spreads & Falling VIX', desc: 'Underlying stress resolving, indicating healthy institutional risk tolerance.' },
                { title: 'Earnings Beats + Raised Guidance', desc: 'Direct fundamental proof of microeconomic operating strength.' },
                { title: 'Improving Market Breadth', desc: 'Equity indices advance supported by a wide cross-section of equities rather than few mega-caps.' },
                { title: 'Insider Buying Clusters', desc: 'Company founders and executives purchasing shares using their own capital.' }
              ].map((item, idx) => (
                <li key={idx} className="flex gap-3 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-2" />
                  <div>
                    <h4 className="font-bold text-slate-200 text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-400 leading-snug">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* TELEMETRY SECTION 03: EXECUTION PROTOCOLS */}
      <section className="space-y-6">
        <div className="border-b border-slate-800/80 pb-3">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Telemetry Section 03</span>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">EXECUTION PROTOCOLS</h2>
          <p className="text-sm text-slate-400 mt-1">
            Operational mandates to eliminate impulse risk and enforce statistical sizing discipline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { num: '01', title: 'Write the Thesis First', text: '"I think X will happen by Y date because Z." Unwritten ideas are amorphous, inviting moving goalposts.' },
            { num: '02', title: 'Strict Position Sizing', text: 'Single stocks 1–5% of portfolio maximum weight. Enforce systemic risk bounds so no outlier ruins the strategy.' },
            { num: '03', title: 'Define Your Time Horizon', text: 'Strict categorizations: day trade, swing trade, or long-term investment. Rules for one cannot govern the other.' },
            { num: '04', title: 'Limit Orders Only', text: 'Never use market orders on any security less liquid than SPY index funds. Safeguard pricing limits against slippage.' },
            { num: '05', title: 'Never Average Down', text: 'Never buy more of a losing asset on a broken thesis. Accept the error, take the loss, and reallocate capital.' },
            { num: '06', title: 'Seek Asymmetric Bets', text: 'Focus on highly skewed risk/reward matrices (e.g. -20% downside / +100% upside to ensure favorable long-term expectancy).' }
          ].map((item) => (
            <div 
              key={item.num}
              className="bg-slate-900/20 border border-slate-800/60 rounded-xl p-5 hover:border-indigo-500/20 hover:bg-slate-900/30 transition-all flex gap-4 items-start"
            >
              <div className="text-2xl font-black font-mono text-indigo-500/40 bg-indigo-500/5 border border-indigo-500/10 w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                {item.num}
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wide font-sans">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TELEMETRY SECTION 04: COGNITIVE THREAT INTELLIGENCE */}
      <section className="space-y-6">
        <div className="border-b border-slate-800/80 pb-3">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Telemetry Section 04</span>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">COGNITIVE THREAT INTELLIGENCE</h2>
          <p className="text-sm text-slate-400 mt-1">
            Mitigate psychological trading traps and emotional cognitive distortions that erode capital.
          </p>
        </div>

        <div className="space-y-4">
          {[
            { tag: 'The Entertainment Trap', desc: 'Cramer, morning television anchors, hyperactive Twitter feeds—do not trade their talking points. Their business model is views, not performance.' },
            { tag: 'Recency Bias', desc: 'Assuming what just transpired will keep transpiring. Extrapolating the immediate past into an indefinite future disregards cyclical reversions.' },
            { tag: 'Confirmation Bias', desc: 'Selectively seeking bullish news when long, or bearish news when short. Intentionally seek counter-arguments to stress test positions.' },
            { tag: 'Anchoring', desc: 'Believing a $150 stock is "cheap" simply because it used to be $200. Value is determined by fundamentals and cost of capital, not historical price points.' },
            { tag: 'FOMO (Fear of Missing Out)', desc: 'If you are chasing a ripped chart, you are already late. High momentum entry points are distribution phases for earlier capital.' }
          ].map((item, idx) => (
            <div 
              key={idx}
              className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500">
                  <AlertOctagon size={16} />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-amber-500 font-mono tracking-widest uppercase">Intel Threat Advisory</span>
                  <h3 className="font-bold text-white text-sm uppercase tracking-wide mt-0.5">{item.tag}</h3>
                </div>
              </div>
              <p className="text-xs text-slate-400 md:max-w-2xl leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </motion.article>
  );
};

export default DigestView;

