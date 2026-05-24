import { memo } from 'react';

/**
 * Tooltip component for displaying contextual information on hover
 * Memoized for performance optimization
 */
const Tooltip = memo(({ enabled, title, content, children }) => {
  return (
    <div className="relative group inline-flex items-center cursor-help">
      {children}
      {enabled && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 p-3 bg-slate-800 text-slate-200 text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-slate-700">
          <strong className="text-indigo-400 block mb-1 uppercase tracking-wider">{title}</strong>
          {content}
        </div>
      )}
    </div>
  );
});

Tooltip.displayName = 'Tooltip';

export default Tooltip;
