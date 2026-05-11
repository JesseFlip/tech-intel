
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const SentimentIcon = ({ sentiment, size = 16 }) => {
  if (sentiment === 'BULLISH') return <TrendingUp size={size} className="text-emerald-400" />;
  if (sentiment === 'BEARISH') return <TrendingDown size={size} className="text-rose-400" />;
  return <Minus size={size} className="text-slate-400" />;
};

export default SentimentIcon;
