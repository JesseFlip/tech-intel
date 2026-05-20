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

const Tooltip = ({ children, text, align = 'center' }) => {
  const alignClasses = {
    center: 'left-1/2 -translate-x-1/2',
    left: 'left-0',
    right: 'right-0'
  }[align];
  
  return (
    <span className="relative group cursor-help border-b border-dotted border-indigo-500/40 hover:border-indigo-400 transition-colors inline-block">
      {children}
      <span className={`absolute bottom-full mb-2 w-72 bg-slate-950/98 border border-slate-800 p-3.5 rounded-xl text-xs font-normal text-slate-300 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 shadow-2xl backdrop-blur-md font-sans normal-case tracking-normal leading-relaxed invisible group-hover:visible ${alignClasses}`}>
        {text}
      </span>
    </span>
  );
};

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

  const macroStackItems = [
    {
      title: 'The 10-Year Treasury Yield',
      desc: 'The single most important number in finance. It prices every other asset.',
      tooltip: 'This is the benchmark rate for the global financial system. Think of it as the gravitational pull on all other assets; as it rises, it pulls stock valuations down.',
      icon: <Activity size={18} />,
      ref: 'US10Y'
    },
    {
      title: 'Fed Policy Expectations',
      desc: 'Not what the Fed did, but what the market expects. Watch implied probabilities.',
      tooltip: 'The Federal Reserve controls interest rates. The market tries to predict whether they will cut rates (bullish) or raise rates (bearish) in the future.',
      icon: <Compass size={18} />,
      ref: 'Fed Probabilities'
    },
    {
      title: 'Inflation Prints',
      desc: 'CPI (mid-month) and PCE (end of month).',
      tooltip: "CPI measures consumer price changes, while PCE is the Fed's preferred index. Lower inflation means the Fed can lower rates, while high inflation forces rates to stay high.",
      icon: <FileText size={18} />,
      ref: 'CPI & PCE'
    },
    {
      title: 'Jobs Report',
      desc: 'First Friday of the month. Non-farm payrolls, unemployment, hourly earnings.',
      tooltip: 'Non-Farm Payrolls (NFP) and unemployment. A hot job market can mean more inflation (bearish for rates), while a weak job market might force the Fed to cut rates to support the economy.',
      icon: <Sliders size={18} />,
      ref: 'NFP / Wages'
    },
    {
      title: 'The VIX',
      desc: 'Below 15 (Complacency) | 15–20 (Normal) | >25 (Anxiety) | >35 (Panic/Buy Signal).',
      tooltip: 'Standard volatility ranges: Below 15 is complacent (low fear), 15-20 is normal, above 25 is anxious, and above 35 is extreme panic.',
      icon: <ShieldAlert size={18} />,
      ref: 'VIX Bounds'
    },
    {
      title: 'DXY & Credit Spreads',
      desc: 'A spiking US Dollar or widening high-yield spreads precedes equity weakness.',
      tooltip: 'DXY is the value of the US Dollar. A rising dollar makes US exports expensive. Credit Spreads measure risk premium on corporate debt; widening spreads mean banks are afraid to lend.',
      icon: <Shield size={18} />,
      ref: 'Spreads / USD'
    }
  ];

  const redFlags = [
    { title: 'Yield Curve Inverted (2yr > 10yr)', desc: 'Classic bond market warning of macroeconomic structural friction.', tooltip: 'When short-term debt pays more interest than long-term debt. This is historically one of the most reliable predictors of an upcoming recession.' },
    { title: 'Widening Credit Spreads', desc: 'Indicates stress in the commercial debt pipeline and potential defaults.', tooltip: 'The gap in interest rates between risky corporate debt and safe government bonds is increasing, indicating corporate stress.' },
    { title: 'Hawkish Fed Surprises', desc: 'Unexpectedly aggressive rate hikes or hawkish FOMC narrative pivot.', tooltip: 'When the Federal Reserve speaks or acts in a way that suggests they will keep interest rates higher for longer than the market anticipated.' },
    { title: 'Broad Guidance Cuts', desc: 'Multi-industry corporate downgrades indicating declining aggregate demand.', tooltip: 'When many corporations warn that their future earnings and revenues will be lower than originally forecast.' },
    { title: '"This Time is Different" narratives', desc: 'Excessive valuation handwaving bypassing traditional pricing matrices.', tooltip: 'A psychological trap where investors justify extremely high valuations by claiming historical rules no longer apply due to some new technology or event.' },
    { title: 'Insider Selling Clusters', desc: 'Concentrated C-suite liquidations indicating local valuations have peaked.', tooltip: "When multiple corporate executives and founders sell large amounts of their own company's stock within a short time window." }
  ];

  const greenLights = [
    { title: 'Fed Pivoting Dovish', desc: 'Lower borrowing costs, expanding credit pipeline, capital injection support.', tooltip: 'When the Federal Reserve begins to suggest they will cut interest rates or stop raising them, easing conditions.' },
    { title: 'Tightening Credit Spreads & Falling VIX', desc: 'Underlying stress resolving, indicating healthy institutional risk tolerance.', tooltip: 'Interest rate spreads are narrowing and market volatility is decreasing, indicating healthy lending and high risk appetite.' },
    { title: 'Earnings Beats + Raised Guidance', desc: 'Direct fundamental proof of microeconomic operating strength.', tooltip: 'When companies report profits that exceed expectations and raise their future performance forecasts.' },
    { title: 'Improving Market Breadth', desc: 'Equity indices advance supported by a wide cross-section of equities rather than few mega-caps.', tooltip: 'When the majority of stocks are rising, rather than just a few mega-cap stocks dragging the entire index up.' },
    { title: 'Insider Buying Clusters', desc: 'Company founders and executives purchasing shares using their own capital.', tooltip: 'When multiple corporate executives buy their own company stock with their own money, indicating internal confidence.' }
  ];

  const protocols = [
    { num: '01', title: 'Write the Thesis First', text: '"I think X will happen by Y date because Z."', tooltip: 'Write down exactly why you are entering a trade. This stops you from changing your story later when the trade goes against you.' },
    { num: '02', title: 'Strict Position Sizing', text: 'Single stocks 1–5% of portfolio max.', tooltip: "Limit single-stock exposure to 1–5% of your total capital. A single catastrophic event won't blow up your portfolio." },
    { num: '03', title: 'Define Your Time Horizon', text: 'Day trade, swing trade, or investment.', tooltip: 'Determine if you are trading for hours (day trade), days/weeks (swing trade), or years (investment). Never turn a bad short-term trade into a long-term investment.' },
    { num: '04', title: 'Limit Orders Only', text: 'Never use market orders on anything less liquid than SPY.', tooltip: 'Specify the exact price you want to buy or sell at. Market orders can cause you to buy at a much higher price during sudden moves.' },
    { num: '05', title: 'Never Average Down', text: 'Never average down on a broken thesis.', tooltip: 'Do not buy more shares of a falling stock just to lower your average price if the reason you bought it is no longer true.' },
    { num: '06', title: 'Seek Asymmetric Bets', text: 'Skewed risk/reward (-20% downside / +100% upside).', tooltip: 'Only take trades where the potential reward is significantly larger than the maximum amount you are risking.' }
  ];

  const biases = [
    { tag: 'The Entertainment Trap', desc: 'Cramer, morning anchors—do not trade their talking points.', tooltip: 'Anchors and personalities are paid to generate excitement and views, not to make you money. Do not treat entertainment as serious financial advice.' },
    { tag: 'Recency Bias', desc: 'Assuming what just happened will keep happening.', tooltip: 'The tendency to believe that whatever just happened will continue forever. Markets move in cycles; trends eventually reverse.' },
    { tag: 'Confirmation Bias', desc: 'Only seeking bullish news when long.', tooltip: 'The bad habit of only reading bullish articles when you own a stock, while ignoring warning signs and bearish arguments.' },
    { tag: 'Anchoring', desc: 'Believing a $150 stock is "cheap" just because it used to be $200.', tooltip: 'Fixating on a past price (e.g. buying a $150 stock because it used to be $200) without realizing its actual value has changed due to interest rates or competition.' },
    { tag: 'FOMO', desc: 'If you are chasing a ripped chart, you are already late.', tooltip: 'Chasing a stock that has already gone up 50% in a few days. You are likely buying at the peak from early investors who are taking profits.' }
  ];

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
          {tickerData.map((t, idx) => {
            const isUp = t.change_pct >= 0;
            const formattedPrice = t.symbol === 'US10Y' 
              ? `${t.price.toFixed(2)}%` 
              : t.price.toLocaleString(undefined, { minimumFractionDigits: 2 });
              
            const tooltipText = t.symbol === 'US10Y' 
              ? 'The yield on the 10-Year U.S. Treasury bond. When this goes up, borrowing costs rise, putting downward pressure on stock prices, especially high-growth tech companies.'
              : t.symbol === 'VIX'
                ? 'Measures expected stock market volatility. When it is low, investors are complacent. When it spikes high, it indicates panic, which can represent a great buying opportunity.'
                : 'Contracts to buy or sell the S&P 500 at a future date. They trade almost 24/7 and show how the stock market is expected to open.';

            return (
              <div 
                key={t.symbol} 
                className="bg-slate-950/50 border border-slate-800/50 rounded-xl p-5 hover:border-slate-700 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-black text-slate-500 font-mono uppercase">{t.symbol}</span>
                    <h3 className="text-sm font-bold text-slate-200 leading-tight">
                      <Tooltip text={tooltipText} align={idx === 0 ? 'left' : idx === 2 ? 'right' : 'center'}>
                        {t.name}
                      </Tooltip>
                    </h3>
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
          {macroStackItems.map((item, idx) => (
            <div 
              key={idx}
              className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700/60 hover:bg-slate-900/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  {item.icon}
                </div>
                <h3 className="font-bold text-white text-base">
                  <Tooltip text={item.tooltip} align={idx % 3 === 0 ? 'left' : idx % 3 === 2 ? 'right' : 'center'}>
                    {item.title}
                  </Tooltip>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-4">
                Variable Reference: {item.ref}
              </div>
            </div>
          ))}
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
              {redFlags.map((item, idx) => (
                <li key={idx} className="flex gap-3 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-2" />
                  <div>
                    <h4 className="font-bold text-slate-200 text-sm">
                      <Tooltip text={item.tooltip} align="left">
                        {item.title}
                      </Tooltip>
                    </h4>
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
              {greenLights.map((item, idx) => (
                <li key={idx} className="flex gap-3 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-2" />
                  <div>
                    <h4 className="font-bold text-slate-200 text-sm">
                      <Tooltip text={item.tooltip} align="right">
                        {item.title}
                      </Tooltip>
                    </h4>
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
          {protocols.map((item, idx) => (
            <div 
              key={item.num}
              className="bg-slate-900/20 border border-slate-800/60 rounded-xl p-5 hover:border-indigo-500/20 hover:bg-slate-900/30 transition-all flex gap-4 items-start"
            >
              <div className="text-2xl font-black font-mono text-indigo-500/40 bg-indigo-500/5 border border-indigo-500/10 w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                {item.num}
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wide font-sans">
                  <Tooltip text={item.tooltip} align={idx % 2 === 0 ? 'left' : 'right'}>
                    {item.title}
                  </Tooltip>
                </h3>
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
          {biases.map((item, idx) => (
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
                  <h3 className="font-bold text-white text-sm uppercase tracking-wide mt-0.5">
                    <Tooltip text={item.tooltip} align="left">
                      {item.tag}
                    </Tooltip>
                  </h3>
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


