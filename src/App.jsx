import { useState, useEffect, useCallback, useMemo } from 'react';
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
  ChevronRight,
  Search,
  Filter,
  X,
  Sun,
  Moon,
  Bell,
  BellOff
} from 'lucide-react';
import { createContext, useContext } from 'react';

const ThemeContext = createContext();
const useTheme = () => useContext(ThemeContext);

// --- Components ---

const Pulse = ({ children, active }) => (
  <div className={`relative ${active ? 'animate-pulse ring-2 ring-indigo-500 rounded-2xl' : ''}`}>
    {children}
    {active && (
      <span className="absolute -top-2 -right-2 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
      </span>
    )}
  </div>
);

const SentimentIcon = ({ sentiment, size = 16 }) => {
  if (sentiment === 'BULLISH') return <TrendingUp size={size} className="text-emerald-400" />;
  if (sentiment === 'BEARISH') return <TrendingDown size={size} className="text-rose-400" />;
  return <Minus size={size} className="text-slate-400" />;
};

const ImpactBadge = ({ impact, onClick, active }) => {
  const styles = {
    HIGH: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    CRITICAL: 'bg-purple-500/10 text-purple-400 border-purple-500/20 animate-pulse',
  };
  return (
    <button 
      onClick={(e) => { e.stopPropagation(); onClick?.(impact); }}
      aria-label={`Filter by ${impact} impact`}
      className={`text-[10px] px-1.5 py-0.5 rounded border font-bold tracking-wider transition-all cursor-pointer ${
        active ? 'ring-2 ring-indigo-500 bg-indigo-500/20 text-white' : ''
      } ${styles[impact] || styles.LOW} hover:scale-105 active:scale-95`}
    >
      {impact}
    </button>
  );
};

const MarketPulse = ({ pulse }) => {
  if (!pulse) return null;
  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
      <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl backdrop-blur-sm hover:translate-y-[-2px] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-slate-700">
        <div className="flex justify-between items-start mb-2">
          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Fear & Greed</div>
          <Sparkline data={[40, 45, 42, 50, 48, 55, 60]} color="#f59e0b" />
        </div>
        <div className="text-lg font-bold text-white">{pulse.fear_greed}</div>
      </div>
      {pulse.tickers.map((ticker) => (
        <div key={ticker.symbol} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl backdrop-blur-sm relative overflow-hidden group hover:translate-y-[-2px] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-slate-700">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{ticker.symbol}</span>
            <Sparkline 
              data={ticker.sentiment === 'BULLISH' ? [30, 35, 32, 40, 45, 42, 50] : [70, 65, 68, 60, 55, 58, 50]} 
              color={ticker.sentiment === 'BULLISH' ? '#10b981' : ticker.sentiment === 'BEARISH' ? '#f43f5e' : '#64748b'} 
            />
          </div>
          <div className="flex justify-between items-end">
            <div className="text-xs text-slate-300 line-clamp-2 leading-tight group-hover:line-clamp-none transition-all duration-300 max-w-[70%]">
              {ticker.price_context}
            </div>
            <SentimentIcon sentiment={ticker.sentiment} />
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

const SectionHeader = ({ id, title, icon: Icon, color = 'indigo' }) => (
  <div id={id} className="flex items-center gap-3 mb-6 scroll-mt-24">
    <div className={`p-2 bg-${color}-500/10 rounded-lg`}>
      <Icon size={20} className={`text-${color}-400`} />
    </div>
    <h2 className="text-xl font-bold text-white uppercase tracking-tight">{title}</h2>
  </div>
);

const Sparkline = ({ data = [], color = '#6366f1' }) => {
  const min = Math.min(...data, 0);
  const max = Math.max(...data, 10);
  const range = max - min;
  const width = 100;
  const height = 30;

  const points = data.map((val, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((val - min) / range) * height
  }));

  const pathData = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]"
      />
    </svg>
  );
};

const Drawer = ({ isOpen, onClose, item }) => {
  if (!item) return null;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <aside 
        className={`fixed right-0 top-0 h-full w-full max-w-xl bg-slate-900 border-l border-slate-800 z-[101] shadow-2xl transition-transform duration-500 ease-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="h-full flex flex-col p-8 overflow-y-auto">
          <button 
            onClick={onClose}
            className="self-end p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors mb-8"
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center gap-3 mb-6">
            <ImpactBadge impact={item.impact} />
            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{item.source}</span>
          </div>

          <h2 className="text-3xl font-black text-white tracking-tighter mb-6 leading-tight">
            {item.headline}
          </h2>

          <div className="prose prose-invert max-w-none">
            <p className="text-lg text-slate-300 leading-relaxed mb-8">
              {item.summary}
            </p>
            
            {/* Extended content placeholder or if it exists in item */}
            <div className="bg-slate-950/50 rounded-2xl p-6 border border-slate-800 mb-8">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Intelligence Analysis</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                This signal indicates a significant shift in the {item.source} ecosystem. Analysts should monitor related infrastructure and policy updates. The {item.impact} impact level suggests immediate attention for organizations within the relevant sectors.
              </p>
            </div>
          </div>

          <div className="mt-auto pt-12">
            {item.url && (
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center gap-3 w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
              >
                Access Original Source <ExternalLink size={18} />
              </a>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

const SidebarTOC = () => {
  const [activeSection, setActiveSection] = useState('markets');
  const sections = useMemo(() => [
    { id: 'markets', label: 'Markets', icon: BarChart3 },
    { id: 'financial', label: 'Financial', icon: Globe },
    { id: 'ai', label: 'AI & Tech', icon: Zap },
    { id: 'cyber', label: 'Cybersecurity', icon: ShieldAlert },
  ], []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5, rootMargin: '-80px 0px -50% 0px' }
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav className="hidden lg:flex flex-col gap-4 sticky top-32 h-fit w-48 shrink-0">
      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-2 px-4">Navigation</div>
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeSection === s.id 
              ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5' 
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
          }`}
        >
          <s.icon size={16} />
          {s.label}
        </a>
      ))}
    </nav>
  );
};

