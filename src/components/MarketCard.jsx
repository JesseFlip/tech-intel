import { useState, useEffect } from 'react';
import Sparkline from './Sparkline';
import SentimentIcon from './SentimentIcon';
import { motion } from 'framer-motion';

const MarketCard = ({ ticker }) => {
  const [price, setPrice] = useState(ticker?.price || 150.00);
  const [direction, setDirection] = useState('neutral'); // up, down, neutral
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!ticker) return;
    
    // Simulate live updates
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 0.5;
      const newPrice = price + change;
      setDirection(change > 0 ? 'up' : 'down');
      setPrice(newPrice);
      setFlash(true);
      setTimeout(() => setFlash(false), 300);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, [price, ticker]);

  if (!ticker) return null;
  
  return (
    <motion.div 
      whileHover={{ scale: 1.02, translateY: -2 }}
      className={`bg-slate-900/50 border border-slate-800 p-4 rounded-xl backdrop-blur-sm relative overflow-hidden group transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-slate-700 ${
        flash ? (direction === 'up' ? 'ring-1 ring-emerald-500/50' : 'ring-1 ring-rose-500/50') : ''
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{ticker.symbol}</span>
        <Sparkline 
          data={ticker.sentiment === 'BULLISH' ? [30, 35, 32, 40, 45, 42, 50] : [70, 65, 68, 60, 55, 58, 50]} 
          color={ticker.sentiment === 'BULLISH' ? '#10b981' : ticker.sentiment === 'BEARISH' ? '#f43f5e' : '#64748b'} 
        />
      </div>
      
      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <motion.div 
            animate={flash ? { scale: [1, 1.05, 1] } : {}}
            className={`text-lg font-black tracking-tighter transition-colors duration-300 ${
              direction === 'up' ? 'text-emerald-400' : direction === 'down' ? 'text-rose-400' : 'text-white'
            }`}
          >
            ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </motion.div>
          <div className="text-[10px] text-slate-500 font-medium">
            {ticker.price_context}
          </div>
        </div>
        <SentimentIcon sentiment={ticker.sentiment} />
      </div>

      <motion.div 
        animate={{ width: direction === 'neutral' ? '0%' : '100%' }}
        className={`absolute bottom-0 left-0 h-0.5 transition-all duration-500 ${
          direction === 'up' ? 'bg-emerald-500/50' : 
          direction === 'down' ? 'bg-rose-500/50' : 'bg-slate-500/30'
        }`} 
      />
    </motion.div>
  );
};

export default MarketCard;
