import { Link } from 'react-router-dom';
import { Zap, Sun, Moon, ExternalLink } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import MarketTicker from './MarketTicker';

const Layout = ({ children }) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary selection:bg-indigo-500/30 transition-colors duration-300">
      <MarketTicker />
      <header className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-border-accent/50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
          <div className="flex items-center gap-8 shrink-0">
            <Link to="/" className="group flex items-center gap-3" aria-label="Macro Intel Home">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                <Zap size={24} className="text-white fill-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-text-primary hidden sm:block">MACRO INTEL</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="p-2.5 bg-bg-secondary hover:bg-bg-secondary rounded-xl text-text-secondary hover:text-text-primary transition-all border border-transparent hover:border-border-accent shadow-sm"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <main className="w-full min-w-0" role="main">
          {children}
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

