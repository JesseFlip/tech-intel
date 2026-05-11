import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const ArchiveView = () => {
  const [index, setIndex] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIndex = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}digests/index.json`);
        if (!response.ok) throw new Error('Could not load archive index.');
        const data = await response.json();
        setIndex(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchIndex();
  }, []);

  if (loading) return (
    <div className="py-24 text-center">
      <div className="inline-block w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
      <div className="text-slate-500 font-medium">Opening vaults...</div>
    </div>
  );

  if (error) return <div className="py-24 text-center text-rose-500 font-bold">{error}</div>;

  return (
    <div className="animate-in fade-in duration-700">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Intelligence Archive</h1>
        <p className="text-slate-500 font-medium">Retrospective look at past technical signals.</p>
      </header>
      <div className="grid gap-6">
        {index.map((item) => (
          <Link 
            key={item.date} 
            to={`/digest/${item.date}`} 
            className="group block p-6 bg-slate-900/30 border border-slate-800 rounded-2xl hover:border-indigo-500/50 hover:bg-slate-900/50 transition-all shadow-sm"
          >
            <div className="flex justify-between items-center">
              <div>
                <time className="text-[10px] text-slate-500 uppercase tracking-widest font-black block mb-1 group-hover:text-indigo-400 transition-colors">
                  {item.date}
                </time>
                <h2 className="text-xl font-bold text-slate-200 group-hover:text-white transition-colors">
                  {item.headline}
                </h2>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <ArrowRight size={20} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ArchiveView;
