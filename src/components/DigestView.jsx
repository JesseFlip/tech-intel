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
      className="pb-24"
    >
      <header className="mb-12">
        <div className="flex items-center gap-3 text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mb-2">
          <Clock size={14} />
          <span>{isLatest ? "Live Intelligence Report" : `Archive: ${digest.date}`}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
          {isLatest ? "The Daily Pulse" : digest.date}
        </h1>
      </header>

      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.2 }}
        id="markets"
      >
        <MarketIntelligence pulse={digest.sentiment_pulse} />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.3 }}
        id="financial"
      >
        <FinancialCard data={digest.sections.financial} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <AiTechFeed 
          prose={digest.sections.ai.prose}
          items={filteredAIItems}
          onSelectItem={setSelectedItem}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
        />
        <CybersecurityPanel 
          vulnerabilities={filteredVulns}
          breaches={filteredBreaches}
          policy={digest.sections.cybersecurity.policy}
          onSelectItem={setSelectedItem}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
        />
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
