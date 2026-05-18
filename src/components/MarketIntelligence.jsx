
import { useState, useEffect } from 'react';
import MarketCard from './MarketCard';
import FearGreedGauge from './FearGreedGauge';
import liveFinanceService from '../api/liveFinanceService';

const MarketIntelligence = ({ pulse, onSelectItem }) => {
  const [fearGreed, setFearGreed] = useState({ value: 78, label: pulse?.fear_greed || '78 (Extreme Greed)' });

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

  if (!pulse) return null;

  return (
    <section className="mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <FearGreedGauge value={fearGreed.value} label={fearGreed.label} />
        </div>
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          {pulse.tickers.map((ticker) => (
            <MarketCard key={ticker.symbol} ticker={ticker} onSelectItem={onSelectItem} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MarketIntelligence;
