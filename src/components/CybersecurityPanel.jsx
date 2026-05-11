
import { ShieldAlert, AlertTriangle, ShieldCheck } from 'lucide-react';
import SectionHeader from './SectionHeader';
import ImpactBadge from './ImpactBadge';
import { motion } from 'framer-motion';

const CybersecurityPanel = ({ vulnerabilities, breaches, policy, onSelectItem, selectedTag, setSelectedTag }) => {
  return (
    <section>
      <SectionHeader id="cyber" title="Cybersecurity" icon={ShieldAlert} color="rose" />
      
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1 } }
        }}
        className="space-y-8"
      >
        {/* Vulnerabilities */}
        {vulnerabilities.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldAlert size={14} className="text-rose-500" /> Active Vulnerabilities
            </h3>
            <div className="space-y-3">
              {vulnerabilities.map((v, i) => (
                <motion.div 
                  key={i} 
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  onClick={() => onSelectItem({ ...v, headline: v.name, summary: v.description, source: 'CVE' })}
                  className="p-4 bg-slate-900/30 border border-slate-800 rounded-xl cursor-pointer hover:bg-slate-900/60 hover:border-rose-500/30 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold text-white">{v.name}</span>
                      <div className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                        CVSS 8.4
                      </div>
                    </div>
                    <ImpactBadge 
                      impact={v.impact} 
                      onClick={setSelectedTag} 
                      active={selectedTag === v.impact} 
                    />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">{v.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold uppercase tracking-tighter">Affected: Enterprise Infrastructure</span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 font-bold uppercase tracking-tighter">Patch Available</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Breaches */}
        {breaches.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-500" /> Breaches & Incidents
            </h3>
            <div className="space-y-4">
              {breaches.map((b, i) => (
                <motion.div 
                  key={i} 
                  variants={{
                    hidden: { opacity: 0, x: 10 },
                    visible: { opacity: 1, x: 0 }
                  }}
                  onClick={() => onSelectItem({ headline: b.target, summary: b.detail, impact: 'HIGH', source: 'BREACH' })}
                  className="flex gap-4 cursor-pointer group"
                >
                  <div className="w-1 h-auto bg-rose-500/20 rounded-full group-hover:bg-rose-500/50 transition-colors" />
                  <div>
                    <div className="font-bold text-slate-200 group-hover:text-white transition-colors">{b.target}</div>
                    <div className="text-[10px] text-rose-400 font-black uppercase tracking-tighter mb-1">Scale: {b.scope}</div>
                    <p className="text-xs text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors">{b.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Policy */}
        <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl relative hover:bg-indigo-500/10 transition-colors">
          <ShieldCheck className="absolute top-4 right-4 text-indigo-500/20" size={24} />
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Policy Directive</h3>
          <p className="text-sm text-slate-300 italic leading-relaxed">
            "{policy}"
          </p>
        </div>
      </motion.div>
    </section>
  );
};

export default CybersecurityPanel;
