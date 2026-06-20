import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for fetching and managing macro-economic data
 * Fetches from static JSON file updated daily by GitHub Actions
 */
export function useMacroData(refreshInterval = 3600000) { // Default: 1 hour
  const [macroData, setMacroData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchMacroData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch from static JSON file (updated daily by pipeline)
      const base = import.meta.env.BASE_URL;
      const response = await fetch(`${base}macro-data.json`);

      if (!response.ok) {
        throw new Error(`Failed to fetch macro data: ${response.status}`);
      }

      const data = await response.json();

      if (data) {
        setMacroData(data);
        // Use the last_updated timestamp from the data
        setLastUpdated(data.last_updated ? new Date(data.last_updated) : new Date());
      } else {
        throw new Error('No macro data available');
      }
    } catch (err) {
      console.error('Error fetching macro data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchMacroData();
  }, [fetchMacroData]);

  // Periodic refresh
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(fetchMacroData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, fetchMacroData]);

  return {
    macroData,
    loading,
    error,
    lastUpdated,
    refresh: fetchMacroData
  };
}

export default useMacroData;
