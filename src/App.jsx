import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useParams } from 'react-router-dom';

const Layout = ({ children }) => (
  <div className="min-h-screen flex flex-col font-sans max-w-3xl mx-auto px-4 py-8">
    <header className="mb-12">
      <div className="flex items-baseline justify-between mb-2">
        <Link to="/" className="text-3xl font-bold tracking-tight hover:opacity-80 transition-opacity">
          Tech Intel
        </Link>
        <nav className="space-x-4">
          <Link to="/" className="text-sm font-medium hover:underline underline-offset-4 text-slate-300 hover:text-white transition-colors">Today</Link>
          <Link to="/archive" className="text-sm font-medium hover:underline underline-offset-4 text-slate-300 hover:text-white transition-colors">Archive</Link>
        </nav>
      </div>
      <p className="text-slate-400 text-sm">AI & cybersecurity, daily.</p>
    </header>

    <main className="flex-grow">
      {children}
    </main>

    <footer className="mt-20 pt-8 border-t border-slate-800 text-slate-500 text-sm flex justify-between items-center">
      <a 
        href="https://github.com/JesseFlip/tech-intel" 
        target="_blank" 
        rel="noopener noreferrer"
        className="hover:text-slate-300 transition-colors"
      >
        Source Repo
      </a>
      <span>Updated daily</span>
    </footer>
  </div>
);

const DigestView = ({ isLatest = false }) => {
  const { date } = useParams();
  const [digest, setDigest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDigest = async () => {
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
  };

  useEffect(() => {
    fetchDigest();
  }, [date, isLatest]);

  if (loading) return <div className="animate-pulse py-12 text-center text-slate-500">Loading digest...</div>;
  if (error) return (
    <div className="py-12 text-center">
      <p className="text-red-400 mb-4">{error}</p>
      <button 
        onClick={fetchDigest}
        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded transition-colors text-sm"
      >
        Retry
      </button>
    </div>
  );
  if (!digest) return <div className="py-12 text-center text-slate-500">No digest data available.</div>;

  return (
    <article className="space-y-12">
      <header>
        <h1 className="text-xl font-bold mb-1">{isLatest ? "Today's Digest" : `Digest: ${digest.date}`}</h1>
        <time className="text-xs text-slate-500 uppercase tracking-widest">{digest.date}</time>
      </header>

      {/* TL;DR */}
      <section>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">TL;DR</h2>
        <ul className="space-y-4 list-disc pl-5 text-slate-200">
          {digest.tldr.map((item, i) => (
            <li key={i} className="leading-relaxed">{item}</li>
          ))}
        </ul>
      </section>

      {/* AI */}
      <section>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">AI</h2>
        <div className="space-y-6">
          <p className="leading-relaxed text-slate-300">{digest.sections.ai.prose}</p>
          <ul className="space-y-3">
            {digest.sections.ai.items.map((item, i) => (
              <li key={i}>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-100 font-medium hover:underline underline-offset-4 block"
                >
                  {item.headline}
                </a>
                <span className="text-xs text-slate-500 uppercase tracking-tighter">{item.source}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Cybersecurity */}
      <section className="space-y-8">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Cybersecurity</h2>
        
        {/* Vulnerabilities */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-400 border-b border-slate-800 pb-1">Active Vulnerabilities</h3>
          <div className="grid gap-4">
            {digest.sections.cybersecurity.vulnerabilities.map((v, i) => (
              <div key={i} className="p-4 border border-slate-800 rounded bg-slate-900/50">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm font-mono text-slate-100">{v.cve}</span>
                  <span className="text-xs font-bold text-slate-500">CVSS {v.cvss}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-bold tracking-tighter">{v.status}</span>
                </div>
                <div className="font-medium text-slate-300 mb-2">{v.product}</div>
                <a href={v.url} className="text-xs text-slate-400 hover:text-white transition-colors">Advisory →</a>
              </div>
            ))}
          </div>
        </div>

        {/* Breaches */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-400 border-b border-slate-800 pb-1">Breaches & Incidents</h3>
          <ul className="space-y-4">
            {digest.sections.cybersecurity.breaches.map((b, i) => (
              <li key={i}>
                <div className="font-medium text-slate-200 mb-1">{b.org}</div>
                <div className="text-sm text-slate-500 mb-2">Scale: {b.scale}</div>
                <a href={b.url} className="text-xs text-slate-400 hover:text-white transition-colors">Full Report →</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Policy */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-400 border-b border-slate-800 pb-1">Policy & Defense</h3>
          <p className="leading-relaxed text-slate-300 text-sm italic">{digest.sections.cybersecurity.policy_prose}</p>
        </div>
      </section>

      {/* Worth a Click */}
      <section>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Worth a Click</h2>
        <ul className="space-y-6">
          {digest.worth_a_click.map((item, i) => (
            <li key={i}>
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-100 font-medium hover:underline underline-offset-4 block mb-1"
              >
                {item.title}
              </a>
              <p className="text-sm text-slate-400">{item.framing}</p>
            </li>
          ))}
        </ul>
      </section>
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

  if (loading) return <div className="py-12 text-center text-slate-500">Loading archive...</div>;
  if (error) return <div className="py-12 text-center text-red-400">{error}</div>;

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-2xl font-bold mb-1 text-white">Archive</h1>
        <p className="text-slate-500 text-sm">Past daily digests.</p>
      </header>
      <ul className="space-y-8">
        {index.map((item) => (
          <li key={item.date} className="group">
            <Link to={`/digest/${item.date}`} className="block">
              <time className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 block group-hover:text-slate-300 transition-colors">{item.date}</time>
              <h2 className="text-lg font-semibold text-slate-200 group-hover:underline underline-offset-4 decoration-slate-600 decoration-1 transition-all">
                {item.headline}
              </h2>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

const NotFound = () => (
  <div className="py-20 text-center">
    <h1 className="text-4xl font-bold mb-4 text-white">404</h1>
    <p className="text-slate-400 mb-8">This page doesn't exist.</p>
    <Link to="/" className="text-slate-100 font-medium hover:underline underline-offset-4">Back Home</Link>
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
