import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, AlertTriangle } from 'lucide-react';
import MarketIntelligence from './MarketIntelligence';
import FinancialCard from './FinancialCard';
import AiTechFeed from './AiTechFeed';
import CybersecurityPanel from './CybersecurityPanel';
import Drawer from './Drawer';
import { motion, AnimatePresence } from 'framer-motion';

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
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="inline-block w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full mb-4" 
      />
      <div className="text-slate-500 font-medium">Synthesizing intelligence...</div>
    </div>
  );

  if (error) return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="py-24 text-center max-w-md mx-auto"
    >
      <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertTriangle size={32} />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Retrieval Failed</h2>
      <p className="text-slate-400 mb-8">{error}</p>
      <button onClick={fetchDigest} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all">
        Try Again
      </button>
    </motion.div>
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
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="pb-24 animate-in fade-in duration-500"
    >
      {/* 1. Top Section: Market Indicators & Fear/Greed */}
      <MarketIntelligence pulse={digest.sentiment_pulse} onSelectItem={setSelectedItem} />

      {/* 2. Lower Grid: Economic Drivers & Curated Tech Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-8">
        
        {/* Left Column: Economic Signals & Macro Insights */}
        <div className="space-y-6">
          <div className="border-b border-slate-800/80 pb-2 mb-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Telemetry Section 01</span>
            <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">Economic Signals</h3>
          </div>
          <FinancialCard data={digest.sections.financial} />
        </div>

        {/* Center Column: AI & Emerging Tech Intelligence */}
        <div className="space-y-6">
          <div className="border-b border-slate-800/80 pb-2 mb-4">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Telemetry Section 02</span>
            <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">AI & Emerging Tech</h3>
          </div>
          <AiTechFeed 
            prose={digest.sections.ai.prose}
            items={filteredAIItems}
            onSelectItem={setSelectedItem}
            selectedTag={selectedTag}
            setSelectedTag={setSelectedTag}
          />
        </div>

        {/* Right Column: Cybersecurity Threat Vectors */}
        <div className="space-y-6">
          <div className="border-b border-slate-800/80 pb-2 mb-4">
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest font-mono">Telemetry Section 03</span>
            <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">Threat Intelligence</h3>
          </div>
          <CybersecurityPanel 
            vulnerabilities={filteredVulns}
            breaches={filteredBreaches}
            policy={digest.sections.cybersecurity.policy}
            onSelectItem={setSelectedItem}
            selectedTag={selectedTag}
            setSelectedTag={setSelectedTag}
          />
        </div>

      </div>

      <AnimatePresence>
        {selectedItem && (
          <Drawer 
            isOpen={!!selectedItem} 
            onClose={() => setSelectedItem(null)} 
            item={selectedItem} 
          />
        )}
      </AnimatePresence>
    </motion.article>
  );
};

export default DigestView;
