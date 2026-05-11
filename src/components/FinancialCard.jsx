
import { BarChart3, Globe, Zap, TrendingUp, ChevronRight } from 'lucide-react';
import SentimentIcon from './SentimentIcon';

const FinancialCard = ({ data }) => {
  if (!data) return null;
  return (
    <section className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 mb-12 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 opacity-10">
        <BarChart3 size={80} />
      </div>
      
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-indigo-500/10 rounded-lg">
          <Globe size={20} className="text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Market Intelligence</h2>
        <div className="ml-auto">
          <SentimentIcon sentiment={data.market_sentiment} size={24} />
        </div>
      </div>

      <p className="text-slate-300 leading-relaxed mb-8 text-lg font-medium">
        {data.executive_summary}
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Zap size={14} /> Key Drivers
          </h3>
          <ul className="space-y-3">
            {data.key_drivers.map((driver, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                <ChevronRight size={14} className="mt-1 text-indigo-500 shrink-0" />
                {driver}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <TrendingUp size={14} /> Market Insights
          </h3>
          <ul className="space-y-3">
            {data.insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                {insight}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default FinancialCard;
