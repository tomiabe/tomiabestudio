import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playClickSound } from './lib/audio';
import { ArrowUpRight, ArrowRight, Sun, Moon, Sunrise, Monitor, Copy, Check, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type ActiveSection = 'home' | 'work' | 'projects' | 'thoughts' | 'info' | 'contact';
type ThemeMode = 'morning' | 'noon' | 'evening' | 'system';

interface ProjectDetail { heading: string; text: string; image: string; }
interface Project { id: string; title: string; role?: string; description: string; categories: string[]; link?: string; useDrawer?: boolean; image: string; details?: ProjectDetail[]; order?: number; visible?: boolean; }
interface Update { id: string; date: string; title: string; description: string; image: string; link?: string; directLink?: boolean; content?: string; order?: number; visible?: boolean; }
interface SocialLink { name: string; url: string; }

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try { const item = window.localStorage.getItem(key); return item ? JSON.parse(item) : initialValue; } catch { return initialValue; }
  });
  const setValue = (value: T | ((val: T) => T)) => {
    try { const v = value instanceof Function ? value(storedValue) : value; setStoredValue(v); window.localStorage.setItem(key, JSON.stringify(v)); } catch {}
  };
  return [storedValue, setValue] as const;
}

const CLIENT_WORK_IDS = ['susinsight', 'wecollect', 'zeproc', 'translayte', 'fairbnb', 'eze'];

