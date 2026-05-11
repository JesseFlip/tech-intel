

const Sparkline = ({ data = [], color = '#6366f1' }) => {
  const min = Math.min(...data, 0);
  const max = Math.max(...data, 10);
  const range = max - min;
  const width = 100;
  const height = 30;

  const points = data.map((val, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((val - min) / range) * height
  }));

  const pathData = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]"
      />
    </svg>
  );
};

export default Sparkline;
