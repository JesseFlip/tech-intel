
import { Zap, ArrowRight } from 'lucide-react';
import SectionHeader from './SectionHeader';
import ImpactBadge from './ImpactBadge';
import { motion } from 'framer-motion';

const AiTechFeed = ({ prose, items, onSelectItem, selectedTag, setSelectedTag }) => {
  return (
    <section>
      <SectionHeader id="ai" title="AI & Emerging Tech" icon={Zap} color="indigo" />
      <p className="text-slate-400 leading-relaxed mb-8">
        {prose}
      </p>
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1 } }
        }}
        className="space-y-6"
      >
        {items.map((item, i) => (
          <motion.div 
            key={i} 
            variants={{
              hidden: { opacity: 0, x: -20 },
              visible: { opacity: 1, x: 0 }
            }}
            onClick={() => onSelectItem(item)}
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
            <div className="flex items-center gap-1 mt-3 text-xs text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
              Analyze Signal Vector <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-12 text-slate-600 italic">No matching items found.</div>
        )}
      </motion.div>
    </section>
  );
};

export default AiTechFeed;
