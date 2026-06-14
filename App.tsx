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
type GridVariant = 'b' | 'off';
type GridScope = 'hero' | 'contact';
const GRID_LABELS: Record<GridVariant, string> = { b: 'Spotlight', off: 'Off' };

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
  useDrawer?: boolean;
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
  link?: string;
  directLink?: boolean;
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
  ctaLabel?: string;
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
  heroCta2?: string;
  heroCta2Url?: string;
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
  engagementCtaLabel?: string;
}

interface SiteSettings {
  themeColors: ThemeColors;
  workFilters?: { name: string }[] | string[];
  workCardOverlay?: {
    baseOpacity?: number;
    hoverOpacity?: number;
  };
  typography: {
    bodyFontUrl?: string;
    bodyFontFamily?: string;
    monoFontFamily?: string;
    // Desktop sizes
    navLogoPx?: number;
    navLinkPx?: number;
    mobileMenuItemPx?: number;
    heroTitlePx?: number;
    heroDescriptionPx?: number;
    heroCtaPx?: number;
    sectionHeadingPx?: number;
    workCardTitlePx?: number;
    workCardExcerptPx?: number;
    updatesCardDatePx?: number;
    updatesCardTitlePx?: number;
    updatesCardExcerptPx?: number;
    updatesDrawerDatePx?: number;
    updatesDrawerTitlePx?: number;
    updatesDrawerExcerptPx?: number;
    updatesDrawerBodyPx?: number;
    infoNamePx?: number;
    infoRolePx?: number;
    infoLeadPx?: number;
    infoBioPx?: number;
    contactTitlePx?: number;
    contactDescriptionPx?: number;
    contactButtonPx?: number;
    footerPx?: number;
    // Mobile overrides (≤767px)
    navLogoMobilePx?: number;
    mobileMenuItemMobilePx?: number;
    heroTitleMobilePx?: number;
    heroDescriptionMobilePx?: number;
    heroCtaMobilePx?: number;
    sectionHeadingMobilePx?: number;
    workCardTitleMobilePx?: number;
    workCardExcerptMobilePx?: number;
    updatesCardDateMobilePx?: number;
    updatesCardTitleMobilePx?: number;
    updatesCardExcerptMobilePx?: number;
    updatesDrawerDateMobilePx?: number;
    updatesDrawerTitleMobilePx?: number;
    updatesDrawerExcerptMobilePx?: number;
    updatesDrawerBodyMobilePx?: number;
    infoNameMobilePx?: number;
    infoRoleMobilePx?: number;
    infoLeadMobilePx?: number;
    infoBioMobilePx?: number;
    contactTitleMobilePx?: number;
    contactDescriptionMobilePx?: number;
    contactButtonMobilePx?: number;
    footerMobilePx?: number;
    // Tablet overrides (768px–1023px)
    heroTitleTabletPx?: number;
    heroDescriptionTabletPx?: number;
    contactTitleTabletPx?: number;
    contactDescriptionTabletPx?: number;
    updatesDrawerTitleTabletPx?: number;
    workCardTitleTabletPx?: number;
  };
  layout: {
    workItemsPerPage: number;
    updatesItemsPerPage: number;
    siteMaxWidth?: number;
    infoImageRatio?: number;
    infoDetailsRatio?: number;
  };
  clock: {
    locale: string;
    hour12: boolean;
    timezone: string;
  };
  uiLabels: UILabels;
  visibility?: {
    hero?: boolean;
    work?: boolean;
    updates?: boolean;
    info?: boolean;
    operatingModel?: boolean;
    focusAreas?: boolean;
    speaking?: boolean;
    contact?: boolean;
  };
  gridSettings?: {
    variant: GridVariant;
    enabled: boolean;
    scope: GridScope;
  };
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

function RichPanelText({ content }: { content?: string }) {
  if (!content) return null;
  const looksLikeHtml = /<([a-z][\w-]*)(\s[^>]*)?>/i.test(content);

  if (!looksLikeHtml) {
    return <p className="text-[16px] text-[var(--theme-muted)] leading-relaxed">{content}</p>;
  }

  return (
    <div
      className="text-[16px] text-[var(--theme-muted)] leading-relaxed flex flex-col gap-3 [&_a]:underline [&_a]:underline-offset-2 [&_a]:text-[var(--theme-fg)] [&_a:hover]:opacity-80 [&_strong]:text-[var(--theme-fg)] [&_h1]:text-[28px] [&_h1]:text-[var(--theme-fg)] [&_h1]:font-medium [&_h2]:text-[24px] [&_h2]:text-[var(--theme-fg)] [&_h2]:font-medium [&_h3]:text-[20px] [&_h3]:text-[var(--theme-fg)] [&_h3]:font-medium [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1"
      dangerouslySetInnerHTML={{ __html: content }}
    />
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
  heroCta2: '',
  heroCta2Url: '',
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
  engagementCtaLabel: 'View Engagement',
};

const DEFAULT_SETTINGS: SiteSettings = {
  themeColors: DEFAULT_THEME_COLORS,
  workFilters: [{ name: 'Art' }, { name: 'Brand' }, { name: 'Content' }, { name: 'Data' }, { name: 'Product' }],
  workCardOverlay: { baseOpacity: 0.7, hoverOpacity: 0.8 },
  typography: {
    bodyFontUrl: '',
    bodyFontFamily: 'Geist',
    monoFontFamily: 'Geist Mono',
    // Desktop
    navLogoPx: 14,
    navLinkPx: 14,
    mobileMenuItemPx: 20,
    heroTitlePx: 50,
    heroDescriptionPx: 20,
    heroCtaPx: 16,
    sectionHeadingPx: 14,
    workCardTitlePx: 24,
    workCardExcerptPx: 16,
    updatesCardDatePx: 12,
    updatesCardTitlePx: 18,
    updatesCardExcerptPx: 14,
    updatesDrawerDatePx: 12,
    updatesDrawerTitlePx: 36,
    updatesDrawerExcerptPx: 18,
    updatesDrawerBodyPx: 16,
    infoNamePx: 30,
    infoRolePx: 14,
    infoLeadPx: 20,
    infoBioPx: 16,
    contactTitlePx: 50,
    contactDescriptionPx: 18,
    contactButtonPx: 18,
    footerPx: 12,
    // Mobile defaults (from reference design)
    navLogoMobilePx: 14,
    mobileMenuItemMobilePx: 20,
    heroTitleMobilePx: 36,
    heroDescriptionMobilePx: 18,
    heroCtaMobilePx: 16,
    sectionHeadingMobilePx: 14,
    workCardTitleMobilePx: 24,
    workCardExcerptMobilePx: 14,
    updatesCardDateMobilePx: 12,
    updatesCardTitleMobilePx: 18,
    updatesCardExcerptMobilePx: 14,
    updatesDrawerDateMobilePx: 12,
    updatesDrawerTitleMobilePx: 30,
    updatesDrawerExcerptMobilePx: 18,
    updatesDrawerBodyMobilePx: 16,
    infoNameMobilePx: 30,
    infoRoleMobilePx: 14,
    infoLeadMobilePx: 20,
    infoBioMobilePx: 16,
    contactTitleMobilePx: 48,
    contactDescriptionMobilePx: 16,
    contactButtonMobilePx: 16,
    footerMobilePx: 12,
    // Tablet defaults (768px–1023px)
    heroTitleTabletPx: 48,
    heroDescriptionTabletPx: 20,
    contactTitleTabletPx: 64,
    contactDescriptionTabletPx: 18,
    updatesDrawerTitleTabletPx: 36,
    workCardTitleTabletPx: 24,
  },
  layout: { workItemsPerPage: 6, updatesItemsPerPage: 6, siteMaxWidth: 1100, infoImageRatio: 6, infoDetailsRatio: 4 },
  clock: { locale: 'en-US', hour12: true, timezone: 'short' },
  uiLabels: DEFAULT_UI_LABELS,
  visibility: {
    hero: true,
    work: true,
    updates: true,
    info: true,
    operatingModel: true,
    focusAreas: true,
    speaking: true,
    contact: true,
  },
  gridSettings: {
    variant: 'b',
    enabled: true,
    scope: 'general',
  },
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

// ─── Grid Overlay ─────────────────────────────────────────────────────────────

function GridOverlay({ variant, mousePos: { x, y } }: { variant: GridVariant; mousePos: { x: number; y: number } }) {
  switch (variant) {
    case 'b':
      return (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: [
              'linear-gradient(rgba(128,128,128,0.07) 1px, transparent 1px)',
              'linear-gradient(90deg, rgba(128,128,128,0.07) 1px, transparent 1px)',
              `radial-gradient(circle 100px at ${x * 100}% ${y * 100}%, rgba(128,128,128,0.14) 0%, transparent 70%)`,
            ].join(','),
            backgroundSize: '40px 40px, 40px 40px, 100% 100%',
          }}
        />
      );
    default:
      return null;
  }
}

function GridSection({ variant, children, className, id }: { variant: GridVariant; children: React.ReactNode; className?: string; id?: string }) {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  return (
    <section
      id={id}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setMousePos({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
      }}
      className={className}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <GridOverlay variant={variant} mousePos={mousePos} />
      {children}
    </section>
  );
}

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
  const [gridVariant, setGridVariant] = useState<GridVariant>(DEFAULT_SETTINGS.gridSettings!.variant);
  const [showAllWork, setShowAllWork] = useState(false);
  const [showAllUpdates, setShowAllUpdates] = useState(false);
  const [colorMode, setColorMode] = useLocalStorage<'color' | 'monochrome'>('tomi_colorMode', 'color');
  const [sidebarPosition, setSidebarPosition] = useLocalStorage<'right' | 'left'>('tomi_sidebarPosition', 'right');
  const [selectedUpdate, setSelectedUpdate] = useState<Update | null>(null);
  const [copiedUpdate, setCopiedUpdate] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [copiedProject, setCopiedProject] = useState(false);
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    if (!settingsPanelOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSettingsPanelOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [settingsPanelOpen]);
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
        const rawCategories = unwrap(p.categories);
        const normalizedCategories = rawCategories
          .flatMap((cat: any) => (typeof cat === 'string' ? cat.split(',') : [cat]))
          .map((cat: any) => String(cat).trim())
          .filter(Boolean);
        return { ...p, categories: Array.from(new Set(normalizedCategories)) };
      });
      pd_list.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
      const visibleProjects = pd_list.filter((p: any) => p.visible !== false);

      const ud_list = Object.values(updatesMods).map((m: any) => {
        const u = m.default;
        return { ...u, content: unwrap(u.content) };
      });
      ud_list.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
      const visibleUpdates = ud_list.filter((u: any) => u.visible !== false);

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
        projects: visibleProjects,
        updates: visibleUpdates,
        uiSettings: {
          themeColors: sd.themeColors || DEFAULT_THEME_COLORS,
          workFilters: sd.workFilters || DEFAULT_SETTINGS.workFilters,
          workCardOverlay: sd.workCardOverlay || DEFAULT_SETTINGS.workCardOverlay,
          typography: sd.typography || DEFAULT_SETTINGS.typography,
          layout: sd.layout || DEFAULT_SETTINGS.layout,
          clock: sd.clock || DEFAULT_SETTINGS.clock,
          uiLabels: mergedLabels,
          visibility: { ...DEFAULT_SETTINGS.visibility, ...(sd.visibility || {}) },
          gridSettings: { ...DEFAULT_SETTINGS.gridSettings, ...(sd.gridSettings || {}) },
        },
      };

      setSiteData(merged);
      const cmsVariant = merged.uiSettings.gridSettings?.variant || 'a';
      setGridVariant(merged.uiSettings.gridSettings?.enabled ? cmsVariant : 'off');
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
      if (typo) {
        const el2 = document.getElementById('cms-font-vars');
        if (el2) el2.remove();
        const style2 = document.createElement('style');
        style2.id = 'cms-font-vars';
        // Helper: resolve a value with a fallback, formatted as px
        const px = (v: number | undefined, fallback: number) => `${v ?? fallback}px`;
        const clamp01 = (n: any, fallback: number) => {
          const x = typeof n === 'number' ? n : parseFloat(String(n));
          if (!Number.isFinite(x)) return fallback;
          return Math.min(1, Math.max(0, x));
        };
        const overlayBase = clamp01(merged.uiSettings.workCardOverlay?.baseOpacity, 0.7);
        const overlayHover = clamp01(merged.uiSettings.workCardOverlay?.hoverOpacity, 0.8);
        style2.textContent = `
          :root {
            ${typo.bodyFontFamily ? `--font-sans: "${typo.bodyFontFamily}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;` : ''}
            ${typo.monoFontFamily ? `--font-mono: "${typo.monoFontFamily}", ui-monospace, monospace;` : ''}
            --work-card-overlay: ${overlayBase};
            --work-card-overlay-hover: ${overlayHover};
            --typo-nav-logo: ${px(typo.navLogoPx, 14)};
            --typo-nav-link: ${px(typo.navLinkPx, 14)};
            --typo-mobile-menu: ${px(typo.mobileMenuItemPx, 20)};
            --typo-hero-title: ${px(typo.heroTitlePx, 64)};
            --typo-hero-desc: ${px(typo.heroDescriptionPx, 20)};
            --typo-hero-cta: ${px(typo.heroCtaPx, 16)};
            --typo-section-heading: ${px(typo.sectionHeadingPx, 14)};
            --typo-work-card-title: ${px(typo.workCardTitlePx, 24)};
            --typo-work-card-excerpt: ${px(typo.workCardExcerptPx, 16)};
            --typo-updates-card-date: ${px(typo.updatesCardDatePx, 12)};
            --typo-updates-card-title: ${px(typo.updatesCardTitlePx, 18)};
            --typo-updates-card-excerpt: ${px(typo.updatesCardExcerptPx, 14)};
            --typo-updates-drawer-date: ${px(typo.updatesDrawerDatePx, 12)};
            --typo-updates-drawer-title: ${px(typo.updatesDrawerTitlePx, 36)};
            --typo-updates-drawer-excerpt: ${px(typo.updatesDrawerExcerptPx, 18)};
            --typo-updates-drawer-body: ${px(typo.updatesDrawerBodyPx, 16)};
            --typo-info-name: ${px(typo.infoNamePx, 30)};
            --typo-info-role: ${px(typo.infoRolePx, 14)};
            --typo-info-lead: ${px(typo.infoLeadPx, 20)};
            --typo-info-bio: ${px(typo.infoBioPx, 16)};
            --typo-contact-title: ${px(typo.contactTitlePx, 64)};
            --typo-contact-desc: ${px(typo.contactDescriptionPx, 18)};
            --typo-contact-btn: ${px(typo.contactButtonPx, 18)};
            --typo-footer: ${px(typo.footerPx, 12)};
            --site-max-width: ${merged.uiSettings.layout?.siteMaxWidth ?? 1100}px;
          }
          @media (max-width: 767px) {
            :root {
              --typo-nav-logo: ${px(typo.navLogoMobilePx ?? typo.navLogoPx, 14)};
              --typo-mobile-menu: ${px(typo.mobileMenuItemMobilePx ?? typo.mobileMenuItemPx, 20)};
              --typo-hero-title: ${px(typo.heroTitleMobilePx, 36)};
              --typo-hero-desc: ${px(typo.heroDescriptionMobilePx, 18)};
              --typo-hero-cta: ${px(typo.heroCtaMobilePx ?? typo.heroCtaPx, 16)};
              --typo-section-heading: ${px(typo.sectionHeadingMobilePx ?? typo.sectionHeadingPx, 14)};
              --typo-work-card-title: ${px(typo.workCardTitleMobilePx ?? typo.workCardTitlePx, 24)};
              --typo-work-card-excerpt: ${px(typo.workCardExcerptMobilePx, 14)};
              --typo-updates-card-date: ${px(typo.updatesCardDateMobilePx ?? typo.updatesCardDatePx, 12)};
              --typo-updates-card-title: ${px(typo.updatesCardTitleMobilePx ?? typo.updatesCardTitlePx, 18)};
              --typo-updates-card-excerpt: ${px(typo.updatesCardExcerptMobilePx ?? typo.updatesCardExcerptPx, 14)};
              --typo-updates-drawer-date: ${px(typo.updatesDrawerDateMobilePx ?? typo.updatesDrawerDatePx, 12)};
              --typo-updates-drawer-title: ${px(typo.updatesDrawerTitleMobilePx, 30)};
              --typo-updates-drawer-excerpt: ${px(typo.updatesDrawerExcerptMobilePx ?? typo.updatesDrawerExcerptPx, 18)};
              --typo-updates-drawer-body: ${px(typo.updatesDrawerBodyMobilePx ?? typo.updatesDrawerBodyPx, 16)};
              --typo-info-name: ${px(typo.infoNameMobilePx ?? typo.infoNamePx, 30)};
              --typo-info-role: ${px(typo.infoRoleMobilePx ?? typo.infoRolePx, 14)};
              --typo-info-lead: ${px(typo.infoLeadMobilePx ?? typo.infoLeadPx, 20)};
              --typo-info-bio: ${px(typo.infoBioMobilePx ?? typo.infoBioPx, 16)};
              --typo-contact-title: ${px(typo.contactTitleMobilePx, 48)};
              --typo-contact-desc: ${px(typo.contactDescriptionMobilePx, 16)};
              --typo-contact-btn: ${px(typo.contactButtonMobilePx ?? typo.contactButtonPx, 16)};
              --typo-footer: ${px(typo.footerMobilePx ?? typo.footerPx, 12)};
            }
          }
          @media (min-width: 768px) and (max-width: 1023px) {
            :root {
              --typo-hero-title: ${px(typo.heroTitleTabletPx, 48)};
              --typo-hero-desc: ${px(typo.heroDescriptionTabletPx ?? typo.heroDescriptionPx, 20)};
              --typo-work-card-title: ${px(typo.workCardTitleTabletPx ?? typo.workCardTitlePx, 24)};
              --typo-updates-drawer-title: ${px(typo.updatesDrawerTitleTabletPx ?? typo.updatesDrawerTitlePx, 36)};
              --typo-contact-title: ${px(typo.contactTitleTabletPx, 64)};
              --typo-contact-desc: ${px(typo.contactDescriptionTabletPx ?? typo.contactDescriptionPx, 18)};
            }
          }
          .italic, i, em { font-style: normal !important; }
        `;
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
  const effectiveVariant = gridVariant;
  const typography = settings.typography ?? DEFAULT_SETTINGS.typography;
  const labels: UILabels = { ...DEFAULT_UI_LABELS, ...(settings.uiLabels ?? {}) };
  const layout = settings.layout ?? DEFAULT_SETTINGS.layout;
  const infoImageRatio = layout.infoImageRatio ?? 5;
  const infoDetailsRatio = layout.infoDetailsRatio ?? 5;
  const clockSettings = settings.clock ?? DEFAULT_SETTINGS.clock;
  const workItemsPerPage = layout.workItemsPerPage ?? 6;
  const vis = { ...DEFAULT_SETTINGS.visibility, ...(settings.visibility ?? {}) };
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
  const configuredFilters = (settings.workFilters || [])
    .map((item: any) => (typeof item === 'string' ? item : item?.name))
    .map((name: any) => String(name || '').trim())
    .filter(Boolean);
  const categoriesFromProjects = Array.from(new Set(projects.flatMap(p => p.categories)));
  const allCategories = Array.from(new Set([...configuredFilters, ...categoriesFromProjects]));

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, targetId: string) => {
    e.preventDefault();
    triggerSound();
    setMobileMenuOpen(false);
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => { triggerSound(); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const TopNav = () => (
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-[var(--theme-border)] bg-[var(--theme-bg)]/80 backdrop-blur-md">
      <div className="mx-auto w-full px-6 h-16 flex items-center justify-between" style={{ maxWidth: 'var(--site-max-width)' }}>
        <a href="#" className="font-mono tracking-tight font-medium uppercase" style={{ fontSize: 'var(--typo-nav-logo)' }} onClick={(e) => handleNavClick(e as any, 'hero')}>
          {navigation.logoText || metadata.siteTitle || 'TAS'}
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 text-sm uppercase tracking-wide font-medium">
          {navigation.items.map((item, i) => (
            <a key={i} href={item.url} style={{ fontSize: 'var(--typo-nav-link)' }} onClick={(e) => handleNavClick(e, item.url.replace('#', ''))} className="hover:text-[var(--theme-muted)] transition-colors cursor-pointer">
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
            className="fixed inset-0 z-40 bg-[var(--theme-bg)] pt-24 px-6 flex flex-col gap-6 uppercase tracking-wide md:hidden overflow-y-auto pb-12"
          >
            <div className="flex flex-col gap-6 font-medium">
              {navigation.items.map((item, i) => (
                <a key={i} href={item.url} style={{ fontSize: 'var(--typo-mobile-menu)' }} onClick={(e) => handleNavClick(e as any, item.url.replace('#', ''))} className="cursor-pointer">
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

      <main className="flex-1 w-full mx-auto px-6 py-12 md:py-24" style={{ maxWidth: 'var(--site-max-width)' }}>

        {/* Main Content */}
        <div className="flex flex-col gap-32">

          {/* HERO */}
          {vis.hero && <GridSection variant={effectiveVariant} id="hero" className="flex flex-col gap-8 pt-4 text-center items-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: 'var(--typo-hero-title)' }}
              className="text-4xl sm:text-5xl md:text-7xl font-sans tracking-tight leading-[1.05] font-medium max-w-4xl"
            >
              {hero.headline}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              style={{ fontSize: 'var(--typo-hero-desc)' }}
              className="text-lg md:text-xl text-[var(--theme-muted)] max-w-2xl md:max-w-3xl leading-relaxed mt-4"
            >
              {hero.description}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-4 flex flex-wrap items-center justify-center gap-3"
            >
              <button
                style={{ fontSize: 'var(--typo-hero-cta)' }}
                onClick={() => { triggerSound(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="flex items-center w-fit px-6 py-3 bg-[var(--theme-fg)] text-[var(--theme-bg)] rounded-full hover:scale-105 active:scale-95 transition-transform group font-medium cursor-pointer"
              >
                {labels.heroCta} <ArrowDown className="ml-2 w-5 h-5"/>
              </button>
              {labels.heroCta2 && labels.heroCta2Url && (
                <a
                  href={labels.heroCta2Url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => triggerSound()}
                  style={{ fontSize: 'var(--typo-hero-cta)' }}
                  className="flex items-center w-fit px-6 py-3 border border-[var(--theme-fg)] text-[var(--theme-fg)] rounded-full hover:scale-105 active:scale-95 transition-transform font-medium cursor-pointer"
                >
                  {labels.heroCta2} <ArrowUpRight className="ml-2 w-5 h-5"/>
                </a>
              )}
            </motion.div>
          </GridSection>}

          {/* UNIFIED WORK FEED */}
          {vis.work && <section id="work" className="scroll-mt-32">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-mono uppercase tracking-widest text-[var(--theme-muted)] border-b border-[var(--theme-border)] pb-2 flex-grow mr-4" style={{ fontSize: 'var(--typo-section-heading)' }}>{labels.workSectionHeading}</h2>
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
                    target={project.link && project.useDrawer !== true ? "_blank" : undefined}
                    rel={project.link && project.useDrawer !== true ? "noreferrer" : undefined}
                    onClick={e => {
                      triggerSound();
                      // Default behavior: go to the live link when present.
                      // Only open the drawer when explicitly enabled, or when there's no link.
                      const shouldUseDrawer = project.useDrawer === true || !project.link;
                      if (shouldUseDrawer) {
                        e.preventDefault();
                        setSelectedProject(project);
                      }
                    }}
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
                    <div className="absolute inset-0 bg-[rgba(0,0,0,var(--work-card-overlay))] transition-colors duration-500 group-hover:bg-[rgba(0,0,0,var(--work-card-overlay-hover))]" />
                    <div className="relative z-10 p-6 sm:p-8 flex flex-col gap-2 text-white mt-auto">
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                        <h3 className="text-2xl font-medium tracking-tight text-left" style={{ fontSize: 'var(--typo-work-card-title)' }}>
                          {project.title}
                        </h3>
                      </div>
                      <p className="text-gray-200 leading-snug text-sm sm:text-base max-w-2xl text-left" style={{ fontSize: 'var(--typo-work-card-excerpt)' }}>
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
          </section>}

          {/* UPDATES SECTION */}
          {vis.updates && <section id="updates" className="scroll-mt-32 border-t border-[var(--theme-border)] pt-12">
            <h2 className="text-sm font-mono uppercase tracking-widest text-[var(--theme-muted)] mb-8" style={{ fontSize: 'var(--typo-section-heading)' }}>{labels.updatesSectionHeading}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(showAllUpdates ? updates : updates.slice(0, updatesItemsPerPage)).map((update) => (
                <div
                  key={update.id}
                  onClick={() => {
                    triggerSound();
                    if (update.directLink && update.link) {
                      window.open(update.link, '_blank', 'noopener,noreferrer');
                      return;
                    }
                    setSelectedUpdate(update);
                  }}
                  className="p-4 md:p-6 border border-[var(--theme-border)] rounded-2xl bg-[var(--theme-bg)] flex flex-col xl:flex-row gap-4 xl:gap-6 transition-colors items-start xl:items-center group hover:border-[var(--theme-muted)] cursor-pointer"
                >
                  <div className="aspect-video w-full xl:w-44 xl:aspect-[4/3] rounded-xl overflow-hidden shrink-0 border border-[var(--theme-border)]">
                    <img
                      src={update.image || ''}
                      className={cn("w-full h-full object-cover group-hover:scale-105 transition-transform duration-500", colorMode === 'monochrome' ? "grayscale" : "")}
                      alt={update.title}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col gap-3 min-w-0">
                    <span className="font-mono uppercase tracking-widest text-[var(--theme-muted)] text-[12px]" style={{ fontSize: 'var(--typo-updates-card-date)' }}>{update.date}</span>
                    <h4 className="font-medium text-lg" style={{ fontSize: 'var(--typo-updates-card-title)' }}>{update.title}</h4>
                    <p className="text-[14px] text-[var(--theme-muted)] leading-relaxed" style={{ fontSize: 'var(--typo-updates-card-excerpt)' }}>{update.description}</p>
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
          </section>}

          {/* INFO SECTION */}
          {vis.info && <section id="info" className="scroll-mt-32 border-t border-[var(--theme-border)] pt-12 pb-12 flex flex-col gap-16">
            <h2 className="text-sm font-mono uppercase tracking-widest text-[var(--theme-muted)]" style={{ fontSize: 'var(--typo-section-heading)' }}>{labels.infoSectionHeading}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <img
                src={about.imageUrl || 'https://picsum.photos/seed/tomiabe/800/1000?grayscale'}
                alt={about.name}
                className={cn("w-full aspect-[4/5] object-cover rounded-2xl border border-[var(--theme-border)]", colorMode === 'monochrome' ? "grayscale" : "")}
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                  <h3 className="text-3xl font-medium tracking-tight" style={{ fontSize: 'var(--typo-info-name)' }}>{about.name}</h3>
                  <p className="text-sm font-mono uppercase tracking-wider text-[var(--theme-muted)]" style={{ fontSize: 'var(--typo-info-role)' }}>{about.role}</p>
                </div>
                <div className="flex flex-col gap-6 text-[var(--theme-muted)] leading-relaxed">
                  <p className="text-xl font-medium text-[var(--theme-fg)]" style={{ fontSize: 'var(--typo-info-lead)' }}>
                    {about.lead}
                  </p>
                  <div className="whitespace-pre-wrap text-base" style={{ fontSize: 'var(--typo-info-bio)' }}>
                    {about.bio}
                  </div>
                </div>
              </div>
            </div>

            {vis.operatingModel && <div className="flex flex-col gap-8 mt-8">
              <h3 className="text-xl font-medium tracking-tight border-b border-[var(--theme-border)] pb-4">{labels.operatingModelHeading}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {about.operatingModels.map((model, i) => (
                  <div key={i} className="p-6 border border-[var(--theme-border)] rounded-2xl bg-[var(--theme-bg)] flex flex-col gap-3 hover:border-[var(--theme-muted)] transition-colors cursor-pointer">
                    <h4 className="font-medium text-sm">{model.title}</h4>
                    <p className="text-sm text-[var(--theme-muted)] leading-relaxed">{model.description}</p>
                  </div>
                ))}
              </div>
            </div>}

            {vis.focusAreas && <div className="flex flex-col gap-8 mt-8">
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
            </div>}

            {vis.speaking && <div className="flex flex-col gap-8 mt-8">
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
                        {eng.ctaLabel || labels.engagementCtaLabel || 'View Engagement'} <ArrowUpRight className="ml-1 w-3 h-3"/>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>}
          </section>}

          {/* CONTACT SECTION */}
          {vis.contact && <GridSection variant={effectiveVariant} id="contact" className="scroll-mt-32 border-t border-[var(--theme-border)] py-24 flex flex-col gap-8 text-center items-center justify-center">
            <h2 className="text-5xl md:text-7xl font-medium tracking-tight leading-[1.05] max-w-4xl" style={{ fontSize: 'var(--typo-contact-title)' }}>{contact.headline || "Let's create something coherent."}</h2>
            <p className="text-[var(--theme-muted)] max-w-2xl md:max-w-3xl md:text-lg" style={{ fontSize: 'var(--typo-contact-desc)' }}>{contact.description || "For project inquiries, collaborations, or speaking engagements."}</p>

            <button
              onClick={handleCopyEmail}
              style={{ fontSize: 'var(--typo-contact-btn)' }}
              className="mt-2 flex items-center justify-center gap-3 px-8 py-4 bg-[var(--theme-fg)] text-[var(--theme-bg)] rounded-full hover:scale-105 active:scale-95 transition-transform group font-medium text-lg cursor-pointer"
            >
              {contact.email}
              {copied ? <Check className="w-5 h-5"/> : <Copy className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity"/>}
            </button>
          </GridSection>}

        </div>

        {/* Right Column / Sticky Sidebar — removed, replaced by floating settings panel */}
      </main>

      {/* Site Footer */}
      <footer className="w-full border-t border-[var(--theme-border)] mt-0">
        {/* Network */}
        <div className="mx-auto w-full px-6 pt-16 pb-6 flex flex-wrap justify-center gap-x-8 gap-y-3" style={{ maxWidth: 'var(--site-max-width)' }}>
          {socialLinks.map((link, idx) => (
            <a key={idx} href={link.url} target="_blank" rel="noreferrer"
              onClick={() => triggerSound()}
              className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-[var(--theme-muted)] hover:text-[var(--theme-fg)] transition-colors cursor-pointer">
              {link.name} <ArrowUpRight className="w-3 h-3 opacity-50" />
            </a>
          ))}
        </div>
        {/* Tagline + Copyright */}
        <div className="mx-auto w-full px-6 pb-16 flex flex-col items-center gap-2 text-center font-mono uppercase tracking-widest text-[var(--theme-muted)]" style={{ maxWidth: 'var(--site-max-width)', fontSize: 'var(--typo-footer)' }}>
          <p>{contact.footerTagline || 'Objectivity · Clarity · Precision'}</p>
          <p>© {new Date().getFullYear()} {contact.footerCopyright || 'TOMI ABE STUDIO'}</p>
        </div>
      </footer>

      {/* Floating: Back to Top */}
      <AnimatePresence>
        {scrolled && (
          <motion.button
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            onClick={scrollToTop}
            aria-label="Back to top"
            className="fixed bottom-6 right-6 z-40 w-10 h-10 flex items-center justify-center rounded-full border border-[var(--theme-border)] bg-[var(--theme-bg)]/80 backdrop-blur-md text-[var(--theme-muted)] hover:text-[var(--theme-fg)] hover:border-[var(--theme-fg)] transition-colors cursor-pointer shadow-sm"
          >
            <ChevronUp className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating: Settings button */}
      <button
        onClick={() => { triggerSound(); setSettingsPanelOpen(true); }}
        aria-label="Open settings"
        className="fixed bottom-[4.5rem] right-6 z-40 w-10 h-10 flex items-center justify-center rounded-full border border-[var(--theme-border)] bg-[var(--theme-bg)]/80 backdrop-blur-md text-[var(--theme-muted)] hover:text-[var(--theme-fg)] hover:border-[var(--theme-fg)] transition-colors cursor-pointer shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
          <circle cx="8" cy="6" r="2" fill="var(--theme-bg)"/><circle cx="16" cy="12" r="2" fill="var(--theme-bg)"/><circle cx="10" cy="18" r="2" fill="var(--theme-bg)"/>
        </svg>
      </button>

      {/* Settings Panel */}
      <AnimatePresence>
        {settingsPanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSettingsPanelOpen(false)}
              className="fixed inset-0 z-[55] bg-black/30 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: '0%' }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 w-80 h-full z-[60] bg-[var(--theme-bg)] border-l border-[var(--theme-border)] overflow-y-auto flex flex-col shadow-2xl"
            >
              {/* Panel header */}
              <div className="p-5 border-b border-[var(--theme-border)] flex items-center justify-between shrink-0">
                <LiveClock locale={clockSettings.locale} hour12={clockSettings.hour12} timezone={clockSettings.timezone} />
                <button onClick={() => setSettingsPanelOpen(false)} aria-label="Close settings"
                  className="p-1.5 border border-[var(--theme-border)] hover:bg-[var(--theme-fg)] hover:text-[var(--theme-bg)] rounded-full transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 flex flex-col gap-8">
                {/* Environment */}
                <div className="flex flex-col gap-4">
                  <div className="text-xs font-mono uppercase tracking-widest text-[var(--theme-muted)] border-b border-[var(--theme-border)] pb-2">{labels.sidebarEnvironment}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {(['morning', 'noon', 'evening', 'system'] as ThemeMode[]).map(mode => (
                      <button key={mode} onClick={() => { triggerSound(); setTheme(mode); }}
                        className={cn(
                          "flex items-center justify-center gap-2 px-3 py-3 border rounded-xl text-[10px] uppercase tracking-widest transition-colors cursor-pointer",
                          theme === mode ? "border-[var(--theme-fg)] text-[var(--theme-fg)]" : "border-[var(--theme-border)] text-[var(--theme-muted)] hover:border-[var(--theme-muted)]"
                        )}>
                        {mode === 'morning' && <Sunrise className="w-4 h-4"/>}
                        {mode === 'noon' && <Sun className="w-4 h-4"/>}
                        {mode === 'evening' && <Moon className="w-4 h-4"/>}
                        {mode === 'system' && <span className="font-mono text-lg leading-none">⚙</span>}
                        <span>{mode}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visuals */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[var(--theme-muted)] border-b border-[var(--theme-border)] pb-2">
                    <span>{labels.sidebarVisuals}</span>
                    <button onClick={() => { triggerSound(); setColorMode(colorMode === 'color' ? 'monochrome' : 'color'); }}
                      className="flex items-center gap-1 hover:text-[var(--theme-fg)] transition-colors cursor-pointer">
                      {colorMode === 'color' ? 'REAL COLORS' : 'B&W'}
                    </button>
                  </div>
                </div>

                {/* Acoustics */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[var(--theme-muted)] border-b border-[var(--theme-border)] pb-2">
                    <span>{labels.sidebarAcoustics}</span>
                    <button onClick={() => { triggerSound(); setSoundEnabled(!soundEnabled); }}
                      className="flex items-center gap-1 hover:text-[var(--theme-fg)] transition-colors cursor-pointer">
                      {soundEnabled ? <Volume2 className="w-3 h-3"/> : <VolumeX className="w-3 h-3"/>}
                      {soundEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  {soundEnabled && (
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-3 gap-2">
                        {(['modern', 'mechanical', 'soft'] as const).map(profile => (
                          <button key={profile}
                            onClick={() => { setSoundProfile(profile); setTimeout(() => playClickSound(profile, soundVolume), 10); }}
                            className={cn(
                              "py-2 px-1 border rounded-lg text-[10px] uppercase tracking-wider transition-colors cursor-pointer",
                              soundProfile === profile ? "border-[var(--theme-fg)] text-[var(--theme-fg)]" : "border-[var(--theme-border)] text-[var(--theme-muted)] hover:border-[var(--theme-muted)]"
                            )}>
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
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
                    <span className="font-mono uppercase tracking-widest text-[var(--theme-muted)] text-[12px]" style={{ fontSize: 'var(--typo-updates-drawer-date)' }}>{selectedUpdate.date}</span>
                    <h2 className="text-[36px] font-medium tracking-tight mt-3" style={{ fontSize: 'var(--typo-updates-drawer-title)' }}>{selectedUpdate.title}</h2>
                    <p className="text-[18px] text-[var(--theme-muted)] leading-relaxed mt-4" style={{ fontSize: 'var(--typo-updates-drawer-excerpt)' }}>{selectedUpdate.description}</p>
                  </div>
                  <div className="update-body text-[16px] text-[var(--theme-muted)] leading-relaxed flex flex-col gap-4 border-t border-[var(--theme-border)] pt-6 mt-2" style={{ fontSize: 'var(--typo-updates-drawer-body)' }}>
                    {selectedUpdate.content?.map((p, i) =>
                      /<[a-z][\w-]*(\s[^>]*)?>/.test(p)
                        ? <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
                        : <p key={i}>{p}</p>
                    )}
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
                        <RichPanelText content={detail.text} />
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

      {/* Grid Variant Toggle */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => {
            triggerSound();
            const order: GridVariant[] = ['b', 'off'];
            setGridVariant(order[(order.indexOf(gridVariant) + 1) % order.length]);
          }}
          className="px-4 py-2 border border-[var(--theme-border)] bg-[var(--theme-bg)]/80 backdrop-blur-md rounded-full text-[11px] font-mono uppercase tracking-widest text-[var(--theme-muted)] hover:text-[var(--theme-fg)] hover:border-[var(--theme-fg)] transition-colors cursor-pointer shadow-sm flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-fg)]" />
          Grid: {GRID_LABELS[gridVariant]}
        </button>
      </div>
    </div>
  );
}
