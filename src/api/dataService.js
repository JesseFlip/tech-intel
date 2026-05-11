/**
 * Tech Intel - Core API Orchestration
 * Handles Market Data, AI/Tech News, and Cybersecurity feeds.
 */

class DataService {
  constructor() {
    this.cache = new Map();
    this.subscribers = [];
  }

  // Generic fetch with exponential backoff
  async fetchWithRetry(url, options = {}, retries = 3, backoff = 1000) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      if (retries > 0) {
        await new Promise(res => setTimeout(res, backoff));
        return this.fetchWithRetry(url, options, retries - 1, backoff * 2);
      }
      throw error;
    }
  }

  // Subscribe to data updates (Event Emitter style)
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== callback);
    };
  }

  broadcast(event, data) {
    this.subscribers.forEach(s => s(event, data));
  }
}

export const marketService = {
  async getTickerData(ticker) {
    // Mock implementation for Finnhub/Alpha Vantage
    return {
      symbol: ticker,
      price: 150.25 + Math.random(),
      change_pct: (Math.random() - 0.5) * 2,
      timestamp: new Date().toISOString()
    };
  }
};

export const aiService = {
  async getLatestNews() {
    // Implementation for NewsAPI/HuggingFace
    return [];
  }
};

export const cybersecurityService = {
  async getCVEs() {
    // Implementation for NVD API
    return [];
  }
};

export default new DataService();
