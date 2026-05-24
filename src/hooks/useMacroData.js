import { useState, useEffect, useCallback } from 'react';
import fredService from '../api/fredService';

/**
 * Custom hook for fetching and managing macro-economic data
 * Implements caching and refresh logic to minimize API calls
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

      const data = await fredService.getMacroDashboard();

      if (data) {
        setMacroData(data);
        setLastUpdated(new Date());
      } else {
        throw new Error('Failed to fetch macro data');
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
