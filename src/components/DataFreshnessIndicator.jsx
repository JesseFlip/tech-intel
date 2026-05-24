import { memo, useState, useEffect } from 'react';

/**
 * Component to display data freshness with visual indicator
 * Shows how long ago the data was updated
 */
const DataFreshnessIndicator = memo(({ lastUpdated, label = "Updated" }) => {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    if (!lastUpdated) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const updated = new Date(lastUpdated);
      const diffMs = now - updated;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) {
        setTimeAgo('just now');
      } else if (diffMins < 60) {
        setTimeAgo(`${diffMins}m ago`);
      } else if (diffHours < 24) {
        setTimeAgo(`${diffHours}h ago`);
      } else {
        setTimeAgo(`${diffDays}d ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [lastUpdated]);

  if (!lastUpdated) {
    return null;
  }

  // Determine freshness status
  const now = new Date();
  const updated = new Date(lastUpdated);
  const diffHours = (now - updated) / 3600000;

  let statusColor = 'bg-emerald-500'; // Fresh (< 1 hour)
  let statusText = 'text-emerald-400';

  if (diffHours > 24) {
    statusColor = 'bg-red-500'; // Stale (> 24 hours)
    statusText = 'text-red-400';
  } else if (diffHours > 6) {
    statusColor = 'bg-yellow-500'; // Warning (> 6 hours)
    statusText = 'text-yellow-400';
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${statusColor} animate-pulse`} />
      <span className={`text-[10px] font-mono ${statusText}`}>
        {label}: {timeAgo}
      </span>
    </div>
  );
});

DataFreshnessIndicator.displayName = 'DataFreshnessIndicator';

export default DataFreshnessIndicator;
