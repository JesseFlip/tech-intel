

const SkeletonLoader = ({ type = "card", count = 1 }) => {
  const loaders = Array(count).fill(0);

  const renderLoader = (i) => {
    if (type === "card") {
      return (
        <div key={i} className="bg-slate-900/30 border border-slate-800 p-4 rounded-xl animate-pulse">
          <div className="flex justify-between mb-4">
            <div className="w-12 h-2 bg-slate-800 rounded" />
            <div className="w-16 h-4 bg-slate-800 rounded" />
          </div>
          <div className="w-2/3 h-4 bg-slate-800 rounded mb-2" />
          <div className="w-full h-3 bg-slate-800 rounded mb-1" />
          <div className="w-1/2 h-3 bg-slate-800 rounded" />
        </div>
      );
    }

    if (type === "ticker") {
      return (
        <div key={i} className="bg-slate-900/30 border border-slate-800 p-4 rounded-xl animate-pulse">
          <div className="flex justify-between items-center">
            <div className="w-12 h-3 bg-slate-800 rounded" />
            <div className="w-16 h-8 bg-slate-800 rounded" />
          </div>
          <div className="mt-4 w-20 h-6 bg-slate-800 rounded" />
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`grid gap-4 ${type === 'ticker' ? 'grid-cols-1 md:grid-cols-4' : 'grid-cols-1'}`}>
      {loaders.map((_, i) => renderLoader(i))}
    </div>
  );
};

export default SkeletonLoader;
