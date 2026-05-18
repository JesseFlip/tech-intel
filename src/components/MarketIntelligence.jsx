import { useState, useEffect } from 'react';
import MarketCard from './MarketCard';
import FearGreedGauge from './FearGreedGauge';
import liveFinanceService from '../api/liveFinanceService';

const MarketIntelligence = ({ pulse, onSelectItem }) => {
  const [fearGreed, setFearGreed] = useState({ value: 78, label: pulse?.fear_greed || '78 (Extreme Greed)' });
  const [tickers, setTickers] = useState([]);
  const [newSymbol, setNewSymbol] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  // Synchronize initial baseline tickers from daily compiler
  useEffect(() => {
    if (pulse?.tickers) {
      setTickers(pulse.tickers);
    }
  }, [pulse]);

  useEffect(() => {
    if (!pulse) return;

    const fetchFG = async () => {
      try {
        const data = await liveFinanceService.getFearGreed(pulse.fear_greed);
        setFearGreed(data);
      } catch (err) {
        console.error('[MarketIntelligence] Fear & Greed fetch error:', err);
      }
    };

    fetchFG();
  }, [pulse]);

  const handleAddTicker = async (e) => {
    e.preventDefault();
    if (!newSymbol.trim()) return;
    const symbol = newSymbol.trim().toUpperCase();

    if (tickers.some(t => t.symbol === symbol)) {
      setAddError(`${symbol} is already active.`);
      return;
    }

    setAdding(true);
    setAddError('');

    try {
      // Determine baseline falls back dynamically
      const isCrypto = ['BTC', 'ETH', 'SOL', 'ADA', 'XRP', 'DOGE', 'LTC', 'LINK'].includes(symbol);
      const baselinePrice = isCrypto ? (symbol === 'BTC' ? 93425.50 : symbol === 'ETH' ? 3425.00 : 150.00) : 150.00;

      const live = await liveFinanceService.getTickerPrice(symbol, baselinePrice, 0.0);
      
      const newCard = {
        symbol,
        price: live.price,
        change_pct: live.change_pct,
        sentiment: live.change_pct >= 0 ? 'BULLISH' : 'BEARISH',
        price_context: `${symbol} Ingested Quote Telemetry`
      };

      setTickers(prev => [...prev, newCard]);
      setNewSymbol('');
    } catch (err) {
      console.error(`[MarketIntelligence] Ingest quote fail for ${symbol}:`, err);
      setAddError(`Incompatible stream coordinate: ${symbol}`);
    } finally {
      setAdding(false);
    }
  };

  if (!pulse) return null;

  return (
    <section className="mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <FearGreedGauge value={fearGreed.value} label={fearGreed.label} />
        </div>
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          {tickers.map((ticker) => (
            <MarketCard key={ticker.symbol} ticker={ticker} onSelectItem={onSelectItem} />
          ))}

          {/* Dynamic Asset Ingestion Terminal Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col justify-between min-h-[140px] hover:border-slate-700 transition-all backdrop-blur-sm relative overflow-hidden">
            <div>
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold font-mono">U.S. / Global Telemetry</span>
              <h4 className="text-[11px] font-black text-white uppercase tracking-wider mt-0.5 mb-2 font-mono">Ingest Asset Stream</h4>
              
              <form onSubmit={handleAddTicker} className="flex gap-1.5">
                <input 
                  type="text" 
                  placeholder="AAPL, ETH, SOL..." 
                  value={newSymbol}
                  onChange={(e) => {
                    setNewSymbol(e.target.value);
                    if (addError) setAddError('');
                  }}
                  className="bg-slate-950 border border-slate-800/80 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 w-full placeholder:text-slate-700 font-mono"
                />
                <button 
                  type="submit" 
                  disabled={adding}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-850 text-white text-xs font-bold rounded cursor-pointer transition-all"
                >
                  {adding ? '...' : '+'}
                </button>
              </form>
              {addError && (
                <span className="text-[8px] text-rose-500 mt-1 block font-mono tracking-tight leading-none">{addError}</span>
              )}
            </div>
            
            <div className="text-[8px] text-slate-500 font-mono tracking-tighter leading-none mt-2">
              Resolves dynamic ticker valuations via Finnhub & Coinbase CORS gateways.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketIntelligence;
