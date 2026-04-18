import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playClickSound } from './lib/audio';
import { ArrowUpRight, Copy, Check, Sun, Moon, Sunrise, Menu, X, Filter, Compass, Layers, BarChart2, Globe, Cpu, Volume2, VolumeX, ArrowDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type ThemeMode = 'morning' | 'noon' | 'evening' | 'system';

// ─── Data Types ────────────────────────────────────────────────────────────────

interface ProjectDetail {
  heading: string;
  text: string;
  image: string;
}

interface Project {
  id: string;
  title: string;
  role?: string;
  description: string;
  categories: string[];
  link?: string;
  isFullBleed?: boolean;
  image: string;
  details?: ProjectDetail[];
}

interface Update {
  id: string;
  date: string;
  title: string;
  description: string;
  image: string;
  content?: string[];
}

interface SocialLink {
  name: string;
  url: string;
}

interface Engagement {
  year: string;
  role: string;
  title: string;
  description: string;
  link?: string;
}

interface ThemeColors {
  morning: { bg: string; fg: string; muted: string; border: string };
  noon: { bg: string; fg: string; muted: string; border: string };
  evening: { bg: string; fg: string; muted: string; border: string };
}

interface UILabels {
  workSectionHeading?: string;
  updatesSectionHeading?: string;
  infoSectionHeading?: string;
  operatingModelHeading?: string;
  focusAreasHeading?: string;
  speakingHeading?: string;
  heroCta?: string;
  loadMore?: string;
  showLess?: string;
  backToTop?: string;
  visitProject?: string;
  discussProject?: string;
  filterLabel?: string;
  filterByLabel?: string;
  sidebarEnvironment?: string;
  sidebarVisuals?: string;
  sidebarLayout?: string;
  sidebarAcoustics?: string;
  sidebarNetwork?: string;
}

interface SiteSettings {
  themeColors: ThemeColors;
  typography: {
    bodyFontUrl?: string;
    bodyFontFamily?: string;
    monoFontFamily?: string;
  };
  layout: {
    workItemsPerPage: number;
    updatesItemsPerPage: number;
  };
  clock: {
    locale: string;
    hour12: boolean;
    timezone: string;
  };
  uiLabels: UILabels;
  // label overrides from home.json and info.json
  _homeLabels?: UILabels;
  _infoLabels?: { operatingModelHeading?: string; focusAreasHeading?: string; speakingHeading?: string };
}

interface SiteData {
  metadata: {
    siteTitle: string;
    seoDescription: string;
    seoKeywords?: string;
    ogImage?: string;
    headScripts?: string;
    faviconEmoji?: string;
    faviconImage?: string;
  };
  navigation: {
    logoText: string;
    items: { label: string; url: string }[];
  };
  hero: {
    headline: string;
    description: string;
  };
  about: {
    name: string;
    role: string;
    imageUrl: string;
    about: string[];
    operatingModels: { title: string; description: string }[];
    focusAreas: { title: string; description: string }[];
    speaking: {
      description: string;
      engagements: Engagement[];
    };
  };
  contact: {
    headline: string;
    description: string;
    email: string;
    location?: string;
    footerCopyright: string;
    footerTagline: string;
  };
  socialLinks: SocialLink[];
  projects: Project[];
  updates: Update[];
  uiSettings: SiteSettings;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue] as const;
}

function LiveClock({ locale = 'en-US', hour12 = true, timezone = 'short' }: { locale?: string; hour12?: boolean; timezone?: string }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="font-mono text-[12px] tracking-widest text-[var(--theme-muted)] uppercase whitespace-nowrap">
      {time.toLocaleTimeString(locale, { hour12, timeZoneName: timezone as Intl.DateTimeFormatOptions['timeZoneName'] })}
    </div>
  );
}

// ─── Default settings ─────────────────────────────────────────────────────────
const DEFAULT_THEME_COLORS: ThemeColors = {
  morning: { bg: '#fdfaf6', fg: '#1c1917', muted: '#78716c', border: '#e7e5e4' },
  noon: { bg: '#ffffff', fg: '#09090b', muted: '#71717a', border: '#e4e4e7' },
  evening: { bg: '#09090b', fg: '#fafafa', muted: '#a1a1aa', border: '#27272a' },
};

const DEFAULT_UI_LABELS: UILabels = {
  workSectionHeading: 'Selected Work',
  updatesSectionHeading: 'News & Updates',
  infoSectionHeading: 'Info',
  operatingModelHeading: 'Operating Model',
  focusAreasHeading: 'Focus Areas',
  speakingHeading: 'Speaking, Workshops & Mentorship',
  heroCta: "Let's Work",
  loadMore: 'Load More',
  showLess: 'Show Less',
  backToTop: 'Back to Top',
  visitProject: 'Visit Live Project',
  discussProject: 'Discuss Similar Project',
  filterLabel: 'Filters',
  filterByLabel: 'Filter by discipline',
  sidebarEnvironment: 'Environment',
  sidebarVisuals: 'Visuals',
  sidebarLayout: 'Layout',
  sidebarAcoustics: 'Acoustics',
  sidebarNetwork: 'Network',
};

const DEFAULT_SETTINGS: SiteSettings = {
  themeColors: DEFAULT_THEME_COLORS,
  typography: { bodyFontUrl: '', bodyFontFamily: 'Inter', monoFontFamily: 'JetBrains Mono' },
  layout: { workItemsPerPage: 6, updatesItemsPerPage: 6 },
  clock: { locale: 'en-US', hour12: true, timezone: 'short' },
  uiLabels: DEFAULT_UI_LABELS,
};