const Layout = ({ children, searchQuery, setSearchQuery, selectedTag, setSelectedTag, notificationsEnabled, toggleNotifications }) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary selection:bg-indigo-500/30 transition-colors duration-300">
      <header className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-border-accent/50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
          <div className="flex items-center gap-8 shrink-0">
            <Link to="/" className="group flex items-center gap-3" aria-label="Tech Intel Home">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                <Zap size={24} className="text-white fill-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-text-primary hidden sm:block">TECH INTEL</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1 p-1 bg-bg-secondary/50 rounded-lg border border-border-accent">
              <Link to="/" className="px-4 py-1.5 text-sm font-semibold rounded-md hover:text-text-primary transition-all text-text-secondary hover:bg-bg-secondary">Today</Link>
              <Link to="/archive" className="px-4 py-1.5 text-sm font-semibold rounded-md hover:text-text-primary transition-all text-text-secondary hover:bg-bg-secondary">Archive</Link>
            </nav>
          </div>

          <div className="flex-1 max-w-xl relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search intelligence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search intelligence reports"
              className="w-full bg-bg-secondary/50 border border-border-accent rounded-xl py-2.5 pl-12 pr-4 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-bg-secondary transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleNotifications}
              aria-label={notificationsEnabled ? "Disable push notifications" : "Enable push notifications"}
              className={`p-2.5 rounded-xl transition-all border shadow-sm ${
                notificationsEnabled 
                  ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20' 
                  : 'bg-bg-secondary text-text-secondary hover:text-text-primary border-transparent hover:border-border-accent'
              }`}
            >
              {notificationsEnabled ? <Bell size={20} /> : <BellOff size={20} />}
            </button>

            <button 
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="p-2.5 bg-bg-secondary hover:bg-bg-secondary rounded-xl text-text-secondary hover:text-text-primary transition-all border border-transparent hover:border-border-accent shadow-sm"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {selectedTag && (
              <div className="hidden xl:flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg">
                <Filter size={12} className="text-indigo-400" />
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{selectedTag}</span>
                <button onClick={() => setSelectedTag(null)} aria-label="Remove filter" className="text-indigo-400 hover:text-white">
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12">
        <SidebarTOC />
        <main className="flex-1 min-w-0" role="main">
          {children}
        </main>
      </div>

      <footer className="max-w-6xl mx-auto px-6 mt-32 py-12 border-t border-border-accent flex flex-col md:flex-row justify-between items-center gap-6 text-text-secondary text-sm">
        <div className="flex items-center gap-6">
          <a href="https://github.com/JesseFlip/tech-intel" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors flex items-center gap-2">
            <ExternalLink size={14} /> Repository
          </a>
          <span>Updated Daily at 07:00 UTC</span>
        </div>
        <div className="text-[10px] uppercase tracking-widest font-bold">
          Powered by Gemini 2.5 Flash
        </div>
      </footer>
    </div>
  );
};

