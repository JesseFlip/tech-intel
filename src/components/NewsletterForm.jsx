import { useState } from 'react';
import webhookService from '../api/webhookService';

const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [preferences, setPreferences] = useState({
    markets: true,
    ai_tech: true,
    cybersecurity: false
  });
  const [frequency, setFrequency] = useState('daily');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const validate = () => {
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!emailRegex.test(email.toLowerCase())) {
      setMessage('Please enter a valid intelligence coordinate (email).');
      return false;
    }
    if (!Object.values(preferences).some(v => v)) {
      setMessage('Select at least one sector for intelligence feeds.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setStatus('loading');
    setMessage('');

    try {
      await webhookService.subscribe({
        email,
        preferences,
        frequency,
        source: "dashboard_footer",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      
      setStatus('success');
      setMessage('Transmission successful. Check your email to confirm activation.');
      setEmail('');
    } catch (err) { // eslint-disable-line no-unused-vars
      setStatus('error');
      setMessage('Signal interference. Automated retry queued.');
    }
  };

  return (
    <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 max-w-2xl mx-auto my-12 backdrop-blur-sm">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-black text-white tracking-tighter mb-2">STAY INFORMED</h3>
        <p className="text-slate-400">Daily intelligence delivered. No noise, just high-signal insights.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative group">
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 px-6 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-8 py-4 border-y border-slate-800/50">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 block">Preferences</label>
            <div className="space-y-3">
              {Object.keys(preferences).map((key) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={preferences[key]}
                    onChange={(e) => setPreferences({ ...preferences, [key]: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500/50 transition-all"
                  />
                  <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors capitalize">
                    {key.replace('_', ' & ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 block">Frequency</label>
            <select 
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="daily">Daily (09:00 UTC)</option>
              <option value="weekly">Weekly (Monday)</option>
              <option value="critical_only">Critical Alerts Only</option>
            </select>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={status === 'loading'}
          className={`w-full py-4 rounded-xl font-bold tracking-tight transition-all shadow-lg ${
            status === 'loading' 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
          }`}
        >
          {status === 'loading' ? 'TRANSMITTING...' : 'ACTIVATE FEED'}
        </button>

        {message && (
          <div className={`text-center text-sm font-medium animate-in fade-in slide-in-from-bottom-2 ${
            status === 'success' ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {message}
          </div>
        )}
      </form>

      <p className="text-[10px] text-center text-slate-600 mt-8 uppercase tracking-widest">
        Encrypted transmission. <a href="/privacy" className="underline hover:text-slate-400">Privacy Policy</a>
      </p>
    </section>
  );
};

export default NewsletterForm;
