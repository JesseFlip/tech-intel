

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

export default ImpactBadge;
