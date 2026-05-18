import { useState, useEffect } from 'react';
import Sparkline from './Sparkline';
import SentimentIcon from './SentimentIcon';
import { motion } from 'framer-motion';
import liveFinanceService from '../api/liveFinanceService';

const MarketCard = ({ ticker, onSelectItem }) => {
  const [price, setPrice] = useState(ticker?.price || 150.00);
  const [changePct, setChangePct] = useState(ticker?.change_pct || 0.0);
  const [direction, setDirection] = useState('neutral'); // up, down, neutral
  const [flash, setFlash] = useState(false);

  // Fetch live price on mount and ticker changes
  useEffect(() => {
    if (!ticker) return;

    const fetchLive = async () => {
      try {
        const live = await liveFinanceService.getTickerPrice(
          ticker.symbol,
          ticker.price || (ticker.symbol === 'BTC' ? 93425.50 : ticker.symbol === 'SPY' ? 512.30 : 128.45),
          ticker.change_pct || 0.0
        );
        setPrice(live.price);
        setChangePct(live.change_pct);
      } catch (err) {
        console.error(`[MarketCard] Live price load failed for ${ticker.symbol}:`, err);
      }
    };

    fetchLive();
  }, [ticker]);

  // Micro-fluctuations tick interval
  useEffect(() => {
    if (!ticker) return;

    const interval = setInterval(() => {
      const isBtc = ticker.symbol === 'BTC';
      const change = (Math.random() - 0.5) * (isBtc ? 12.00 : 0.06);
      const newPrice = Math.max(0.01, price + change);

      setDirection(change > 0 ? 'up' : 'down');
      setPrice(newPrice);

      if (price !== 0) {
        setChangePct(prev => parseFloat((prev + (change / price) * 100).toFixed(2)));
      }

      setFlash(true);
      setTimeout(() => setFlash(false), 400); // Sleek transition window
    }, 4500 + Math.random() * 2500);

    return () => clearInterval(interval);
  }, [price, ticker]);

  if (!ticker) return null;
  
  return (
    <motion.div 
      whileHover={{ scale: 1.02, translateY: -2 }}
      onClick={() => onSelectItem && onSelectItem({ headline: `${ticker.symbol} Market Signal Analysis`, summary: ticker.price_context, source: 'MARKET', impact: ticker.sentiment === 'BULLISH' ? 'HIGH' : 'MEDIUM' })}
      className={`bg-slate-900/50 border border-slate-800 p-4 rounded-xl backdrop-blur-sm relative overflow-hidden group transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-slate-700 cursor-pointer ${
        flash
          ? direction === 'up'
            ? 'ring-1 ring-emerald-500/50 bg-emerald-500/5'
            : 'ring-1 ring-rose-500/50 bg-rose-500/5'
          : ''
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
          <div className="flex items-baseline gap-2">
            <motion.div 
              animate={flash ? { scale: [1, 1.05, 1] } : {}}
              className={`text-lg font-black tracking-tighter transition-colors duration-300 ${
                direction === 'up' ? 'text-emerald-400' : direction === 'down' ? 'text-rose-400' : 'text-white'
              }`}
            >
              ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </motion.div>
            <span
              className={`text-[10px] font-bold ${
                changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {changePct >= 0 ? '▲' : '▼'} {changePct >= 0 ? '+' : ''}
              {changePct.toFixed(2)}%
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            {ticker.price_context}
            {onSelectItem && (
              <span className="text-[9px] font-bold text-indigo-400 mt-2 hover:underline group-hover:text-indigo-300 transition-colors flex items-center gap-0.5 cursor-pointer">
                Analyze Signal Vector →
              </span>
            )}
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
