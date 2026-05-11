

const Pulse = ({ children, active }) => (
  <div className={`relative ${active ? 'animate-pulse ring-2 ring-indigo-500 rounded-2xl' : ''}`}>
    {children}
    {active && (
      <span className="absolute -top-2 -right-2 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
      </span>
    )}
  </div>
);

export default Pulse;
