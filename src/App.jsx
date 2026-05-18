import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DigestView from './components/DigestView';
import ArchiveView from './components/ArchiveView';
import NotFound from './components/NotFound';
import Pulse from './components/Pulse';
import { ThemeContext } from './hooks/useTheme';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [realtimeAlert, setRealtimeAlert] = useState(false);
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

  // WebSocket Scaffold (Simulated)
  useEffect(() => {
    const simulateRealtime = setInterval(() => {
      if (Math.random() > 0.95) {
        console.log("Real-time intelligence received...");
        setRealtimeAlert(true);
        setTimeout(() => setRealtimeAlert(false), 5000);
        
        const hasNotifications = typeof window !== 'undefined' && 'Notification' in window;
        if (notificationsEnabled && hasNotifications && window.Notification.permission === "granted") {
          try {
            new window.Notification("CRITICAL INTEL: New Vulnerability Detected", {
              body: "A high-impact CVE has just been published. View details in the dashboard.",
              icon: "/favicon.ico"
            });
          } catch (err) {
            console.warn('[App] Failed triggering native push notification:', err);
          }
        }
      }
    }, 15000);

    return () => clearInterval(simulateRealtime);
  }, [notificationsEnabled]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const toggleNotifications = async () => {
    const hasNotifications = typeof window !== 'undefined' && 'Notification' in window;
    if (!hasNotifications) {
      alert("Push notifications are not supported or blocked by your current browser profile.");
      return;
    }

    if (!notificationsEnabled) {
      try {
        const permission = await window.Notification.requestPermission();
        if (permission === "granted") {
          setNotificationsEnabled(true);
        }
      } catch (err) {
        console.warn('[App] Error requesting notification permissions:', err);
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Layout 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        selectedTag={selectedTag} 
        setSelectedTag={setSelectedTag}
        notificationsEnabled={notificationsEnabled}
        toggleNotifications={toggleNotifications}
      >
        <Pulse active={realtimeAlert}>
          <Routes>
            <Route path="/" element={<DigestView isLatest searchQuery={searchQuery} selectedTag={selectedTag} setSelectedTag={setSelectedTag} />} />
            <Route path="/digest/:date" element={<DigestView searchQuery={searchQuery} selectedTag={selectedTag} setSelectedTag={setSelectedTag} />} />
            <Route path="/archive" element={<ArchiveView />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Pulse>
      </Layout>
    </ThemeContext.Provider>
  );
}

export default App;
