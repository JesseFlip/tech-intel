

const FearGreedGauge = ({ value = 50, label = "Neutral" }) => {
  // SVG Gauge calculations
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const halfCircumference = circumference / 2;
  const offset = halfCircumference - (value / 100) * halfCircumference;

  return (
    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm relative group transition-all duration-500 hover:border-slate-700">
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-20 mb-4 overflow-hidden">
          {/* Gauge Background (Semi-circle) */}
          <svg viewBox="0 0 100 60" className="w-full h-full transform -rotate-0">
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="#1e293b"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Gauge Value (Gradient Path) */}
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="url(#gauge-gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={halfCircumference}
              strokeDashoffset={offset + halfCircumference} // Adjusted for path length
              className="transition-all duration-1000 ease-out"
              style={{ strokeDasharray: "125.6", strokeDashoffset: `${125.6 - (value / 100) * 125.6}` }}
            />
            <defs>
              <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e" /> {/* Red */}
                <stop offset="50%" stopColor="#f59e0b" /> {/* Orange */}
                <stop offset="100%" stopColor="#10b981" /> {/* Green */}
              </linearGradient>
            </defs>
          </svg>
          
          {/* Needle */}
          <div 
            className="absolute bottom-0 left-1/2 w-0.5 h-10 bg-white origin-bottom transition-transform duration-1000 ease-out"
            style={{ transform: `translateX(-50%) rotate(${(value / 100) * 180 - 90}deg)` }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]" />
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-black text-white tracking-tighter mb-1">{value}</div>
          <div className={`text-[10px] font-bold uppercase tracking-widest ${
            value > 70 ? 'text-emerald-400' : value < 30 ? 'text-rose-400' : 'text-amber-400'
          }`}>
            {label}
          </div>
        </div>
      </div>
      
      <div className="absolute top-3 right-4 text-[8px] text-slate-500 font-bold uppercase tracking-tighter">
        Fear & Greed Index
      </div>
    </div>
  );
};

export default FearGreedGauge;
