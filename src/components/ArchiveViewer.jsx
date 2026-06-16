import { useState, useEffect } from 'react';

/**
 * Archive Viewer Component
 *
 * Displays historical intelligence briefs with easy navigation.
 * Supports both Cyber and AI intelligence archives.
 */
export default function ArchiveViewer({ category = 'cyber', onClose }) {
  const [archives, setArchives] = useState([]);
  const [selectedArchive, setSelectedArchive] = useState(null);
  const [archiveData, setArchiveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Determine paths based on category
  const base = import.meta.env.BASE_URL;
  const archiveBasePath = category === 'cyber'
    ? `${base}archives/cyber-intel`
    : `${base}archives/ai-news`;

  const categoryLabel = category === 'cyber'
    ? 'Cyber Intelligence'
    : 'AI News';

  // Load archive index on mount
  useEffect(() => {
    setLoading(true);
    fetch(`${archiveBasePath}/index.json`)
      .then(res => {
        if (!res.ok) throw new Error('No archives available');
        return res.json();
      })
      .then(data => {
        setArchives(data.archives || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading archive index:', err);
        setError('No archived items available yet');
        setLoading(false);
      });
  }, [archiveBasePath]);

  // Load specific archive data
  const loadArchive = (archiveInfo) => {
    setSelectedArchive(archiveInfo);
    setLoading(true);

    fetch(`${archiveBasePath}/${archiveInfo.filename}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load archive');
        return res.json();
      })
      .then(data => {
        setArchiveData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading archive:', err);
        setError('Failed to load archive data');
        setLoading(false);
      });
  };

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleClose = () => {
    setSelectedArchive(null);
    setArchiveData(null);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="border-b border-slate-800 p-4 flex justify-between items-center bg-slate-950">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            {categoryLabel} Archive
          </h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">

          {/* Archive List Sidebar */}
          <div className="w-64 border-r border-slate-800 overflow-y-auto bg-slate-950/50">
            <div className="p-3 border-b border-slate-800">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Available Archives
              </h3>
            </div>

            {loading && !selectedArchive && (
              <div className="p-4 text-center text-slate-400 text-sm">
                Loading archives...
              </div>
            )}

            {error && !archives.length && (
              <div className="p-4 text-center text-slate-400 text-sm">
                {error}
              </div>
            )}

            <div className="p-2 space-y-1">
              {archives.map((archive, idx) => (
                <button
                  key={idx}
                  onClick={() => loadArchive(archive)}
                  className={`w-full text-left p-3 rounded-lg transition ${
                    selectedArchive?.filename === archive.filename
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-sm font-semibold">
                    {formatDate(archive.date)}
                  </div>
                  <div className="text-xs opacity-75 mt-1">
                    {archive.item_count} items
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Archive Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {!selectedArchive && !loading && (
              <div className="flex items-center justify-center h-full text-slate-400">
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm">Select an archive to view</p>
                </div>
              </div>
            )}

            {loading && selectedArchive && (
              <div className="flex items-center justify-center h-full">
                <div className="text-slate-400">Loading archive...</div>
              </div>
            )}

            {archiveData && !loading && (
              <div>
                {/* Archive Header */}
                <div className="mb-6 pb-4 border-b border-slate-800">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {formatDate(archiveData.date)}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {archiveData.items?.length || 0} intelligence items archived
                  </p>
                </div>

                {/* Archive Items */}
                <div className="space-y-6">
                  {archiveData.items?.map((item, idx) => (
                    <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
                      <h4 className="font-bold text-white text-sm leading-snug mb-3">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed mb-3">
                        {item.content}
                      </p>
                      {item.url && item.url !== '#' && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
                        >
                          {item.linkText || 'View Source →'}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
