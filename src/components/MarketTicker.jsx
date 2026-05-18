import { useState, useEffect } from 'react';
import liveFinanceService from '../api/liveFinanceService';
import { TrendingUp, TrendingDown, Shield, Zap, CircleDot } from 'lucide-react';

const MarketTicker = () => {
  const [tickerData, setTickerData] = useState([]);
  const [headlineData, setHeadlineData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial base values from latest.json
  useEffect(() => {
    const initData = async () => {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}digests/latest.json`);
        if (!res.ok) throw new Error('Failed to load latest digest');
        const data = await res.json();
        
        // Setup initial prices from the daily digest JSON
        const initialTickers = data.sentiment_pulse.tickers.map(t => ({
          symbol: t.symbol,
          price: t.price || (t.symbol === 'BTC' ? 93425.50 : t.symbol === 'SPY' ? 512.30 : 128.45),
          change_pct: t.change_pct || 0.0,
          sentiment: t.sentiment
        }));
        
        setTickerData(initialTickers);

        // Compile some key headlines for the marquee
        const headlines = [];
        if (data.sections.cybersecurity?.policy) {
          headlines.push({ type: 'policy', text: `CISA DIRECTIVE: ${data.sections.cybersecurity.policy}` });
        }
        data.sections.cybersecurity?.vulnerabilities?.forEach(v => {
          headlines.push({ type: 'vuln', text: `VULNERABILITY DETECTED: ${v.name} (${v.impact} CVSS)` });
        });
        data.sections.ai?.items?.forEach(item => {
          headlines.push({ type: 'ai', text: `AI BREAKTHROUGH: ${item.headline} (${item.source})` });
        });
        
        setHeadlineData(headlines);
        setLoading(false);

        // Fetch live prices immediately to override baseline
        updatePrices(initialTickers);
      } catch (err) {
        console.error('[MarketTicker] Failed to initialize ticker data:', err);
        setLoading(false);
      }
    };

    initData();
  }, []);

  const updatePrices = async (currentTickers) => {
    const updated = await Promise.all(
      currentTickers.map(async (t) => {
        const live = await liveFinanceService.getTickerPrice(t.symbol, t.price, t.change_pct);
        return {
          ...t,
          price: live.price,
          change_pct: live.change_pct
        };
      })
    );
    setTickerData(updated);
  };

  // Real-time market ticks simulation (micro-fluctuations)
  useEffect(() => {
    if (loading || tickerData.length === 0) return;

    const interval = setInterval(async () => {
      setTickerData(prev => 
        prev.map(t => {
          // Micro fluctuations around the live baseline price
          const tickChange = (Math.random() - 0.5) * (t.symbol === 'BTC' ? 8.0 : 0.05);
          const newPrice = Math.max(0.01, t.price + tickChange);
          const prevPrice = t.price;
          
          let updatedChange = t.change_pct;
          if (t.price !== 0) {
            updatedChange += (tickChange / t.price) * 100;
          }

          return {
            ...t,
            price: parseFloat(newPrice.toFixed(2)),
            change_pct: parseFloat(updatedChange.toFixed(2)),
            direction: tickChange > 0 ? 'up' : 'down'
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [loading, tickerData]);

  if (loading) {
    return (
      <div className="h-9 bg-slate-950 border-b border-slate-800 flex items-center justify-center text-[10px] text-slate-500 font-mono tracking-widest uppercase">
        Establishing Financial Uplink...
      </div>
    );
  }

  // Create a continuous sequence of items for the marquee
  const tickerItems = (
    <div className="flex items-center gap-12 shrink-0 animate-marquee pr-12 font-mono text-xs font-semibold">
      {tickerData.map((t, idx) => {
        const isUp = t.change_pct >= 0;
        return (
          <div key={`t1-${idx}`} className="flex items-center gap-2 text-white">
            <span className="text-slate-500 uppercase font-black">{t.symbol}</span>
            <span className="font-bold">${t.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            <span className={`flex items-center text-[10px] font-black ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isUp ? <TrendingUp size={10} className="mr-0.5" /> : <TrendingDown size={10} className="mr-0.5" />}
              {isUp ? '+' : ''}{t.change_pct.toFixed(2)}%
            </span>
          </div>
        );
      })}
      
      {headlineData.map((h, idx) => (
        <div key={`h1-${idx}`} className="flex items-center gap-3 text-slate-300">
          {h.type === 'policy' || h.type === 'vuln' ? (
            <Shield size={12} className="text-rose-500 shrink-0" />
          ) : (
            <Zap size={12} className="text-indigo-400 shrink-0" />
          )}
          <span className="uppercase text-[10px] tracking-tight">{h.text}</span>
          <CircleDot size={6} className="text-slate-700 mx-2" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full h-9 bg-slate-950 border-b border-indigo-500/20 flex items-center overflow-hidden relative z-40 select-none">
      {/* Bloomberg Label */}
      <div className="absolute left-0 top-0 bottom-0 px-4 bg-indigo-600/90 text-white font-black text-[9px] tracking-widest uppercase flex items-center shadow-lg shadow-indigo-500/10 z-50 font-sans border-r border-indigo-500/30">
        LIVE SIGNAL
      </div>
      
      {/* Dual marquee streams to ensure perfect loop seamlessness */}
      <div className="flex w-max pl-28">
        {tickerItems}
        {tickerItems}
        {tickerItems}
      </div>
    </div>
  );
};

export default MarketTicker;