// ─── Default data (used while JSON loads) ─────────────────────────────────────
const DEFAULT_DATA: SiteData = {
  metadata: { siteTitle: 'Tomi Abe Studio', seoDescription: '', faviconEmoji: '✦' },
  navigation: { logoText: 'TAS', items: [] },
  hero: { headline: '', description: '' },
  about: { name: '', role: '', imageUrl: '', about: [], operatingModels: [], focusAreas: [], speaking: { description: '', engagements: [] } },
  contact: { headline: '', description: '', email: '', footerCopyright: '', footerTagline: '' },
  socialLinks: [],
  projects: [],
  updates: [],
  uiSettings: DEFAULT_SETTINGS,
};

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [siteData, setSiteData] = useState<SiteData>(DEFAULT_DATA);
  const [dataLoaded, setDataLoaded] = useState(false);

  // ── Persistent user preferences ──
  const [theme, setTheme] = useLocalStorage<ThemeMode>('tomi_theme', 'system');
  const [activeTheme, setActiveTheme] = useState<'morning' | 'noon' | 'evening'>('noon');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useLocalStorage<boolean>('tomi_soundEnabled', false);
  const [soundProfile, setSoundProfile] = useLocalStorage<'modern' | 'mechanical' | 'soft'>('tomi_soundProfile', 'modern');
  const [soundVolume, setSoundVolume] = useLocalStorage<number>('tomi_soundVolume', 1.0);
  const [showAllWork, setShowAllWork] = useState(false);
  const [showAllUpdates, setShowAllUpdates] = useState(false);
  const [colorMode, setColorMode] = useLocalStorage<'color' | 'monochrome'>('tomi_colorMode', 'color');
  const [sidebarPosition, setSidebarPosition] = useLocalStorage<'right' | 'left'>('tomi_sidebarPosition', 'right');
  const [selectedUpdate, setSelectedUpdate] = useState<Update | null>(null);
  const [copiedUpdate, setCopiedUpdate] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [copiedProject, setCopiedProject] = useState(false);
  useEffect(() => {
    try {
      // 1. Load singleton files
      const settingsMod = import.meta.glob('./content/settings.json', { eager: true });
      const homeMod = import.meta.glob('./content/home.json', { eager: true });
      const infoMod = import.meta.glob('./content/info.json', { eager: true });
      
      const sd = (Object.values(settingsMod)[0] as any)?.default || {};
      const hd = (Object.values(homeMod)[0] as any)?.default || {};
      const id = (Object.values(infoMod)[0] as any)?.default || {};

      // 2. Load collections
      const projectMods = import.meta.glob('./content/work/*.json', { eager: true });
      const updatesMods = import.meta.glob('./content/updates/*.json', { eager: true });
      
      // Helper to unwrap CMS lists (string[] or {value: string}[])
      const unwrap = (arr: any) => {
        if (!Array.isArray(arr)) return [];
        return arr.map(item => (typeof item === 'object' && item !== null ? (item.value || item.title || item.label || Object.values(item)[0]) : item));
      };

      const pd_list = Object.values(projectMods).map((m: any) => {
        const p = m.default;
        return { ...p, categories: unwrap(p.categories) };
      });
      const ud_list = Object.values(updatesMods).map((m: any) => {
        const u = m.default;
        return { ...u, content: unwrap(u.content) };
      });

      // Merge labels from all sources: settings > home labels > info labels
      const mergedLabels: UILabels = {
        ...DEFAULT_UI_LABELS,
        ...(sd.uiLabels || {}),
        ...(hd.labels || {}),
        ...(id.labels || {}),
      };

      const merged: SiteData = {
        metadata: sd.metadata || {},
        navigation: sd.navigation || { logoText: 'TAS', items: [] },
        hero: hd.hero || { headline: '', description: '' },
        about: {
          ...(id.about || DEFAULT_DATA.about),
          about: unwrap(id.about?.about),
          operatingModels: id.operatingModels || id.about?.operatingModels || [],
          focusAreas: id.focusAreas || id.about?.focusAreas || [],
          speaking: id.speaking || id.about?.speaking || { description: '', engagements: [] },
        },
        contact: {
          ...(id.contact || {}),
          footerCopyright: sd.footer?.footerCopyright || '',
          footerTagline: sd.footer?.footerTagline || '',
        },
        socialLinks: sd.socialLinks || [],
        projects: pd_list,
        updates: ud_list,
        uiSettings: {
          themeColors: sd.themeColors || DEFAULT_THEME_COLORS,
          typography: sd.typography || DEFAULT_SETTINGS.typography,
          layout: sd.layout || DEFAULT_SETTINGS.layout,
          clock: sd.clock || DEFAULT_SETTINGS.clock,
          uiLabels: mergedLabels,
        },
      };

      setSiteData(merged);
      setDataLoaded(true);

      // Apply side effects
      document.title = merged.metadata.siteTitle || 'Tomi Abe Studio';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', merged.metadata.seoDescription || '');

      const faviconEl = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (faviconEl) {
        if (merged.metadata.faviconImage) {
          faviconEl.type = 'image/png';
          faviconEl.href = merged.metadata.faviconImage;
        } else if (merged.metadata.faviconEmoji) {
          faviconEl.type = 'image/svg+xml';
          faviconEl.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${merged.metadata.faviconEmoji}</text></svg>`;
        }
      }

      // Themes & Fonts
      const themeData = merged.uiSettings.themeColors;
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

      const typo = merged.uiSettings.typography;
      if (typo?.bodyFontUrl) {
        const el = document.getElementById('cms-font-link');
        if (el) el.remove();
        const link = document.createElement('link');
        link.id = 'cms-font-link';
        link.rel = 'stylesheet';
        link.href = typo.bodyFontUrl;
        document.head.appendChild(link);
      }
      if (typo?.bodyFontFamily || typo?.monoFontFamily) {
        const el2 = document.getElementById('cms-font-vars');
        if (el2) el2.remove();
        const style2 = document.createElement('style');
        style2.id = 'cms-font-vars';
        style2.textContent = `:root {
          ${typo.bodyFontFamily ? `--font-sans: "${typo.bodyFontFamily}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;` : ''}
          ${typo.monoFontFamily ? `--font-mono: "${typo.monoFontFamily}", ui-monospace, monospace;` : ''}
        }`;
        document.head.appendChild(style2);
      }
    } catch (err) {
      console.warn('Error loading synchronous content, check content directory.', err);
      setDataLoaded(true);
    }
  }, []);

  // ── Derived data ──
  const { metadata, navigation, hero, about, contact, socialLinks, projects, updates } = siteData;
  const settings = siteData.uiSettings ?? DEFAULT_SETTINGS;
  const labels: UILabels = { ...DEFAULT_UI_LABELS, ...(settings.uiLabels ?? {}) };
  const layout = settings.layout ?? DEFAULT_SETTINGS.layout;
  const clockSettings = settings.clock ?? DEFAULT_SETTINGS.clock;
  const workItemsPerPage = layout.workItemsPerPage ?? 6;
  const updatesItemsPerPage = layout.updatesItemsPerPage ?? 6;

  // ── Scroll lock when drawer open ──
  useEffect(() => {
    document.body.style.overflow = selectedUpdate || selectedProject ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [selectedUpdate, selectedProject]);

  const triggerSound = () => {
    if (soundEnabled) playClickSound(soundProfile, soundVolume);
  };

  // ── Theme ──
  useEffect(() => {
    const applyTheme = (mode: ThemeMode) => {
      let resolved: 'morning' | 'noon' | 'evening';
      if (mode === 'system') {
        const h = new Date().getHours();
        resolved = h >= 18 || h < 6 ? 'evening' : h < 12 ? 'morning' : 'noon';
      } else {
        resolved = mode;
      }
      setActiveTheme(resolved);
      const root = document.documentElement;
      root.classList.remove('theme-morning', 'theme-noon', 'theme-evening');
      root.classList.add(`theme-${resolved}`);
    };
    applyTheme(theme);
    const iv = setInterval(() => { if (theme === 'system') applyTheme('system'); }, 60000);
    return () => clearInterval(iv);
  }, [theme]);

  // ── Helpers ──
  const toggleCategory = (cat: string) => {
    triggerSound();
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const handleCopyEmail = () => {
    triggerSound();
    navigator.clipboard.writeText(contact.email || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyUpdateLink = () => { triggerSound(); navigator.clipboard.writeText(window.location.href); setCopiedUpdate(true); setTimeout(() => setCopiedUpdate(false), 2000); };
  const handleCopyProjectLink = () => { triggerSound(); navigator.clipboard.writeText(window.location.href); setCopiedProject(true); setTimeout(() => setCopiedProject(false), 2000); };

  const filteredProjects = projects.filter(p => {
    if (selectedCategories.length === 0) return true;
    return selectedCategories.some(sc => p.categories.includes(sc));
  });

  const selectedProjectIndex = selectedProject ? projects.findIndex(p => p.id === selectedProject.id) : -1;
  const prevProject = selectedProjectIndex > 0 ? projects[selectedProjectIndex - 1] : null;
  const nextProject = selectedProjectIndex !== -1 && selectedProjectIndex < projects.length - 1 ? projects[selectedProjectIndex + 1] : null;

  const selectedUpdateIndex = selectedUpdate ? updates.findIndex(u => u.id === selectedUpdate.id) : -1;
  const prevUpdate = selectedUpdateIndex > 0 ? updates[selectedUpdateIndex - 1] : null;
  const nextUpdate = selectedUpdateIndex !== -1 && selectedUpdateIndex < updates.length - 1 ? updates[selectedUpdateIndex + 1] : null;

  // Derive unique categories from data
  const allCategories = Array.from(new Set(projects.flatMap(p => p.categories)));

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, targetId: string) => {
    e.preventDefault();
    triggerSound();
    setMobileMenuOpen(false);
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => { triggerSound(); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const TopNav = () => (
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-[var(--theme-border)] bg-[var(--theme-bg)]/80 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="font-mono text-sm tracking-tight font-medium uppercase" onClick={(e) => handleNavClick(e as any, 'hero')}>
          {navigation.logoText || metadata.siteTitle || 'TAS'}
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 text-sm uppercase tracking-wide font-medium">
          {navigation.items.map((item, i) => (
            <a key={i} href={item.url} onClick={(e) => handleNavClick(e, item.url.replace('#', ''))} className="hover:text-[var(--theme-muted)] transition-colors cursor-pointer">
              {item.label}
            </a>
          ))}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2" onClick={() => { triggerSound(); setMobileMenuOpen(!mobileMenuOpen); }}>
          {mobileMenuOpen ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
        </button>
      </div>
    </nav>
  );

  const focusIcons = [Compass, Layers, BarChart2, Globe, Cpu];

  return (
    <div className="min-h-screen flex flex-col font-sans relative pt-16">
      <TopNav />

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-[var(--theme-bg)] pt-24 px-6 flex flex-col gap-6 text-xl uppercase tracking-wide md:hidden overflow-y-auto pb-12"
          >
            <div className="flex flex-col gap-6 font-medium">
              {navigation.items.map((item, i) => (
                <a key={i} href={item.url} onClick={(e) => handleNavClick(e as any, item.url.replace('#', ''))} className="cursor-pointer">
                  {item.label}
                </a>
              ))}
            </div>

            <div className="border-t border-[var(--theme-border)] pt-8 mt-4 flex flex-col gap-8">
              {/* Theme Settings */}
              <div className="flex flex-col gap-4">
                <div className="text-xs font-mono uppercase tracking-widest text-[var(--theme-muted)] border-b border-[var(--theme-border)] pb-2">
                  <span>{labels.sidebarEnvironment}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(['morning', 'noon', 'evening', 'system'] as ThemeMode[]).map(mode => (
                    <button
                      key={mode}
                      onClick={() => { triggerSound(); setTheme(mode); }}
                      className={cn(
                        "flex items-center justify-center p-3 border rounded-xl transition-colors cursor-pointer",
                        theme === mode ? "border-[var(--theme-fg)] text-[var(--theme-fg)]" : "border-[var(--theme-border)] text-[var(--theme-muted)] hover:border-[var(--theme-muted)]"
                      )}
                    >
                      {mode === 'morning' && <Sunrise className="w-5 h-5"/>}
                      {mode === 'noon' && <Sun className="w-5 h-5"/>}
                      {mode === 'evening' && <Moon className="w-5 h-5"/>}
                      {mode === 'system' && <span className="font-mono text-xl leading-none">⚙</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visuals Setting */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[var(--theme-muted)] border-b border-[var(--theme-border)] pb-2">
                  <span>{labels.sidebarVisuals}</span>
                  <button onClick={() => { triggerSound(); setColorMode(colorMode === 'color' ? 'monochrome' : 'color'); }} className="flex items-center gap-1 hover:text-[var(--theme-fg)] transition-colors cursor-pointer">
                    {colorMode === 'color' ? 'REAL' : 'B&W'}
                  </button>
                </div>
              </div>

              {/* Sound Settings */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[var(--theme-muted)] border-b border-[var(--theme-border)] pb-2">
                  <span>{labels.sidebarAcoustics}</span>
                  <button onClick={() => { triggerSound(); setSoundEnabled(!soundEnabled); }} className="flex items-center gap-1 hover:text-[var(--theme-fg)] transition-colors cursor-pointer">
                    {soundEnabled ? <Volume2 className="w-4 h-4"/> : <VolumeX className="w-4 h-4"/>}
                    {soundEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>
                {soundEnabled && (
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-3 gap-2">
                      {(['modern', 'mechanical', 'soft'] as const).map(profile => (
                        <button
                          key={profile}
                          onClick={() => { setSoundProfile(profile); setTimeout(() => playClickSound(profile, soundVolume), 10); }}
                          className={cn(
                            "py-3 px-1 border rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer",
                            soundProfile === profile ? "border-[var(--theme-fg)] text-[var(--theme-fg)]" : "border-[var(--theme-border)] text-[var(--theme-muted)]"
                          )}
                        >
                          {profile}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-mono text-[var(--theme-muted)] uppercase tracking-widest select-none">Vol</span>
                      <input type="range" min="0" max="1" step="0.1" value={soundVolume}
                        onChange={(e) => { const val = parseFloat(e.target.value); setSoundVolume(val); setTimeout(() => playClickSound(soundProfile, val), 10); }}
                        className="w-full accent-[var(--theme-fg)] cursor-pointer h-1 bg-[var(--theme-border)] rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--theme-fg)]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Network */}
              <div className="flex flex-col gap-4">
                <div className="text-xs font-mono uppercase tracking-widest text-[var(--theme-muted)] border-b border-[var(--theme-border)] pb-2">{labels.sidebarNetwork}</div>
                <div className="grid grid-cols-2 gap-4 text-sm font-mono mt-2">
                  {socialLinks.map((link, idx) => (
                    <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[var(--theme-muted)] transition-colors cursor-pointer w-fit text-[var(--theme-fg)]">
                      {link.name} <ArrowUpRight className="w-3 h-3 opacity-50" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Mobile Clock */}
              <div className="flex flex-col gap-2">
                <LiveClock locale={clockSettings.locale} hour12={clockSettings.hour12} timezone={clockSettings.timezone} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 py-12 md:py-24">

        {/* Left Column / Main Content */}
        <div className={cn("md:col-span-9 flex flex-col gap-32", sidebarPosition === 'right' ? "order-1" : "order-2")}>

          {/* HERO */}
          <section id="hero" className="flex flex-col gap-6 pt-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl md:text-7xl font-sans tracking-tight leading-[1.05] font-medium max-w-4xl"
            >
              {hero.headline}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-[var(--theme-muted)] max-w-2xl leading-relaxed mt-4"
            >
              {hero.description}
            </motion.p>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              onClick={() => { triggerSound(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="mt-4 flex items-center w-fit px-6 py-3 bg-[var(--theme-fg)] text-[var(--theme-bg)] rounded-full hover:scale-105 active:scale-95 transition-transform group font-medium cursor-pointer"
            >
              {labels.heroCta} <ArrowDown className="ml-2 w-5 h-5"/>
            </motion.button>
          </section>

          {/* UNIFIED WORK FEED */}
          <section id="work" className="scroll-mt-32">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-mono uppercase tracking-widest text-[var(--theme-muted)] border-b border-[var(--theme-border)] pb-2 flex-grow mr-4">{labels.workSectionHeading}</h2>
              <button
                onClick={() => { triggerSound(); setFilterPanelOpen(!filterPanelOpen); }}
                className="flex items-center gap-2 px-3 py-1.5 border border-[var(--theme-border)] rounded text-xs uppercase cursor-pointer"
              >
                <Filter className="w-3 h-3"/> {labels.filterLabel} {selectedCategories.length > 0 && `(${selectedCategories.length})`}
              </button>
            </div>

            {/* Filters */}
            <AnimatePresence>
              {filterPanelOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-8 border-b border-[var(--theme-border)] pb-6"
                >
                  <p className="text-xs uppercase tracking-widest text-[var(--theme-muted)] mb-4 font-mono">{labels.filterByLabel}</p>
                  <div className="flex flex-wrap gap-2">
                    {allCategories.map(cat => {
                      const isActive = selectedCategories.includes(cat);
                      const catCount = projects.filter(p => p.categories.includes(cat)).length;
                      return (
                        <button
                          key={cat}
                          onClick={() => toggleCategory(cat)}
                          className={cn(
                            "px-4 py-2 text-xs font-mono rounded transition-colors border cursor-pointer flex gap-2 items-center",
                            isActive ? "bg-[var(--theme-fg)] text-[var(--theme-bg)] border-[var(--theme-fg)]" : "border-[var(--theme-border)] hover:border-[var(--theme-muted)] bg-[var(--theme-bg)]"
                          )}
                        >
                          {cat} <span className="opacity-60 text-[10px]">({catCount})</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
              <AnimatePresence mode="popLayout">
                {(showAllWork ? filteredProjects : filteredProjects.slice(0, workItemsPerPage)).map((project) => (
                  <motion.a
                    href={project.link || "#"}
                    onClick={e => { e.preventDefault(); triggerSound(); setSelectedProject(project); }}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4 }}
                    key={project.id}
                    className={cn(
                      "group relative flex flex-col justify-end min-h-[320px] sm:min-h-[400px] overflow-hidden rounded-2xl border border-[var(--theme-border)] bg-gray-100 dark:bg-gray-900",
                      project.isFullBleed ? "md:col-span-2" : "col-span-1"
                    )}
                  >
                    <img
                      src={project.image}
                      alt={project.title}
                      className={cn("absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105", colorMode === 'monochrome' ? "grayscale" : "")}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-500 group-hover:from-black/90 group-hover:via-black/50" />
                    <div className="relative z-10 p-6 sm:p-8 flex flex-col gap-2 text-white mt-auto">
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                        <h3 className="text-2xl font-medium tracking-tight text-left">
                          {project.title}
                          {project.link && <ArrowUpRight className="inline-block ml-1 w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity"/>}
                        </h3>
                      </div>
                      <p className="text-gray-200 leading-snug text-sm sm:text-base max-w-2xl line-clamp-none sm:line-clamp-2 md:line-clamp-3 text-left">
                        {project.description}
                      </p>
                      <div className="mt-4 pt-4 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                        <div className="flex flex-wrap gap-2">
                          {project.categories.map(cat => (
                            <span key={cat} className="text-[10px] uppercase tracking-widest px-2 py-1 rounded bg-white/20 backdrop-blur-sm text-white border border-white/10">{cat}</span>
                          ))}
                        </div>
                        {project.role && <span className="text-[10px] uppercase tracking-widest text-gray-300 w-fit">{project.role}</span>}
                      </div>
                    </div>
                  </motion.a>
                ))}
              </AnimatePresence>
              {filteredProjects.length === 0 && (
                <div className="md:col-span-2 py-24 text-center text-[var(--theme-muted)] font-mono text-sm border border-dashed border-[var(--theme-border)] rounded-2xl">
                  No projects match the selected filters.
                </div>
              )}
            </div>

            {filteredProjects.length > workItemsPerPage && (
              <div className="flex justify-center -mt-6 pb-6">
                <button
                  onClick={() => { triggerSound(); setShowAllWork(!showAllWork); }}
                  className="px-6 py-3 border border-[var(--theme-border)] rounded-full text-xs font-mono uppercase tracking-widest hover:border-[var(--theme-fg)] hover:text-[var(--theme-fg)] transition-colors cursor-pointer"
                >
                  {showAllWork ? labels.showLess : labels.loadMore}
                </button>
              </div>
            )}
          </section>

          {/* UPDATES SECTION */}
          <section id="updates" className="scroll-mt-32 border-t border-[var(--theme-border)] pt-12">
            <h2 className="text-sm font-mono uppercase tracking-widest text-[var(--theme-muted)] mb-8">{labels.updatesSectionHeading}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(showAllUpdates ? updates : updates.slice(0, updatesItemsPerPage)).map((update) => (
                <div
                  key={update.id}
                  onClick={() => { triggerSound(); setSelectedUpdate(update); }}
                  className="p-4 md:p-6 border border-[var(--theme-border)] rounded-2xl bg-[var(--theme-bg)] flex flex-col sm:flex-row gap-6 transition-colors items-start sm:items-center group hover:border-[var(--theme-muted)] cursor-pointer"
                >
                  <div className="aspect-video w-full sm:w-48 sm:aspect-[4/3] rounded-xl overflow-hidden shrink-0 border border-[var(--theme-border)]">
                    <img
                      src={update.image || ''}
                      className={cn("w-full h-full object-cover group-hover:scale-105 transition-transform duration-500", colorMode === 'monochrome' ? "grayscale" : "")}
                      alt={update.title}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-mono uppercase tracking-widest text-[var(--theme-muted)]">{update.date}</span>
                    <h4 className="font-medium text-lg">{update.title}</h4>
                    <p className="text-[18px] text-[var(--theme-muted)] leading-relaxed">{update.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {updates.length > updatesItemsPerPage && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => { triggerSound(); setShowAllUpdates(!showAllUpdates); }}
                  className="px-6 py-3 border border-[var(--theme-border)] rounded-full text-xs font-mono uppercase tracking-widest hover:border-[var(--theme-fg)] hover:text-[var(--theme-fg)] transition-colors cursor-pointer"
                >
                  {showAllUpdates ? labels.showLess : labels.loadMore}
                </button>
              </div>
            )}
          </section>

          {/* INFO SECTION */}
          <section id="info" className="scroll-mt-32 border-t border-[var(--theme-border)] pt-12 pb-12 flex flex-col gap-16">
            <h2 className="text-sm font-mono uppercase tracking-widest text-[var(--theme-muted)]">{labels.infoSectionHeading}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <img
                src={about.imageUrl || 'https://picsum.photos/seed/tomiabe/800/1000?grayscale'}
                alt={about.name}
                className={cn("w-full aspect-[4/5] object-cover rounded-2xl border border-[var(--theme-border)]", colorMode === 'monochrome' ? "grayscale" : "")}
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col gap-8">
                <h3 className="text-3xl font-medium tracking-tight">{about.name}</h3>
                <p className="text-sm font-mono uppercase tracking-wider text-[var(--theme-muted)]">{about.role}</p>
                <div className="text-base text-[var(--theme-muted)] leading-relaxed space-y-4">
                  {about.about.map((p, i) => (
                    <p key={i} dangerouslySetInnerHTML={{ __html: p }} className={i === 0 ? "text-xl font-semibold text-[var(--theme-fg)]" : ""} />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-8 mt-8">
              <h3 className="text-xl font-medium tracking-tight border-b border-[var(--theme-border)] pb-4">{labels.operatingModelHeading}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {about.operatingModels.map((model, i) => (
                  <div key={i} className="p-6 border border-[var(--theme-border)] rounded-2xl bg-[var(--theme-bg)] flex flex-col gap-3 hover:border-[var(--theme-muted)] transition-colors cursor-pointer">
                    <h4 className="font-medium text-sm">{model.title}</h4>
                    <p className="text-sm text-[var(--theme-muted)] leading-relaxed">{model.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-8 mt-8">
              <h3 className="text-xl font-medium tracking-tight border-b border-[var(--theme-border)] pb-4">{labels.focusAreasHeading}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {about.focusAreas.map((area, i) => {
                  const Icon = focusIcons[i % focusIcons.length];
                  return (
                    <div key={i} className="p-6 border border-[var(--theme-border)] rounded-2xl bg-[var(--theme-bg)] flex flex-col gap-4 hover:border-[var(--theme-muted)] transition-colors cursor-pointer">
                      <Icon className="w-6 h-6 text-[var(--theme-muted)]" strokeWidth={1.5} />
                      <div className="flex flex-col gap-2">
                        <h4 className="font-medium text-base">{area.title}</h4>
                        <p className="text-sm text-[var(--theme-muted)] leading-relaxed">{area.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-8 mt-8">
              <h3 className="text-xl font-medium tracking-tight border-b border-[var(--theme-border)] pb-4">{labels.speakingHeading}</h3>
              <div className="flex flex-col gap-6">
                <p className="max-w-3xl text-sm md:text-base leading-relaxed text-[var(--theme-muted)]">{about.speaking.description}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                {about.speaking.engagements.map((eng, i) => (
                  <div key={i} className="p-6 border border-[var(--theme-border)] rounded-2xl bg-[var(--theme-bg)] flex flex-col gap-3 hover:border-[var(--theme-muted)] transition-colors">
                    <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-[var(--theme-muted)]">
                      <span>{eng.year}</span>
                      <span className="w-1 h-1 rounded-full bg-[var(--theme-border)]" />
                      <span>{eng.role}</span>
                    </div>
                    <h4 className="font-medium">{eng.title}</h4>
                    <p className="text-sm text-[var(--theme-muted)] leading-relaxed">{eng.description}</p>
                    {eng.link && (
                      <a
                        href={eng.link}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => { e.stopPropagation(); triggerSound(); }}
                        className="mt-2 w-fit flex items-center px-4 py-2 border border-[var(--theme-fg)] rounded-full hover:bg-[var(--theme-fg)] hover:text-[var(--theme-bg)] transition-colors text-[10px] font-mono uppercase tracking-widest font-medium cursor-pointer"
                      >
                        {labels.engagementCtaLabel} <ArrowUpRight className="ml-1 w-3 h-3"/>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CONTACT SECTION */}
          <section id="contact" className="scroll-mt-32 border-t border-[var(--theme-border)] py-24 flex flex-col gap-10 text-left items-start justify-start">
            <h2 className="text-5xl md:text-7xl font-medium tracking-tight leading-[1.05]">{contact.headline || "Let's create something coherent."}</h2>
            <p className="text-[var(--theme-muted)] max-w-md md:text-lg">{contact.description || "For project inquiries, collaborations, or speaking engagements."}</p>

            <button
              onClick={handleCopyEmail}
              className="mt-2 flex items-center justify-center gap-3 px-8 py-4 bg-[var(--theme-fg)] text-[var(--theme-bg)] rounded-full hover:scale-105 active:scale-95 transition-transform group font-medium text-lg cursor-pointer"
            >
              {contact.email}
              {copied ? <Check className="w-5 h-5"/> : <Copy className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity"/>}
            </button>
          </section>

        </div>

        {/* Right Column / Sticky Sidebar */}
        <aside className={cn(
          "hidden md:flex flex-col col-span-3",
          sidebarPosition === 'right' ? "order-2 pl-8 lg:pl-10 border-l" : "order-1 pr-8 lg:pr-10 border-r",
          "border-[var(--theme-border)]"
        )}>
          <div className="sticky top-32 flex flex-col gap-10">

            <div className="flex flex-col gap-2 pb-6 border-b border-[var(--theme-border)]">
              <LiveClock locale={clockSettings.locale} hour12={clockSettings.hour12} timezone={clockSettings.timezone} />
            </div>

            {/* Theme Toggle */}
            <div className="flex flex-col gap-6">
              <div className="text-xs font-mono uppercase tracking-widest text-[var(--theme-muted)] border-b border-[var(--theme-border)] pb-2">{labels.sidebarEnvironment}</div>
              <div className="grid grid-cols-2 gap-2">
                {(['morning', 'noon', 'evening', 'system'] as ThemeMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => { triggerSound(); setTheme(mode); }}
                    className={cn(
                      "flex items-center justify-center gap-2 px-3 py-3 border rounded-xl text-[10px] uppercase tracking-widest transition-colors cursor-pointer",
                      theme === mode ? "border-[var(--theme-fg)] text-[var(--theme-fg)]" : "border-[var(--theme-border)] text-[var(--theme-muted)] hover:border-[var(--theme-muted)]"
                    )}
                  >
                    {mode === 'morning' && <Sunrise className="w-4 h-4"/>}
                    {mode === 'noon' && <Sun className="w-4 h-4"/>}
                    {mode === 'evening' && <Moon className="w-4 h-4"/>}
                    {mode === 'system' && <span className="font-mono text-lg leading-none">⚙</span>}
                    <span className="hidden xl:inline">{mode}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Visuals Toggle */}
            <div className="flex flex-col gap-4 mt-4">
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[var(--theme-muted)] border-b border-[var(--theme-border)] pb-2">
                <span>{labels.sidebarVisuals}</span>
                <button onClick={() => { triggerSound(); setColorMode(colorMode === 'color' ? 'monochrome' : 'color'); }} className="flex items-center gap-1 hover:text-[var(--theme-fg)] transition-colors cursor-pointer">
                  {colorMode === 'color' ? 'REAL COLORS' : 'B&W'}
                </button>
              </div>
            </div>

            {/* Layout Toggle */}
            <div className="flex flex-col gap-4 mt-4">
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[var(--theme-muted)] border-b border-[var(--theme-border)] pb-2">
                <span>{labels.sidebarLayout}</span>
                <button onClick={() => { triggerSound(); setSidebarPosition(sidebarPosition === 'right' ? 'left' : 'right'); }} className="flex items-center gap-1 hover:text-[var(--theme-fg)] transition-colors cursor-pointer">
                  {sidebarPosition === 'right' ? 'DOCK LEFT' : 'DOCK RIGHT'}
                </button>
              </div>
            </div>

            {/* Sound Toggle */}
            <div className="flex flex-col gap-4 mt-4">
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[var(--theme-muted)] border-b border-[var(--theme-border)] pb-2">
                <span>{labels.sidebarAcoustics}</span>
                <button onClick={() => { triggerSound(); setSoundEnabled(!soundEnabled); }} className="flex items-center gap-1 hover:text-[var(--theme-fg)] transition-colors cursor-pointer">
                  {soundEnabled ? <Volume2 className="w-3 h-3"/> : <VolumeX className="w-3 h-3"/>}
                  {soundEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
              {soundEnabled && (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-3 gap-2">
                    {(['modern', 'mechanical', 'soft'] as const).map(profile => (
                      <button
                        key={profile}
                        onClick={() => { setSoundProfile(profile); setTimeout(() => playClickSound(profile, soundVolume), 10); }}
                        className={cn(
                          "py-2 px-1 border rounded-lg text-[10px] uppercase tracking-wider transition-colors cursor-pointer",
                          soundProfile === profile ? "border-[var(--theme-fg)] text-[var(--theme-fg)]" : "border-[var(--theme-border)] text-[var(--theme-muted)] hover:border-[var(--theme-muted)]"
                        )}
                      >
                        {profile}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-mono text-[var(--theme-muted)] uppercase tracking-widest select-none">Vol</span>
                    <input type="range" min="0" max="1" step="0.1" value={soundVolume}
                      onChange={(e) => { const val = parseFloat(e.target.value); setSoundVolume(val); setTimeout(() => playClickSound(soundProfile, val), 10); }}
                      className="w-full h-1 bg-[var(--theme-border)] rounded-full appearance-none cursor-pointer focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--theme-fg)]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Social Panel */}
            <div className="flex flex-col gap-4 mt-4">
              <div className="text-xs font-mono uppercase tracking-widest text-[var(--theme-muted)] border-b border-[var(--theme-border)] pb-2">{labels.sidebarNetwork}</div>
              <div className="grid grid-cols-2 gap-4 text-sm font-mono mt-2">
                {socialLinks.map((link, idx) => (
                  <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[var(--theme-muted)] transition-colors cursor-pointer w-fit text-[var(--theme-fg)]">
                    {link.name} <ArrowUpRight className="w-3 h-3 opacity-50" />
                  </a>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-[var(--theme-border)] flex flex-col gap-3 text-xs font-mono text-[var(--theme-muted)] uppercase tracking-widest">
              <p>© {new Date().getFullYear()} {contact.footerCopyright || 'TOMI ABE STUDIO'}</p>
              <p className="border-b border-[var(--theme-border)] pb-8">{contact.footerTagline || 'Objectivity · Clarity · Precision'}</p>
              <button onClick={scrollToTop} className="mt-2 text-xs font-mono uppercase tracking-widest flex items-center gap-2 hover:text-[var(--theme-fg)] transition-colors cursor-pointer w-fit">
                <ChevronUp className="w-4 h-4"/> {labels.backToTop}
              </button>
            </div>

          </div>
        </aside>
      </main>

      <div className="md:hidden flex justify-center py-6 border-t border-[var(--theme-border)]">
        <button onClick={scrollToTop} className="flex items-center gap-2 hover:text-[var(--theme-fg)] text-[var(--theme-muted)] text-xs font-mono uppercase tracking-widest transition-colors cursor-pointer">
          <ChevronUp className="w-4 h-4"/> {labels.backToTop}
        </button>
      </div>

      {/* Mobile Footer */}
      <footer className="md:hidden border-t border-[var(--theme-border)] py-8 px-6 text-center text-xs font-mono text-[var(--theme-muted)] uppercase tracking-widest flex flex-col gap-2">
        <p>© {new Date().getFullYear()} {contact.footerCopyright || 'TOMI ABE STUDIO'}</p>
        <p>{contact.footerTagline || 'Objectivity · Clarity · Precision'}</p>
      </footer>

      {/* Updates Drawer */}
      <AnimatePresence>
        {selectedUpdate && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { triggerSound(); setSelectedUpdate(null); }}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: '0%' }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full md:w-[720px] h-full z-[70] bg-[var(--theme-bg)] border-l border-[var(--theme-border)] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-4 border-b border-[var(--theme-border)] flex justify-between items-center shrink-0">
                <button onClick={handleCopyUpdateLink} className="px-4 py-2 border border-[var(--theme-border)] hover:bg-[var(--theme-fg)] hover:text-[var(--theme-bg)] transition-colors rounded-full cursor-pointer flex items-center gap-2 text-xs font-mono uppercase tracking-widest">
                  {copiedUpdate ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
                  <span className="hidden sm:inline">{copiedUpdate ? 'Copied' : 'Share'}</span>
                </button>
                <button onClick={() => { triggerSound(); setSelectedUpdate(null); }} className="p-2 border border-[var(--theme-border)] hover:bg-[var(--theme-fg)] hover:text-[var(--theme-bg)] transition-colors rounded-full cursor-pointer">
                  <X className="w-5 h-5"/>
                </button>
              </div>
              <div className="p-6 md:p-10 overflow-y-auto flex-1 pb-32">
                <div className="max-w-3xl mx-auto flex flex-col gap-6">
                  <img
                    src={selectedUpdate.image}
                    className={cn("w-full h-auto aspect-video object-cover rounded-xl border border-[var(--theme-border)]", colorMode === 'monochrome' ? "grayscale" : "")}
                    referrerPolicy="no-referrer"
                    alt={selectedUpdate.title}
                  />
                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-[var(--theme-muted)]">{selectedUpdate.date}</span>
                    <h2 className="text-3xl md:text-4xl font-medium tracking-tight mt-3">{selectedUpdate.title}</h2>
                    <p className="text-[18px] text-[var(--theme-muted)] leading-relaxed mt-4">{selectedUpdate.description}</p>
                  </div>
                  <div className="text-[16px] text-[var(--theme-muted)] leading-relaxed flex flex-col gap-4 border-t border-[var(--theme-border)] pt-6 mt-2">
                    {selectedUpdate.content?.map((p, i) => <p key={i}>{p}</p>)}
                  </div>
                  <div className="mt-16 pt-8 border-t border-[var(--theme-border)] flex items-center justify-between gap-6 pb-4">
                    <button onClick={() => { triggerSound(); setSelectedUpdate(null); }} className="flex items-center gap-2 hover:text-[var(--theme-fg)] text-[var(--theme-muted)] text-xs font-mono uppercase tracking-widest transition-colors cursor-pointer">
                      <X className="w-4 h-4"/> Close
                    </button>
                    <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-[var(--theme-muted)]">
                      {prevUpdate && (
                        <button onClick={() => { triggerSound(); setSelectedUpdate(prevUpdate); }} className="hover:text-[var(--theme-fg)] transition-colors cursor-pointer group flex items-center gap-1">
                          <ArrowDown className="w-3 h-3 rotate-90 opacity-0 group-hover:opacity-100 transition-opacity -ml-4" /> Prev
                        </button>
                      )}
                      {prevUpdate && nextUpdate && <span className="opacity-30">/</span>}
                      {nextUpdate && (
                        <button onClick={() => { triggerSound(); setSelectedUpdate(nextUpdate); }} className="hover:text-[var(--theme-fg)] transition-colors cursor-pointer group flex items-center gap-1">
                          Next <ArrowDown className="w-3 h-3 -rotate-90 opacity-0 group-hover:opacity-100 transition-opacity -mr-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Projects Drawer */}
      <AnimatePresence>
        {selectedProject && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { triggerSound(); setSelectedProject(null); }}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: '0%' }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full md:w-[720px] h-full z-[70] bg-[var(--theme-bg)] border-l border-[var(--theme-border)] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-4 border-b border-[var(--theme-border)] flex justify-between items-center shrink-0">
                <button onClick={handleCopyProjectLink} className="px-4 py-2 border border-[var(--theme-border)] hover:bg-[var(--theme-fg)] hover:text-[var(--theme-bg)] transition-colors rounded-full cursor-pointer flex items-center gap-2 text-xs font-mono uppercase tracking-widest">
                  {copiedProject ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
                  <span className="hidden sm:inline">{copiedProject ? 'Copied' : 'Share'}</span>
                </button>
                <div className="flex gap-2 items-center">
                  {selectedProject.link && (
                    <a href={selectedProject.link} target="_blank" rel="noreferrer" onClick={() => triggerSound()}
                      className="px-4 py-2 border border-[var(--theme-fg)] bg-[var(--theme-fg)] text-[var(--theme-bg)] hover:scale-105 active:scale-95 transition-transform rounded-full cursor-pointer flex items-center gap-2 text-xs font-mono uppercase tracking-widest"
                    >
                      Visit <ArrowUpRight className="w-4 h-4"/>
                    </a>
                  )}
                  <button onClick={() => { triggerSound(); setSelectedProject(null); }} className="p-2 border border-[var(--theme-border)] hover:bg-[var(--theme-fg)] hover:text-[var(--theme-bg)] transition-colors rounded-full cursor-pointer">
                    <X className="w-5 h-5"/>
                  </button>
                </div>
              </div>

              <div className="p-6 md:p-10 overflow-y-auto flex-1 pb-32">
                <div className="max-w-3xl mx-auto flex flex-col gap-8">
                  <img
                    src={selectedProject.image}
                    className={cn("w-full h-auto aspect-[4/3] object-cover rounded-xl border border-[var(--theme-border)]", colorMode === 'monochrome' ? "grayscale" : "")}
                    referrerPolicy="no-referrer"
                    alt={selectedProject.title}
                  />

                  <div className="flex flex-col gap-6">
                    <h2 className="text-[36px] font-medium tracking-tight leading-none">{selectedProject.title}</h2>
                    <p className="text-[18px] text-[var(--theme-muted)] leading-relaxed mt-2">{selectedProject.description}</p>
                  </div>

                  <div className="w-full mt-4 border-t border-b border-[var(--theme-border)] py-6 flex flex-col gap-6">
                    {selectedProject.role && (
                      <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6 text-sm font-mono uppercase tracking-widest">
                        <span className="text-[var(--theme-muted)] w-32 shrink-0 sm:pt-1.5">Role</span>
                        <span className="text-[var(--theme-fg)] font-medium sm:pt-1.5">{selectedProject.role}</span>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6 text-sm font-mono uppercase tracking-widest">
                      <span className="text-[var(--theme-muted)] w-32 shrink-0 sm:pt-1.5">Disciplines</span>
                      <div className="flex flex-wrap items-center gap-3 text-[var(--theme-fg)]">
                        {selectedProject.categories.map((c, i) => (
                          <span key={i} className="border border-[var(--theme-border)] px-4 py-1.5 rounded-full text-[10px] sm:text-xs tracking-widest uppercase">{c}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Case Study Panels */}
                  <div className="flex flex-col gap-16 mt-8">
                    {selectedProject.details?.map((detail, idx) => (
                      <div key={idx} className="flex flex-col gap-6">
                        <h3 className="text-2xl md:text-3xl font-medium tracking-tight">{detail.heading}</h3>
                        <p className="text-[16px] text-[var(--theme-muted)] leading-relaxed">{detail.text}</p>
                        <img
                          src={detail.image}
                          alt={detail.heading}
                          className={cn("w-full h-auto aspect-video object-cover rounded-xl border border-[var(--theme-border)] mt-2", colorMode === 'monochrome' ? "grayscale" : "")}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => { triggerSound(); if (selectedProject.link) window.open(selectedProject.link, '_blank'); else { setSelectedProject(null); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); } }}
                    className="w-fit px-8 py-4 bg-[var(--theme-fg)] text-[var(--theme-bg)] rounded-full text-xs font-mono uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform flex items-center gap-3 cursor-pointer mt-10"
                  >
                    {selectedProject.link ? <>{labels.visitProject} <ArrowUpRight className="w-4 h-4"/></> : <>{labels.discussProject} <ArrowUpRight className="w-4 h-4"/></>}
                  </button>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-[var(--theme-border)] pb-8 mt-10">
                    <button onClick={() => { triggerSound(); setSelectedProject(null); }} className="flex items-center gap-2 hover:text-[var(--theme-fg)] text-[var(--theme-muted)] text-xs font-mono uppercase tracking-widest transition-colors cursor-pointer">
                      <X className="w-4 h-4"/> Close
                    </button>
                    <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-[var(--theme-muted)]">
                      {prevProject && (
                        <button onClick={() => { triggerSound(); setSelectedProject(prevProject); }} className="hover:text-[var(--theme-fg)] transition-colors cursor-pointer group flex items-center gap-1">
                          <ArrowDown className="w-3 h-3 rotate-90 opacity-0 group-hover:opacity-100 transition-opacity -ml-4" /> Prev Post
                        </button>
                      )}
                      {prevProject && nextProject && <span className="opacity-30">/</span>}
                      {nextProject && (
                        <button onClick={() => { triggerSound(); setSelectedProject(nextProject); }} className="hover:text-[var(--theme-fg)] transition-colors cursor-pointer group flex items-center gap-1">
                          Next Post <ArrowDown className="w-3 h-3 -rotate-90 opacity-0 group-hover:opacity-100 transition-opacity -mr-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
