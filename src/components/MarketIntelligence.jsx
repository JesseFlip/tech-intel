
import MarketCard from './MarketCard';
import FearGreedGauge from './FearGreedGauge';

const MarketIntelligence = ({ pulse }) => {
  if (!pulse) return null;
  return (
    <section className="mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <FearGreedGauge value={78} label={pulse.fear_greed} />
        </div>
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          {pulse.tickers.map((ticker) => (
            <MarketCard key={ticker.symbol} ticker={ticker} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MarketIntelligence;