export default function App() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('home');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [theme, setTheme] = useLocalStorage<ThemeMode>('tomi_theme', 'system');
  const [activeTheme, setActiveTheme] = useState<'morning' | 'noon' | 'evening'>('noon');
  const [soundEnabled] = useLocalStorage<boolean>('tomi_soundEnabled', false);
  const [copied, setCopied] = useState(false);
  const [displayedTagline, setDisplayedTagline] = useState('Shaping Creative & Digital Systems');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [activeInfoSection, setActiveInfoSection] = useState<string>('About');

  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [siteData, setSiteData] = useState<any>({});

  // URL routing
  const parseUrl = () => {
    const path = window.location.pathname.slice(1); // remove leading /
    const parts = path.split('/').filter(Boolean);
    
    if (parts.length === 0 || parts[0] === '') {
      return { section: 'home' as ActiveSection, filter: 'All', itemId: null, infoSection: 'About' };
    }
    
    const section = parts[0] as ActiveSection;
    
    if (section === 'work' || section === 'projects') {
      if (parts.length === 1) return { section, filter: 'All', itemId: null, infoSection: 'About' };
      // Check if second part is a filter or an item ID
      const possibleFilters = ['All', ...allCategories];
      if (possibleFilters.includes(parts[1])) {
        return { section, filter: parts[1], itemId: null, infoSection: 'About' };
      }
      return { section, filter: 'All', itemId: parts[1], infoSection: 'About' };
    }
    
    if (section === 'thoughts' || section === 'updates') {
      if (parts.length === 1) return { section: 'thoughts', filter: 'All', itemId: null, infoSection: 'About' };
      return { section: 'thoughts', filter: 'All', itemId: parts[1], infoSection: 'About' };
    }
    
    if (section === 'info') {
      if (parts.length === 1) return { section, filter: 'All', itemId: null, infoSection: 'About' };
      const infoSectionMap: Record<string, string> = {
        'about': 'About',
        'operating-model': 'Operating Model',
        'focus-areas': 'Focus Areas',
        'speaking': 'Speaking & Mentorship',
        'elsewhere': 'Elsewhere'
      };
      return { section, filter: 'All', itemId: null, infoSection: infoSectionMap[parts[1]] || 'About' };
    }
    
    return { section: section || 'home', filter: 'All', itemId: null, infoSection: 'About' };
  };

  const updateUrl = (section: ActiveSection, filter?: string, itemId?: string, infoSection?: string) => {
    let path = '/';
    
    if (section === 'home') {
      path = '/';
    } else if (section === 'work' || section === 'projects') {
      if (itemId) {
        path = `/${section}/${itemId}`;
      } else if (filter && filter !== 'All') {
        path = `/${section}/${filter.toLowerCase()}`;
      } else {
        path = `/${section}`;
      }
    } else if (section === 'thoughts') {
      if (itemId) {
        path = `/updates/${itemId}`;
      } else {
        path = '/updates';
      }
    } else if (section === 'info') {
      const infoSectionSlug: Record<string, string> = {
        'About': 'about',
        'Operating Model': 'operating-model',
        'Focus Areas': 'focus-areas',
        'Speaking & Mentorship': 'speaking',
        'Elsewhere': 'elsewhere'
      };
      if (infoSection && infoSection !== 'About') {
        path = `/info/${infoSectionSlug[infoSection] || 'about'}`;
      } else {
        path = '/info';
      }
    } else {
      path = `/${section}`;
    }
    
    window.history.pushState({}, '', path);
  };

  // URL routing - parse on load
  useEffect(() => {
    const urlState = parseUrl();
    setActiveSection(urlState.section);
    setActiveFilter(urlState.filter);
    setActiveInfoSection(urlState.infoSection);
    
    if (urlState.itemId) {
      const allItems = [...allProjects, ...updates];
      const item = allItems.find(i => i.id === urlState.itemId);
      if (item) setSelectedItem(item);
    }
  }, [allProjects, updates]);

  // URL routing - handle back/forward
  useEffect(() => {
    const handlePopState = () => {
      const urlState = parseUrl();
      setActiveSection(urlState.section);
      setActiveFilter(urlState.filter);
      setActiveInfoSection(urlState.infoSection);
      setSelectedItem(null);
      
      if (urlState.itemId) {
        const allItems = [...allProjects, ...updates];
        const item = allItems.find(i => i.id === urlState.itemId);
        if (item) setSelectedItem(item);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [allProjects, updates]);

  // Clock
  useEffect(() => {
    const iv = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  // Text scramble
  useEffect(() => {
    if (activeSection !== 'home') return;
    const target = 'Shaping Creative & Digital Systems';
    const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let iteration = 0;
    let interval: ReturnType<typeof setInterval>;
    const scramble = () => {
      interval = setInterval(() => {
        setDisplayedTagline(target.split('').map((char, idx) => {
          if (idx < iteration) return target[idx];
          if (char === ' ') return ' ';
          return chars[Math.floor(Math.random() * chars.length)];
        }).join(''));
        iteration += 1 / 3;
        if (iteration >= target.length) { clearInterval(interval); setDisplayedTagline(target); }
      }, 30);
    };
    scramble();
    return () => clearInterval(interval);
  }, [activeSection]);

  // Theme
  useEffect(() => {
    const applyTheme = (mode: ThemeMode) => {
      let resolved: 'morning' | 'noon' | 'evening';
      if (mode === 'system') {
        const h = new Date().getHours();
        resolved = h >= 18 || h < 6 ? 'evening' : h < 12 ? 'morning' : 'noon';
      } else { resolved = mode; }
      setActiveTheme(resolved);
      const root = document.documentElement;
      root.classList.remove('theme-morning', 'theme-noon', 'theme-evening');
      root.classList.add(`theme-${resolved}`);
    };
    applyTheme(theme);
    const iv = setInterval(() => { if (theme === 'system') applyTheme('system'); }, 60000);
    return () => clearInterval(iv);
  }, [theme]);

  // Load data
  useEffect(() => {
    try {
      const settingsMod = import.meta.glob('./content/settings.json', { eager: true });
      const homeMod = import.meta.glob('./content/home.json', { eager: true });
      const infoMod = import.meta.glob('./content/info.json', { eager: true });
      const projectMods = import.meta.glob('./content/work/*.json', { eager: true });
      const updatesMods = import.meta.glob('./content/updates/*.json', { eager: true });

      const sd = (Object.values(settingsMod)[0] as any)?.default || {};
      const hd = (Object.values(homeMod)[0] as any)?.default || {};
      const id = (Object.values(infoMod)[0] as any)?.default || {};

      const projs: Project[] = Object.values(projectMods)
        .map((m: any) => m.default || m)
        .filter((p: Project) => p.visible !== false)
        .sort((a: Project, b: Project) => (a.order ?? 99) - (b.order ?? 99));

      const upds: Update[] = Object.values(updatesMods)
        .map((m: any) => m.default || m)
        .filter((u: Update) => u.visible !== false)
        .sort((a: Update, b: Update) => (a.order ?? 99) - (b.order ?? 99));

      setSiteData({ settings: sd, home: hd, info: id });
      setAllProjects(projs);
      setUpdates(upds);

      // Apply theme colors from CMS
      const themeData = sd.themeColors;
      if (themeData?.noon?.bg) {
        const existing = document.getElementById('cms-theme-vars');
        if (existing) existing.remove();
        const style = document.createElement('style');
        style.id = 'cms-theme-vars';
        style.textContent = `
          :root { --theme-bg: ${themeData.noon.bg}; --theme-fg: ${themeData.noon.fg}; --theme-muted: ${themeData.noon.muted}; --theme-border: ${themeData.noon.border}; }
          .theme-morning { --theme-bg: ${themeData.morning.bg}; --theme-fg: ${themeData.morning.fg}; --theme-muted: ${themeData.morning.muted}; --theme-border: ${themeData.morning.border}; }
          .theme-noon { --theme-bg: ${themeData.noon.bg}; --theme-fg: ${themeData.noon.fg}; --theme-muted: ${themeData.noon.muted}; --theme-border: ${themeData.noon.border}; }
          .theme-evening { --theme-bg: ${themeData.evening.bg}; --theme-fg: ${themeData.evening.fg}; --theme-muted: ${themeData.evening.muted}; --theme-border: ${themeData.evening.border}; }
        `;
        document.head.appendChild(style);
      }

      // Apply body font from CMS
      const typo = sd.typography;
      if (typo?.bodyFontUrl) {
        const existing = document.getElementById('cms-font-link');
        if (existing) existing.remove();
        const link = document.createElement('link');
        link.id = 'cms-font-link';
        link.rel = 'stylesheet';
        link.href = typo.bodyFontUrl;
        document.head.appendChild(link);
      }
    } catch (e) { console.error('Failed to load CMS data', e); }
  }, []);

  const triggerSound = () => { if (soundEnabled) playClickSound('modern'); };

  const { about, operatingModels, focusAreas, speaking, contact } = siteData.info || {};
  const { hero, labels } = siteData.home || {};

  const handleNav = (section: ActiveSection) => {
    triggerSound();
    setSelectedItem(null);
    setActiveFilter('All');
    setActiveSection(section);
    updateUrl(section);
  };

  const handleCopyEmail = () => {
    triggerSound();
    navigator.clipboard.writeText(siteData.info?.contact?.email || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cycleTheme = () => {
    triggerSound();
    const modes: ThemeMode[] = ['morning', 'noon', 'evening', 'system'];
    const currentIdx = modes.indexOf(theme);
    setTheme(modes[(currentIdx + 1) % modes.length]);
  };

  const socialLinks: SocialLink[] = siteData.settings?.socialLinks || [];
  const clientWork = allProjects.filter(p => CLIENT_WORK_IDS.includes(p.id));
  const personalProjects = allProjects.filter(p => !CLIENT_WORK_IDS.includes(p.id));
  const allCategories = [...new Set(allProjects.flatMap(p => p.categories || []))].sort();

  const navItems: { key: ActiveSection; label: string }[] = [
    { key: 'home', label: 'Home' },
    { key: 'work', label: 'Work' },
    { key: 'projects', label: 'Projects' },
    { key: 'thoughts', label: 'Updates' },
    { key: 'info', label: 'Info' },
    { key: 'contact', label: 'Contact' },
  ];

  const filteredProjects = activeSection === 'work'
    ? clientWork.filter(p => activeFilter === 'All' || p.categories?.includes(activeFilter))
    : personalProjects.filter(p => activeFilter === 'All' || p.categories?.includes(activeFilter));

  const filteredUpdates = [...updates].sort((a, b) => {
    const da = new Date(a.date).getTime();
    const db = new Date(b.date).getTime();
    return db - da;
  });

  const infoSections = ['About', 'Operating Model', 'Focus Areas', 'Speaking & Mentorship'];

  const isHome = activeSection === 'home';

  // ── MOBILE NAV ──
  const MobileNav = () => (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--theme-border)] bg-[var(--theme-bg)]/90 backdrop-blur-md md:hidden">
      <div className="flex items-center justify-around h-14">
        {navItems.map(item => (
          <button key={item.key} onClick={() => handleNav(item.key)}
            className={cn("flex flex-col items-center gap-0.5 text-xs font-[family-name:var(--font-body)] uppercase tracking-wider px-3 py-1 transition-colors cursor-pointer",
              activeSection === item.key ? "text-[var(--theme-fg)]" : "text-[var(--theme-muted)]"
            )}>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex font-[family-name:var(--font-body)] bg-[var(--theme-bg)] text-[var(--theme-fg)]">
      {/* ── COLUMN 1: SIDEBAR ── */}
      <aside className="hidden md:flex flex-col w-56 lg:w-64 flex-none border-r border-[var(--theme-border)] h-screen sticky top-0 p-6 justify-between">
        <div className="flex flex-col gap-10">
          <div>
            <span className="text-sm font-[family-name:var(--font-heading)] text-[var(--theme-fg)]">
              TOMI ABE STUDIO
            </span>
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map(item => (
              <button key={item.key} onClick={() => handleNav(item.key)}
                className={cn(
                  "text-left text-[15px] py-2 px-3 rounded-lg transition-all font-[family-name:var(--font-heading)] cursor-pointer",
                  activeSection === item.key
                    ? "bg-[var(--theme-fg)] text-[var(--theme-bg)]"
                    : "text-[var(--theme-muted)] hover:text-[var(--theme-fg)] hover:bg-[var(--theme-fg)]/[0.05]"
                )}>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-4">
          <div className="text-[13px] font-[family-name:var(--font-body)] text-[var(--theme-muted)] tracking-wider border-t border-[var(--theme-border)] pt-3">
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZoneName: 'short' })}
          </div>
          <div className="flex gap-2">
            {([['morning', Sunrise], ['noon', Sun], ['evening', Moon], ['system', Monitor]] as const).map(([mode, Icon]) => (
              <button key={mode} onClick={() => { triggerSound(); setTheme(mode); }}
                className={cn("p-2 rounded-lg border transition-colors cursor-pointer",
                  theme === mode ? "border-[var(--theme-fg)] text-[var(--theme-fg)]" : "border-[var(--theme-border)] text-[var(--theme-muted)] hover:border-[var(--theme-muted)]"
                )}>
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* ── COLUMN 2 + 3: CONTENT ── */}
      <main className="flex-1 min-h-screen overflow-y-auto hide-scrollbar pb-20 md:pb-0">
        <AnimatePresence mode="wait">
          {/* ── HOME ── */}
          {isHome && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <div className="px-6 md:px-10 lg:px-14 pt-10 md:pt-6 pb-16 w-full md:max-w-[75%]">
                <p className="text-sm font-[family-name:var(--font-heading)] text-[var(--theme-fg)] mb-6 md:hidden">TOMI ABE STUDIO</p>
                <h1 className="text-3xl md:text-4xl lg:text-[42px] font-[family-name:var(--font-heading)] leading-[1.15] text-[var(--theme-fg)] mb-6"
                  dangerouslySetInnerHTML={{ __html: hero?.headline || '<p>Turning complex systems into clear products, brands, and stories.</p>' }} />
                <p className="text-[17px] leading-relaxed text-[var(--theme-muted)] mb-8"
                  dangerouslySetInnerHTML={{ __html: hero?.description || '' }} />
                <button onClick={() => handleNav('work')}
                  className="inline-flex items-center gap-2 text-[14px] font-[family-name:var(--font-heading)] text-[var(--theme-fg)] hover:underline hover:underline-offset-4 transition-all cursor-pointer">
                  {labels?.heroCta || "Let's Work"} <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="px-6 md:px-10 lg:px-14 pb-16 border-t border-[var(--theme-border)]">
                <div className="pt-10 pb-8">
                  <h2 className="text-[15px] font-[family-name:var(--font-heading)] text-[var(--theme-muted)] mb-8">
                    Featured Work
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {clientWork.slice(0, 4).map((project) => (
                      <button key={project.id} onClick={() => { triggerSound(); setSelectedItem(project); setActiveSection('work'); updateUrl('work', undefined, project.id); }}
                        className="text-left group cursor-pointer">
                        <div className="aspect-[16/10] rounded-lg overflow-hidden mb-3 bg-[var(--theme-border)]">
                          {project.image && <img src={project.image} alt={project.title} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />}
                        </div>
                        <h3 className="text-xl font-[family-name:var(--font-heading)] text-[var(--theme-fg)]">{project.title}</h3>
                        <p className="text-[14px] text-[var(--theme-muted)] mt-1">{project.description}</p>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => handleNav('work')}
                    className="inline-flex items-center gap-2 text-[14px] font-[family-name:var(--font-heading)] text-[var(--theme-muted)] hover:text-[var(--theme-fg)] hover:underline hover:underline-offset-4 mt-8 transition-colors cursor-pointer">
                    View All Work <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="px-6 md:px-10 lg:px-14 pb-16 border-t border-[var(--theme-border)]">
                <div className="pt-10 pb-8">
                  <h2 className="text-[15px] font-[family-name:var(--font-heading)] text-[var(--theme-muted)] mb-8">
                    Featured Projects
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {personalProjects.slice(0, 4).map((project) => (
                      <button key={project.id} onClick={() => { triggerSound(); setSelectedItem(project); setActiveSection('projects'); updateUrl('projects', undefined, project.id); }}
                        className="text-left group cursor-pointer">
                        <div className="aspect-[16/10] rounded-lg overflow-hidden mb-3 bg-[var(--theme-border)]">
                          {project.image && <img src={project.image} alt={project.title} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />}
                        </div>
                        <h3 className="text-xl font-[family-name:var(--font-heading)] text-[var(--theme-fg)]">{project.title}</h3>
                        <p className="text-[14px] text-[var(--theme-muted)] mt-1">{project.description}</p>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => handleNav('projects')}
                    className="inline-flex items-center gap-2 text-[14px] font-[family-name:var(--font-heading)] text-[var(--theme-muted)] hover:text-[var(--theme-fg)] hover:underline hover:underline-offset-4 mt-8 transition-colors cursor-pointer">
                    View All Projects <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="px-6 md:px-10 lg:px-14 pb-16 border-t border-[var(--theme-border)]">
                <div className="pt-10">
                  <h2 className="text-[15px] font-[family-name:var(--font-heading)] text-[var(--theme-muted)] mb-8">
                    {labels?.updatesSectionHeading || 'Latest'}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredUpdates.slice(0, 4).map((update) => (
                      <button key={update.id} onClick={() => { triggerSound(); setSelectedItem(update); setActiveSection('thoughts'); updateUrl('thoughts', undefined, update.id); }}
                        className="text-left group cursor-pointer">
                        <p className="text-[13px] text-[var(--theme-muted)] mb-1">{update.date}</p>
                        <h3 className="text-lg font-[family-name:var(--font-heading)] text-[var(--theme-fg)] group-hover:underline underline-offset-4">{update.title}</h3>
                        <p className="text-[14px] text-[var(--theme-muted)] mt-1">{update.description}</p>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => handleNav('thoughts')}
                    className="inline-flex items-center gap-2 text-[14px] font-[family-name:var(--font-heading)] text-[var(--theme-muted)] hover:text-[var(--theme-fg)] hover:underline hover:underline-offset-4 mt-8 transition-colors cursor-pointer">
                    View All Updates <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── WORK / PROJECTS ── */}
          {(activeSection === 'work' || activeSection === 'projects') && (
            <motion.div key={activeSection} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              className="flex h-screen">
              {/* Col 2: List */}
              <div className="w-[300px] flex-none border-r border-[var(--theme-border)] overflow-y-auto hide-scrollbar px-6 pt-10 md:pt-6 pb-6">
                <h2 className="text-2xl font-[family-name:var(--font-heading)] text-[var(--theme-fg)] mb-6">
                  {activeSection === 'work' ? 'Work' : 'Projects'}
                </h2>
                <div className="flex flex-wrap gap-2 mb-6">
                  {['All', ...allCategories].map(cat => (
                    <button key={cat} onClick={() => { triggerSound(); setActiveFilter(cat); setSelectedItem(null); updateUrl(activeSection, cat); }}
                      className={cn("px-3 py-1.5 text-[13px] font-[family-name:var(--font-body)] rounded-full border transition-colors cursor-pointer",
                        activeFilter === cat
                          ? "border-[var(--theme-fg)] text-[var(--theme-fg)]"
                          : "border-[var(--theme-border)] text-[var(--theme-muted)] hover:border-[var(--theme-muted)]"
                      )}>
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col gap-1">
                  {filteredProjects.map((project) => (
                    <button key={project.id}
                      onClick={() => { triggerSound(); setSelectedItem(project); updateUrl(activeSection, activeFilter, project.id); }}
                      className={cn("text-left py-3 px-3 rounded-lg transition-all cursor-pointer",
                        selectedItem?.id === project.id
                          ? "bg-[var(--theme-fg)] text-[var(--theme-bg)]"
                          : "text-[var(--theme-fg)] hover:bg-[var(--theme-fg)]/[0.05]"
                      )}>
                      <h3 className="text-[18px] font-[family-name:var(--font-heading)]">{project.title}</h3>
                      {project.shortDescription && <p className="text-[13px] text-[var(--theme-muted)] mt-0.5">{project.shortDescription}</p>}
                      {project.role && <p className="text-[13px] font-medium opacity-60 mt-0.5">{project.role}</p>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Col 3: Detail */}
              <div className="hidden md:flex flex-1 overflow-y-auto hide-scrollbar px-6 md:px-8 lg:px-10 pt-10 md:pt-6 pb-16">
                <div className="max-w-2xl w-full">
                {selectedItem ? (
                  <>
                    <h2 className="text-2xl font-[family-name:var(--font-heading)] text-[var(--theme-fg)] mb-2">{selectedItem.title}</h2>
                    {selectedItem.shortDescription && <p className="text-[15px] text-[var(--theme-muted)] mb-2">{selectedItem.shortDescription}</p>}
                    {(selectedItem.role || selectedItem.year) && (
                      <p className="text-[14px] font-medium opacity-60 mb-3">
                        {selectedItem.role}{selectedItem.role && selectedItem.year && ' · '}{selectedItem.year}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {(selectedItem.categories || []).map((c: string) => (
                        <span key={c} className="text-[13px] font-[family-name:var(--font-body)] px-2.5 py-1 rounded-full border border-[var(--theme-border)] text-[var(--theme-muted)]">{c}</span>
                      ))}
                    </div>
                    {selectedItem.image && (
                      <div className="rounded-lg mb-6 bg-[var(--theme-border)]">
                        <img src={selectedItem.image} alt={selectedItem.title} className="w-full h-auto rounded-lg" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    <p className="text-[16px] leading-relaxed text-[var(--theme-muted)] mb-8">{selectedItem.description}</p>
                    {selectedItem.details?.map((d: ProjectDetail, i: number) => (
                      <div key={i} className="mb-6">
                        <h3 className="text-[15px] font-[family-name:var(--font-heading)] text-[var(--theme-fg)] mb-2">{d.heading}</h3>
                        <p className="text-[15px] leading-relaxed text-[var(--theme-muted)]">{d.text}</p>
                      </div>
                    ))}
                    {selectedItem.link && (
                      <a href={selectedItem.link} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[14px] font-[family-name:var(--font-heading)] text-[var(--theme-fg)] hover:underline underline-offset-4 cursor-pointer mb-8">
                        {siteData.settings?.uiLabels?.visitProject || 'Visit'} <ArrowUpRight className="w-4 h-4" />
                      </a>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full w-full">
                    <p className="text-[15px] text-[var(--theme-muted)]">Select an item to view details</p>
                  </div>
                )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── UPDATES ── */}
          {activeSection === 'thoughts' && (
            <motion.div key="thoughts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              className="flex h-screen">
              {/* Col 2: List */}
              <div className="w-[300px] flex-none border-r border-[var(--theme-border)] overflow-y-auto hide-scrollbar px-6 pt-10 md:pt-6 pb-6">
                <h2 className="text-2xl font-[family-name:var(--font-heading)] text-[var(--theme-fg)] mb-6">Updates</h2>
                <div className="flex flex-col gap-1">
                  {filteredUpdates.map((update) => (
                    <button key={update.id}
                      onClick={() => { triggerSound(); setSelectedItem(update); updateUrl('thoughts', undefined, update.id); }}
                      className={cn("text-left py-3 px-3 rounded-lg transition-all cursor-pointer",
                        selectedItem?.id === update.id
                          ? "bg-[var(--theme-fg)] text-[var(--theme-bg)]"
                          : "text-[var(--theme-fg)] hover:bg-[var(--theme-fg)]/[0.05]"
                      )}>
                      <p className={cn("text-[13px] font-[family-name:var(--font-body)]",
                        selectedItem?.id === update.id ? "text-[var(--theme-bg)]/60" : "text-[var(--theme-muted)]"
                      )}>{update.date}</p>
                      <h3 className="text-[18px] font-[family-name:var(--font-heading)] mt-0.5">{update.title}</h3>
                    </button>
                  ))}
                </div>
              </div>

              {/* Col 3: Detail */}
              <div className="hidden md:flex flex-1 overflow-y-auto hide-scrollbar px-6 md:px-8 lg:px-10 pt-10 md:pt-6 pb-16">
                <div className="max-w-2xl w-full">
                {selectedItem ? (
                  <>
                    <p className="text-[13px] text-[var(--theme-muted)] mb-2">{selectedItem.date}</p>
                    <h2 className="text-2xl font-[family-name:var(--font-heading)] text-[var(--theme-fg)] mb-4">{selectedItem.title}</h2>
                    {selectedItem.image && (
                      <div className="rounded-lg mb-6 bg-[var(--theme-border)]">
                        <img src={selectedItem.image} alt={selectedItem.title} className="w-full h-auto rounded-lg" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    <p className="text-[16px] leading-relaxed text-[var(--theme-muted)] mb-6">{selectedItem.description}</p>
                    {selectedItem.content && (
                      <div className="update-body text-[16px] leading-relaxed text-[var(--theme-muted)]" dangerouslySetInnerHTML={{ __html: selectedItem.content }} />
                    )}
                    {selectedItem.link && (
                      <a href={selectedItem.link} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[14px] font-[family-name:var(--font-heading)] text-[var(--theme-fg)] hover:underline underline-offset-4 mt-6 cursor-pointer">
                        Read more <ArrowUpRight className="w-4 h-4" />
                      </a>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full w-full">
                    <p className="text-[15px] text-[var(--theme-muted)]">Select an update to read</p>
                  </div>
                )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── INFO ── */}
          {activeSection === 'info' && (
            <motion.div key="info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              className="flex h-screen">
              {/* Col 2: Section Index */}
              <div className="w-[300px] flex-none border-r border-[var(--theme-border)] overflow-y-auto hide-scrollbar px-6 pt-10 md:pt-6 pb-6">
                <h2 className="text-2xl font-[family-name:var(--font-heading)] text-[var(--theme-fg)] mb-6">Info</h2>
                <nav className="flex flex-col gap-1">
                  {infoSections.map(section => (
                    <button key={section}
                      onClick={() => { triggerSound(); setActiveInfoSection(section); updateUrl('info', undefined, undefined, section); }}
                      className={cn("text-left py-2.5 px-3 rounded-lg transition-all text-[15px] font-[family-name:var(--font-heading)] cursor-pointer",
                        activeInfoSection === section
                          ? "bg-[var(--theme-fg)] text-[var(--theme-bg)]"
                          : "text-[var(--theme-muted)] hover:text-[var(--theme-fg)] hover:bg-[var(--theme-fg)]/[0.05]"
                      )}>
                      {section}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Col 3: Content */}
              <div className="hidden md:flex flex-1 overflow-y-auto hide-scrollbar px-6 md:px-8 lg:px-10 pt-10 md:pt-6 pb-16">
                <div className="max-w-2xl w-full">
                  {activeInfoSection === 'About' && about && (
                    <div>
                      <div className="flex items-center gap-5 mb-8">
                        {about.imageUrl && (
                          <img src={about.imageUrl} alt={about.name}
                            className="w-16 h-16 rounded-full object-cover" referrerPolicy="no-referrer" />
                        )}
                        <div>
                          <h2 className="text-2xl font-[family-name:var(--font-heading)] text-[var(--theme-fg)]">{about.name}</h2>
                          <p className="text-[14px] font-[family-name:var(--font-body)] text-[var(--theme-muted)]">{about.role}</p>
                        </div>
                      </div>
                      <p className="text-[16px] leading-relaxed text-[var(--theme-muted)] whitespace-pre-line">{about.bio}</p>
                    </div>
                  )}

                  {activeInfoSection === 'Operating Model' && operatingModels && (
                    <div>
                      <h2 className="text-2xl font-[family-name:var(--font-heading)] text-[var(--theme-fg)] mb-8">Operating Model</h2>
                      <div className="flex flex-col gap-8">
                        {operatingModels.map((m: any, i: number) => (
                          <div key={i}>
                            <h3 className="text-[16px] font-[family-name:var(--font-heading)] text-[var(--theme-fg)] mb-2">{m.title}</h3>
                            <p className="text-[15px] leading-relaxed text-[var(--theme-muted)]">{m.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeInfoSection === 'Focus Areas' && focusAreas && (
                    <div>
                      <h2 className="text-2xl font-[family-name:var(--font-heading)] text-[var(--theme-fg)] mb-8">Focus Areas</h2>
                      <div className="flex flex-col gap-6">
                        {focusAreas.map((f: any, i: number) => (
                          <div key={i} className="border-b border-[var(--theme-border)] pb-6 last:border-0">
                            <h3 className="text-[16px] font-[family-name:var(--font-heading)] text-[var(--theme-fg)] mb-2">{f.title}</h3>
                            <p className="text-[15px] leading-relaxed text-[var(--theme-muted)]">{f.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeInfoSection === 'Speaking & Mentorship' && speaking && (
                    <div>
                      <h2 className="text-2xl font-[family-name:var(--font-heading)] text-[var(--theme-fg)] mb-4">Speaking & Mentorship</h2>
                      <p className="text-[15px] leading-relaxed text-[var(--theme-muted)] mb-6">{speaking.description}</p>
                      <div className="flex flex-col gap-6">
                        {speaking.engagements?.map((e: any, i: number) => (
                          <div key={i} className="py-4 border-b border-[var(--theme-border)] last:border-0 last:pb-8">
                            <h3 className="text-[16px] font-[family-name:var(--font-heading)] text-[var(--theme-fg)]">{e.title}</h3>
                            <p className="text-[14px] mt-1"><span className="font-medium opacity-60 text-[var(--theme-fg)]">{e.role}</span> <span className="text-[var(--theme-muted)]">· {e.year}</span></p>
                            <p className="text-[15px] text-[var(--theme-muted)] mt-2">{e.description}</p>
                            {e.link && (
                              <a href={e.link} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-[14px] font-[family-name:var(--font-heading)] text-[var(--theme-fg)] hover:underline underline-offset-4 mt-3 cursor-pointer">
                                {e.ctaLabel || 'Learn more'} <ArrowUpRight className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </motion.div>
          )}

          {/* ── CONTACT ── */}
          {activeSection === 'contact' && (
            <motion.div key="contact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <div className="px-6 md:px-8 lg:px-10 pt-10 md:pt-6 pb-16 max-w-2xl">
                <h2 className="text-2xl font-[family-name:var(--font-heading)] text-[var(--theme-fg)] mb-4">Contact</h2>

                {/* Big headline */}
                <p className="text-[38px] font-[family-name:var(--font-heading)] text-[var(--theme-fg)] leading-[1.15] mb-10" style={{ textWrap: 'balance' } as React.CSSProperties}>
                  {contact?.headline || "Let's create something coherent."}
                </p>

                {/* Reach out for */}
                <p className="text-[15px] font-[family-name:var(--font-heading)] text-[var(--theme-muted)] mb-6">Reach out for</p>
                <div className="flex flex-col gap-6 mb-8">
                  {[
                    { title: 'Project inquiries', desc: 'Brand, product, or digital system work across any stage or market.' },
                    { title: 'Speaking & training', desc: 'Talks, workshops, and facilitation on design, AI, and systems thinking.' },
                    { title: 'Collaborations', desc: 'Independent projects, research, and creative partnerships.' },
                    { title: 'Mentorship', desc: 'Through MentorCruise or direct inquiry.' },
                  ].map((item, i, arr) => (
                    <div key={item.title} className={i < arr.length - 1 ? "border-b border-[var(--theme-border)] pb-6" : ""}>
                      <p className="text-[16px] font-[family-name:var(--font-heading)] text-[var(--theme-fg)] mb-2">{item.title}</p>
                      <p className="text-[15px] leading-relaxed text-[var(--theme-muted)]">{item.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Response time — above the divider */}
                <p className="text-[15px] text-[var(--theme-muted)] mb-8">
                  Typically responds within 1–3 business days.
                </p>

                {/* Divider → email + social */}
                <div className="border-t border-[var(--theme-border)] pt-6">
                  <button onClick={handleCopyEmail}
                    className="group inline-flex items-center gap-3 font-[family-name:var(--font-heading)] text-[var(--theme-fg)] hover:opacity-60 transition-opacity cursor-pointer"
                    style={{ fontSize: 'clamp(18px, 2vw, 26px)' }}>
                    {contact?.email || 'studio@tomiabe.com'}
                    {copied
                      ? <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      : <Copy className="w-4 h-4 text-[var(--theme-muted)] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </button>
                  <p className="text-[13px] text-[var(--theme-muted)] mt-1.5 mb-6">
                    {copied ? 'Copied to clipboard' : 'Click to copy'}
                  </p>
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    {socialLinks.map((link: SocialLink) => (
                      <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[15px] font-[family-name:var(--font-heading)] text-[var(--theme-muted)] hover:text-[var(--theme-fg)] transition-colors cursor-pointer">
                        {link.name} <ArrowUpRight className="w-4 h-4" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── FOOTER ── */}
        <div className="px-6 md:px-8 lg:px-10 py-8 border-t border-[var(--theme-border)] flex items-center justify-between">
          <p className="text-[13px] font-[family-name:var(--font-heading)] text-[var(--theme-muted)] tracking-wider">
            Objectivity · Clarity · Precision
          </p>
          <p className="text-[13px] text-[var(--theme-muted)]">
            © 2026 Tomi Abe Studio
          </p>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
