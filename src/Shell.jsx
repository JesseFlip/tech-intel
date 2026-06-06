// Shell.jsx
// The unified product chrome. One master "Tech Intel" brand and a single global
// nav that switches between the two first-class workspaces — Intelligence (the
// macro/cyber/AI dashboard) and the Idea Lab (evaluate + plan + execute). This is
// what ties the originally-separate apps into one coherent product.

const TABS = [
  { id: 'intelligence', label: 'Intelligence', hint: 'Macro, cyber & AI signal' },
  { id: 'idealab', label: 'Idea Lab', hint: 'Evaluate · plan · execute' },
];

export { TABS };

export default function Shell({ active, onChange, children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col">
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur supports-[backdrop-filter]:bg-slate-950/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-4 h-14">
          {/* Master brand */}
          <button
            onClick={() => onChange(TABS[0].id)}
            className="flex items-center gap-2.5 shrink-0 group"
            title="Tech Intel"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-sm shadow-lg shadow-indigo-500/30">
              ⚡
            </span>
            <div className="text-left leading-tight">
              <div className="text-sm font-bold tracking-tight text-white">TECH INTEL</div>
              <div className="hidden sm:block text-[10px] text-slate-500">
                Signal → ideas worth building
              </div>
            </div>
          </button>

          {/* Workspace switcher */}
          <div className="flex items-center gap-1 ml-auto rounded-xl bg-slate-900/80 border border-slate-800 p-1">
            {TABS.map((tab) => {
              const isActive = active === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onChange(tab.id)}
                  title={tab.hint}
                  className={`relative px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                  }`}
                  aria-pressed={isActive}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Live status dot */}
          <div className="hidden md:flex items-center gap-1.5 shrink-0 pl-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Live</span>
          </div>
        </div>
      </nav>

      <div className="flex-grow flex flex-col">{children}</div>
    </div>
  );
}
