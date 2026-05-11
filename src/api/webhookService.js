/**
 * Newsletter & Integration Webhook Service
 * Handles communication with Activecampaign and other external services.
 */

class WebhookService {
  constructor() {
    this.endpoints = {
      subscribe: '/webhook/newsletter/subscribe',
      unsubscribe: '/webhook/newsletter/unsubscribe',
      preferences: '/webhook/newsletter/preference-update'
    };
  }

  async post(endpoint, data) {
    // In production, this would be a real URL from env
    const url = import.meta.env.VITE_WEBHOOK_URL || this.endpoints[endpoint];
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content || ''
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Webhook transmission failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`[WebhookService] Error during ${endpoint}:`, error);
      throw error;
    }
  }

  async subscribe(userData) {
    const payload = {
      event: 'newsletter_subscription',
      timestamp: new Date().toISOString(),
      user: userData,
      action: 'subscribe'
    };
    return this.post('subscribe', payload);
  }

  async updatePreferences(email, preferences) {
    const payload = {
      event: 'preference_update',
      timestamp: new Date().toISOString(),
      user: { email, preferences },
      action: 'update'
    };
    return this.post('preferences', payload);
  }
}

export default new WebhookService();
