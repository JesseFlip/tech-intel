import { useState, useEffect } from 'react';
import liveFinanceService from '../api/liveFinanceService';
import { TrendingUp, TrendingDown, CircleDot } from 'lucide-react';

const MarketTicker = () => {
  const [tickerData, setTickerData] = useState([
    { symbol: 'US10Y', name: 'The Risk-Free Rate', price: 4.42, change_pct: 0.0 },
    { symbol: 'VIX', name: 'The Fear Index', price: 13.50, change_pct: 0.0 },
    { symbol: 'ES=F', name: 'S&P Futures', price: 5120.00, change_pct: 0.0 }
  ]);
  const [loading, setLoading] = useState(true);

  // Fetch initial base values
  useEffect(() => {
    const initData = async () => {
      try {
        const updated = await Promise.all(
          tickerData.map(async (t) => {
            const live = await liveFinanceService.getTickerPrice(t.symbol, t.price, 0.0);
            return {
              ...t,
              price: live.price,
              change_pct: live.change_pct
            };
          })
        );
        setTickerData(updated);
        setLoading(false);
      } catch (err) {
        console.error('[MarketTicker] Failed to initialize ticker data:', err);
        setLoading(false);
      }
    };

    initData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Real-time market ticks simulation (micro-fluctuations)
  useEffect(() => {
    if (loading) return;

    const interval = setInterval(() => {
      setTickerData(prev => 
        prev.map(t => {
          const tickChange = t.symbol === 'US10Y' 
            ? (Math.random() - 0.5) * 0.01 
            : t.symbol === 'VIX' 
              ? (Math.random() - 0.5) * 0.05 
              : (Math.random() - 0.5) * 1.5;

          const newPrice = Math.max(0.01, t.price + tickChange);
          let updatedChange = t.change_pct;
          if (t.price !== 0) {
            updatedChange += (tickChange / t.price) * 100;
          }

          return {
            ...t,
            price: parseFloat(newPrice.toFixed(t.symbol === 'US10Y' ? 3 : 2)),
            change_pct: parseFloat(updatedChange.toFixed(2))
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [loading]);

  if (loading) {
    return (
      <div className="h-9 bg-slate-950 border-b border-slate-800 flex items-center justify-center text-[10px] text-slate-500 font-mono tracking-widest uppercase">
        Establishing Macro Uplink...
      </div>
    );
  }

  // Create a continuous sequence of items for the marquee
  const tickerItems = (
    <div className="flex items-center gap-12 shrink-0 animate-marquee pr-12 font-mono text-xs font-semibold">
      {tickerData.map((t, idx) => {
        const isUp = t.change_pct >= 0;
        const formattedPrice = t.symbol === 'US10Y' 
          ? `${t.price.toFixed(2)}%` 
          : t.price.toLocaleString(undefined, { minimumFractionDigits: 2 });
          
        return (
          <div key={`t1-${idx}`} className="flex items-center gap-2 text-white">
            <span className="text-slate-500 uppercase font-black">{t.symbol}</span>
            <span className="text-slate-400 font-medium text-[10px] hidden md:inline">({t.name})</span>
            <span className="font-bold">{formattedPrice}</span>
            <span className={`flex items-center text-[10px] font-black ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isUp ? <TrendingUp size={10} className="mr-0.5" /> : <TrendingDown size={10} className="mr-0.5" />}
              {isUp ? '+' : ''}{t.change_pct.toFixed(2)}%
            </span>
            <CircleDot size={4} className="text-slate-700 mx-2" />
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="w-full h-9 bg-slate-950 border-b border-indigo-500/20 flex items-center overflow-hidden relative z-40 select-none">
      {/* Live Signal Label */}
      <div className="absolute left-0 top-0 bottom-0 px-4 bg-indigo-600/90 text-white font-black text-[9px] tracking-widest uppercase flex items-center shadow-lg shadow-indigo-500/10 z-50 font-sans border-r border-indigo-500/30">
        LIVE SIGNAL
      </div>
      
      {/* Dual marquee streams to ensure perfect loop seamlessness */}
      <div className="flex w-max pl-28">
        {tickerItems}
        {tickerItems}
        {tickerItems}
        {tickerItems}
        {tickerItems}
      </div>
    </div>
  );
};

export default MarketTicker;

