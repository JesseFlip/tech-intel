import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useParams } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ShieldAlert, 
  Zap, 
  Globe, 
  BarChart3, 
  ArrowRight, 
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

// --- Components ---

const SentimentIcon = ({ sentiment, size = 16 }) => {
  if (sentiment === 'BULLISH') return <TrendingUp size={size} className="text-emerald-400" />;
  if (sentiment === 'BEARISH') return <TrendingDown size={size} className="text-rose-400" />;
  return <Minus size={size} className="text-slate-400" />;
};

const ImpactBadge = ({ impact }) => {
  const styles = {
    HIGH: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    CRITICAL: 'bg-purple-500/10 text-purple-400 border-purple-500/20 animate-pulse',
  };
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold tracking-wider ${styles[impact] || styles.LOW}`}>
      {impact}
    </span>
  );
};

const MarketPulse = ({ pulse }) => {
  if (!pulse) return null;
  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
      <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl backdrop-blur-sm">
        <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Fear & Greed</div>
        <div className="text-lg font-bold text-white">{pulse.fear_greed}</div>
      </div>
      {pulse.tickers.map((ticker) => (
        <div key={ticker.symbol} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl backdrop-blur-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{ticker.symbol}</span>
            <SentimentIcon sentiment={ticker.sentiment} />
          </div>
          <div className="text-xs text-slate-300 line-clamp-2 leading-tight group-hover:line-clamp-none transition-all duration-300">
            {ticker.price_context}
          </div>
          <div className={`absolute bottom-0 left-0 h-0.5 w-full ${
            ticker.sentiment === 'BULLISH' ? 'bg-emerald-500/30' : 
            ticker.sentiment === 'BEARISH' ? 'bg-rose-500/30' : 'bg-slate-500/30'
          }`} />
        </div>
      ))}
    </section>
  );
};

const FinancialCard = ({ data }) => {
  if (!data) return null;
  return (
    <section className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 mb-12 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 opacity-10">
        <BarChart3 size={80} />
      </div>
      
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-indigo-500/10 rounded-lg">
          <Globe size={20} className="text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Market Intelligence</h2>
        <div className="ml-auto">
          <SentimentIcon sentiment={data.market_sentiment} size={24} />
        </div>
      </div>

      <p className="text-slate-300 leading-relaxed mb-8 text-lg font-medium">
        {data.executive_summary}
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Zap size={14} /> Key Drivers
          </h3>
          <ul className="space-y-3">
            {data.key_drivers.map((driver, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                <ChevronRight size={14} className="mt-1 text-indigo-500 shrink-0" />
                {driver}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <TrendingUp size={14} /> Market Insights
          </h3>
          <ul className="space-y-3">
            {data.insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                {insight}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

const SectionHeader = ({ title, icon: Icon, color = 'indigo' }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className={`p-2 bg-${color}-500/10 rounded-lg`}>
      <Icon size={20} className={`text-${color}-400`} />
    </div>
    <h2 className="text-xl font-bold text-white uppercase tracking-tight">{title}</h2>
  </div>
);

const Layout = ({ children }) => (
  <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
    <div className="max-w-4xl mx-auto px-6 py-12">
      <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Link to="/" className="group inline-flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
              <Zap size={24} className="text-white fill-white" />
            </div>
            <span className="text-3xl font-black tracking-tighter text-white">TECH INTEL</span>
          </Link>
          <p className="text-slate-500 text-sm font-medium">Grounded intelligence for the elite tech professional.</p>
        </div>
        <nav className="flex items-center gap-1 p-1 bg-slate-900/50 rounded-lg border border-slate-800">
          <Link to="/" className="px-4 py-1.5 text-sm font-semibold rounded-md hover:text-white transition-all text-slate-400 hover:bg-slate-800">Today</Link>
          <Link to="/archive" className="px-4 py-1.5 text-sm font-semibold rounded-md hover:text-white transition-all text-slate-400 hover:bg-slate-800">Archive</Link>
        </nav>
      </header>

      <main>
        {children}
      </main>

      <footer className="mt-32 pt-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-sm">
        <div className="flex items-center gap-6">
          <a href="https://github.com/JesseFlip/tech-intel" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
            <ExternalLink size={14} /> Repository
          </a>
          <span>Updated Daily at 07:00 UTC</span>
        </div>
        <div className="text-[10px] uppercase tracking-widest font-bold">
          Powered by Gemini 2.5 Flash
        </div>
      </footer>
    </div>
  </div>
);

const DigestView = ({ isLatest = false }) => {
  const { date } = useParams();
  const [digest, setDigest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDigest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fileName = isLatest ? 'latest.json' : `${date}.json`;
      const response = await fetch(`${import.meta.env.BASE_URL}digests/${fileName}`);
      if (!response.ok) throw new Error(`Digest not found: ${fileName}`);
      const data = await response.json();
      setDigest(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [date, isLatest]);

  useEffect(() => {
    fetchDigest();
  }, [fetchDigest]);

  if (loading) return (
    <div className="py-24 text-center">
      <div className="inline-block w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
      <div className="text-slate-500 font-medium">Synthesizing intelligence...</div>
    </div>
  );

  if (error) return (
    <div className="py-24 text-center max-w-md mx-auto">
      <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertTriangle size={32} />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Retrieval Failed</h2>
      <p className="text-slate-400 mb-8">{error}</p>
      <button onClick={fetchDigest} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all">
        Try Again
      </button>
    </div>
  );

  if (!digest) return null;

  return (
    <article className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="mb-12">
        <div className="flex items-center gap-3 text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mb-2">
          <Clock size={14} />
          <span>{isLatest ? "Live Intelligence Report" : `Archive: ${digest.date}`}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
          {isLatest ? "The Daily Pulse" : digest.date}
        </h1>
      </header>

      <MarketPulse pulse={digest.sentiment_pulse} />
      
      <FinancialCard data={digest.sections.financial} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* AI Section */}
        <section>
          <SectionHeader title="AI & Emerging Tech" icon={Zap} color="indigo" />
          <p className="text-slate-400 leading-relaxed mb-8">
            {digest.sections.ai.prose}
          </p>
          <div className="space-y-6">
            {digest.sections.ai.items.map((item, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <ImpactBadge impact={item.impact} />
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.source}</span>
                </div>
                <h3 className="text-slate-100 font-bold group-hover:text-indigo-400 transition-colors mb-2 leading-snug">
                  {item.headline}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed group-hover:text-slate-400 transition-colors">
                  {item.summary}
                </p>
                {item.url && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-3 text-xs text-indigo-500 font-bold hover:underline">
                    Read Detail <ArrowRight size={12} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Cybersecurity Section */}
        <section>
          <SectionHeader title="Cybersecurity" icon={ShieldAlert} color="rose" />
          
          <div className="space-y-8">
            {/* Vulnerabilities */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <ShieldAlert size={14} className="text-rose-500" /> Active Vulnerabilities
              </h3>
              <div className="space-y-3">
                {digest.sections.cybersecurity.vulnerabilities.map((v, i) => (
                  <div key={i} className="p-4 bg-slate-900/30 border border-slate-800 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-mono font-bold text-white">{v.name}</span>
                      <ImpactBadge impact={v.impact} />
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{v.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Breaches */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-500" /> Breaches & Incidents
              </h3>
              <div className="space-y-4">
                {digest.sections.cybersecurity.breaches.map((b, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-1 h-auto bg-rose-500/20 rounded-full" />
                    <div>
                      <div className="font-bold text-slate-200">{b.target}</div>
                      <div className="text-[10px] text-rose-400 font-black uppercase tracking-tighter mb-1">Scale: {b.scope}</div>
                      <p className="text-xs text-slate-500 leading-relaxed">{b.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Policy */}
            <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl relative">
              <ShieldCheck className="absolute top-4 right-4 text-indigo-500/20" size={24} />
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Policy Directive</h3>
              <p className="text-sm text-slate-300 italic leading-relaxed">
                "{digest.sections.cybersecurity.policy}"
              </p>
            </div>
          </div>
        </section>
      </div>
    </article>
  );
};

const ArchiveView = () => {
  const [index, setIndex] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIndex = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}digests/index.json`);
        if (!response.ok) throw new Error('Could not load archive index.');
        const data = await response.json();
        setIndex(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchIndex();
  }, []);

  if (loading) return (
    <div className="py-24 text-center">
      <div className="inline-block w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
      <div className="text-slate-500 font-medium">Opening vaults...</div>
    </div>
  );

  if (error) return <div className="py-24 text-center text-rose-500 font-bold">{error}</div>;

  return (
    <div className="animate-in fade-in duration-700">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Intelligence Archive</h1>
        <p className="text-slate-500 font-medium">Retrospective look at past technical signals.</p>
      </header>
      <div className="grid gap-6">
        {index.map((item) => (
          <Link 
            key={item.date} 
            to={`/digest/${item.date}`} 
            className="group block p-6 bg-slate-900/30 border border-slate-800 rounded-2xl hover:border-indigo-500/50 hover:bg-slate-900/50 transition-all shadow-sm"
          >
            <div className="flex justify-between items-center">
              <div>
                <time className="text-[10px] text-slate-500 uppercase tracking-widest font-black block mb-1 group-hover:text-indigo-400 transition-colors">
                  {item.date}
                </time>
                <h2 className="text-xl font-bold text-slate-200 group-hover:text-white transition-colors">
                  {item.headline}
                </h2>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <ArrowRight size={20} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const NotFound = () => (
  <div className="py-32 text-center">
    <h1 className="text-6xl font-black text-white mb-4">404</h1>
    <p className="text-slate-500 mb-12 text-lg">Signal lost. This coordinate does not exist.</p>
    <Link to="/" className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20">
      Return to Pulse
    </Link>
  </div>
);

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DigestView isLatest />} />
        <Route path="/digest/:date" element={<DigestView />} />
        <Route path="/archive" element={<ArchiveView />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

export default App;
