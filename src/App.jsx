import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DigestView from './components/DigestView';
import ArchiveView from './components/ArchiveView';
import NotFound from './components/NotFound';
import { ThemeContext } from './hooks/useTheme';

function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Layout>
        <Routes>
          <Route path="/" element={<DigestView isLatest />} />
          <Route path="/digest/:date" element={<DigestView />} />
          <Route path="/archive" element={<ArchiveView />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </ThemeContext.Provider>
  );
}

export default App;

