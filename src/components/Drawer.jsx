import { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import ImpactBadge from './ImpactBadge';

const Drawer = ({ isOpen, onClose, item }) => {
  const [terminalActive, setTerminalActive] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);

  // Reset terminal state whenever the selected item changes
  useEffect(() => {
    setTerminalActive(false);
    setTerminalLogs([]);
    setAnalyzing(false);
  }, [item]);

  if (!item) return null;

  const runNlpAnalysis = () => {
    if (analyzing) return;
    setTerminalActive(true);
    setAnalyzing(true);
    setTerminalLogs([]);

    const logLines = [
      `[ uplink ] Establish secure intelligence channel... SUCCESS`,
      `[ decrypt] Decrypting news signal source: ${item.source.toUpperCase()}`,
      `[ vector ] Scanning semantic anchors: "${item.headline.slice(0, 32)}..."`,
      `[ NLP    ] Executing transformer vector classification against severity: ${item.impact}`,
      `[ grounding ] Grounding cross-examination: Verified via Gemini Search Grounding`,
      `[ audit  ] System structural check: 0 vulnerabilities or integrity anomalies detected`,
      `[ status ] SIGNAL QUALITY INDEX: 94.62% | VALIDATION COMPLETED`,
      `[ action ] DIRECTIVE: Validate infrastructure vectors and queue standard patch workflow.`
    ];

    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < logLines.length) {
        setTerminalLogs(prev => [...prev, logLines[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
        setAnalyzing(false);
      }
    }, 400);
  };

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
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Intelligence Analysis</h4>
                {!terminalActive && (
                  <button 
                    onClick={runNlpAnalysis}
                    className="text-[9px] font-black tracking-widest uppercase px-2.5 py-1 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-md hover:bg-indigo-600 hover:text-white transition-all duration-300 cursor-pointer"
                  >
                    Analyze Signal
                  </button>
                )}
              </div>
              
              {!terminalActive ? (
                <p className="text-sm text-slate-400 leading-relaxed">
                  This signal indicates a significant shift in the {item.source} ecosystem. Analysts should monitor related infrastructure and policy updates. The {item.impact} impact level suggests immediate attention for organizations within the relevant sectors.
                </p>
              ) : (
                <div className="font-mono text-[10px] text-emerald-400 bg-slate-950 p-4 rounded-xl border border-emerald-950/40 min-h-[175px] flex flex-col justify-between">
                  <div className="space-y-1.5 overflow-y-auto max-h-[135px] pr-2">
                    {terminalLogs.map((log, idx) => (
                      <div key={idx} className="animate-in fade-in slide-in-from-left-1 duration-200">
                        {log}
                      </div>
                    ))}
                    {analyzing && (
                      <div className="flex items-center gap-1.5 text-slate-500 text-[8px] animate-pulse uppercase tracking-widest mt-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                        Scanning Signal Vector...
                      </div>
                    )}
                  </div>
                  {!analyzing && (
                    <button 
                      onClick={() => setTerminalActive(false)}
                      className="self-end mt-4 text-[8px] font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors cursor-pointer"
                    >
                      [ Close Terminal ]
                    </button>
                  )}
                </div>
              )}
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
