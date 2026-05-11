import { useState, useEffect, useMemo } from 'react';
import { BarChart3, Globe, Zap, ShieldAlert } from 'lucide-react';

const SidebarTOC = () => {
  const [activeSection, setActiveSection] = useState('markets');
  const sections = useMemo(() => [
    { id: 'markets', label: 'Markets', icon: BarChart3 },
    { id: 'financial', label: 'Financial', icon: Globe },
    { id: 'ai', label: 'AI & Tech', icon: Zap },
    { id: 'cyber', label: 'Cybersecurity', icon: ShieldAlert },
  ], []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5, rootMargin: '-80px 0px -50% 0px' }
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav className="hidden lg:flex flex-col gap-4 sticky top-32 h-fit w-48 shrink-0">
      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-2 px-4">Navigation</div>
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeSection === s.id 
              ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5' 
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
          }`}
        >
          <s.icon size={16} />
          {s.label}
        </a>
      ))}
    </nav>
  );
};

export default SidebarTOC;
