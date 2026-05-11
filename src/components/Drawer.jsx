
import { X, ExternalLink } from 'lucide-react';
import ImpactBadge from './ImpactBadge';

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

export default Drawer;
