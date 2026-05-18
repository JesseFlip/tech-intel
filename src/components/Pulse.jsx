import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X } from 'lucide-react';

const Pulse = ({ children, active }) => {
  const triggerScroll = () => {
    const el = document.getElementById('cyber');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={`relative transition-all duration-500 ${
      active ? 'ring-1 ring-indigo-500/20 bg-indigo-500/[0.01] rounded-2xl p-1' : ''
    }`}>
      {children}
      
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-[9999] max-w-sm w-[340px] bg-slate-950 border border-indigo-500/30 rounded-xl p-4 shadow-[0_20px_50px_rgba(99,102,241,0.15)] backdrop-blur-md"
          >
            <div className="flex gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 self-start shrink-0">
                <ShieldAlert size={18} className="animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h5 className="text-[10px] font-black text-white uppercase tracking-widest font-sans">
                    TELEMETRY ALERT
                  </h5>
                  <span className="text-[8px] font-mono px-1 rounded bg-indigo-500/10 text-indigo-400 font-bold animate-pulse">
                    LIVE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal mt-1 font-mono">
                  &gt; CRITICAL_INTEL: High-impact signal detected in stream telemetry.
                </p>
                <div className="flex gap-2 mt-3.5">
                  <button
                    onClick={triggerScroll}
                    className="text-[8px] font-black uppercase tracking-wider px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors cursor-pointer"
                  >
                    Investigate Vector
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Pulse;
