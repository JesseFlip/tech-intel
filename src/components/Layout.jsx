
import { Link } from 'react-router-dom';
import { Zap, Search, X, Sun, Moon, Bell, BellOff, ExternalLink, Filter } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import SidebarTOC from './SidebarTOC';
import MarketTicker from './MarketTicker';

import NewsletterForm from './NewsletterForm';

const Layout = ({ children, searchQuery, setSearchQuery, selectedTag, setSelectedTag, notificationsEnabled, toggleNotifications }) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary selection:bg-indigo-500/30 transition-colors duration-300">
      <MarketTicker />
      <header className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-border-accent/50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
          <div className="flex items-center gap-8 shrink-0">
            <Link to="/" className="group flex items-center gap-3" aria-label="Tech Intel Home">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                <Zap size={24} className="text-white fill-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-text-primary hidden sm:block">TECH INTEL</span>
            </Link>
            {/* Navigation links removed */}
          </div>

          <div className="flex-1 max-w-xl relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search intelligence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search intelligence reports"
              className="w-full bg-bg-secondary/50 border border-border-accent rounded-xl py-2.5 pl-12 pr-4 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-bg-secondary transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleNotifications}
              aria-label={notificationsEnabled ? "Disable push notifications" : "Enable push notifications"}
              className={`p-2.5 rounded-xl transition-all border shadow-sm ${
                notificationsEnabled 
                  ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20' 
                  : 'bg-bg-secondary text-text-secondary hover:text-text-primary border-transparent hover:border-border-accent'
              }`}
            >
              {notificationsEnabled ? <Bell size={20} /> : <BellOff size={20} />}
            </button>

            <button 
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="p-2.5 bg-bg-secondary hover:bg-bg-secondary rounded-xl text-text-secondary hover:text-text-primary transition-all border border-transparent hover:border-border-accent shadow-sm"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {selectedTag && (
              <div className="hidden xl:flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg">
                <Filter size={12} className="text-indigo-400" />
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{selectedTag}</span>
                <button onClick={() => setSelectedTag(null)} aria-label="Remove filter" className="text-indigo-400 hover:text-white">
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <main className="w-full min-w-0" role="main">
          {children}
          <NewsletterForm />
        </main>
      </div>

      <footer className="max-w-6xl mx-auto px-6 mt-32 py-12 border-t border-border-accent flex flex-col md:flex-row justify-between items-center gap-6 text-text-secondary text-sm">
        <div className="flex items-center gap-6">
          <a href="https://github.com/JesseFlip/tech-intel" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors flex items-center gap-2">
            <ExternalLink size={14} /> Repository
          </a>
          <span>Updated Daily at 07:00 UTC</span>
        </div>
        <div className="text-[10px] uppercase tracking-widest font-bold">
          Powered by Gemini 2.5 Flash
        </div>
      </footer>
    </div>
  );
};

export default Layout;