const DigestView = ({ isLatest = false, searchQuery, selectedTag, setSelectedTag }) => {
  const { date } = useParams();
  const [digest, setDigest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

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
    fetchDigest(); // eslint-disable-line react-hooks/set-state-in-effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, isLatest]); 

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

  // Filtering Logic
  const filteredAIItems = digest.sections.ai.items.filter(item => {
    const matchesSearch = !searchQuery || 
      item.headline.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || item.impact === selectedTag;
    return matchesSearch && matchesTag;
  });

  const filteredVulns = digest.sections.cybersecurity.vulnerabilities.filter(v => {
    const matchesSearch = !searchQuery || 
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      v.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || v.impact === selectedTag;
    return matchesSearch && matchesTag;
  });

  const filteredBreaches = digest.sections.cybersecurity.breaches.filter(b => {
    const matchesSearch = !searchQuery || 
      b.target.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.detail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

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

      <div id="markets">
        <MarketPulse pulse={digest.sentiment_pulse} />
      </div>
      
      <div id="financial">
        <FinancialCard data={digest.sections.financial} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* AI Section */}
        <section>
          <SectionHeader id="ai" title="AI & Emerging Tech" icon={Zap} color="indigo" />
          <p className="text-slate-400 leading-relaxed mb-8">
            {digest.sections.ai.prose}
          </p>
          <div className="space-y-6">
            {filteredAIItems.map((item, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedItem(item)}
                className="group cursor-pointer p-4 -mx-4 rounded-2xl hover:bg-slate-900/40 border border-transparent hover:border-slate-800 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
              >
                <div className="flex items-center justify-between mb-2">
                  <ImpactBadge 
                    impact={item.impact} 
                    onClick={setSelectedTag} 
                    active={selectedTag === item.impact} 
                  />
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.source}</span>
                </div>
                <h3 className="text-slate-100 font-bold group-hover:text-indigo-400 transition-colors mb-2 leading-snug">
                  {item.headline}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed group-hover:text-slate-400 transition-colors">
                  {item.summary}
                </p>
                <div className="flex items-center gap-1 mt-3 text-xs text-indigo-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Analyze Signal <ArrowRight size={12} />
                </div>
              </div>
            ))}
            {filteredAIItems.length === 0 && (
              <div className="text-center py-12 text-slate-600 italic">No matching items found.</div>
            )}
          </div>
        </section>

        {/* Cybersecurity Section */}
        <section>
          <SectionHeader id="cyber" title="Cybersecurity" icon={ShieldAlert} color="rose" />
          
          <div className="space-y-8">
            {/* Vulnerabilities */}
            {filteredVulns.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <ShieldAlert size={14} className="text-rose-500" /> Active Vulnerabilities
                </h3>
                <div className="space-y-3">
                  {filteredVulns.map((v, i) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedItem({ ...v, headline: v.name, summary: v.description, source: 'CVE' })}
                      className="p-4 bg-slate-900/30 border border-slate-800 rounded-xl cursor-pointer hover:bg-slate-900/60 hover:border-rose-500/30 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-mono font-bold text-white">{v.name}</span>
                        <ImpactBadge 
                          impact={v.impact} 
                          onClick={setSelectedTag} 
                          active={selectedTag === v.impact} 
                        />
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{v.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Breaches */}
            {filteredBreaches.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-500" /> Breaches & Incidents
                </h3>
                <div className="space-y-4">
                  {filteredBreaches.map((b, i) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedItem({ headline: b.target, summary: b.detail, impact: 'HIGH', source: 'BREACH' })}
                      className="flex gap-4 cursor-pointer group"
                    >
                      <div className="w-1 h-auto bg-rose-500/20 rounded-full group-hover:bg-rose-500/50 transition-colors" />
                      <div>
                        <div className="font-bold text-slate-200 group-hover:text-white transition-colors">{b.target}</div>
                        <div className="text-[10px] text-rose-400 font-black uppercase tracking-tighter mb-1">Scale: {b.scope}</div>
                        <p className="text-xs text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors">{b.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Policy */}
            <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl relative hover:bg-indigo-500/10 transition-colors">
              <ShieldCheck className="absolute top-4 right-4 text-indigo-500/20" size={24} />
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Policy Directive</h3>
              <p className="text-sm text-slate-300 italic leading-relaxed">
                "{digest.sections.cybersecurity.policy}"
              </p>
            </div>
          </div>
        </section>
      </div>

      <Drawer 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        item={selectedItem} 
      />
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [realtimeAlert, setRealtimeAlert] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // WebSocket Scaffold
  useEffect(() => {
    // This is a simulation of real-time WebSocket events
    const simulateRealtime = setInterval(() => {
      if (Math.random() > 0.95) {
        console.log("Real-time intelligence received...");
        setRealtimeAlert(true);
        setTimeout(() => setRealtimeAlert(false), 5000);
        
        if (notificationsEnabled && Notification.permission === "granted") {
          new Notification("CRITICAL INTEL: New Vulnerability Detected", {
            body: "A high-impact CVE has just been published. View details in the dashboard.",
            icon: "/favicon.ico"
          });
        }
      }
    }, 15000);

    return () => clearInterval(simulateRealtime);
  }, [notificationsEnabled]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Layout 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        selectedTag={selectedTag} 
        setSelectedTag={setSelectedTag}
        notificationsEnabled={notificationsEnabled}
        toggleNotifications={toggleNotifications}
      >
        <Pulse active={realtimeAlert}>
          <Routes>
            <Route path="/" element={<DigestView isLatest searchQuery={searchQuery} selectedTag={selectedTag} setSelectedTag={setSelectedTag} />} />
            <Route path="/digest/:date" element={<DigestView searchQuery={searchQuery} selectedTag={selectedTag} setSelectedTag={setSelectedTag} />} />
            <Route path="/archive" element={<ArchiveView />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Pulse>
      </Layout>
    </ThemeContext.Provider>
  );
}

export default App;
