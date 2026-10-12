import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeId, User } from '../types';
import { api } from '../services/api';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  shortName: string;
  tagline: string;
  isDark: boolean;
  colors: {
    primary: string;
    primaryHover: string;
    primaryLight: string;
    primaryGradient: string;
    sidebarBg: string;
    sidebarText: string;
    sidebarActive: string;
    sidebarHover: string;
    accent: string;
    badgeBg: string;
    badgeText: string;
    ring: string;
    dotPreview: string[];
  };
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  'integrando-cyan': {
    id: 'integrando-cyan',
    name: 'Integrando Salud (Cian & Azul)',
    shortName: 'Integrando Cian',
    tagline: 'Estilo inspirado en la plataforma Integrando Salud con acentos celestes y azul naval',
    isDark: false,
    colors: {
      primary: '#0096c7',
      primaryHover: '#0077b6',
      primaryLight: '#e0f2fe',
      primaryGradient: 'from-cyan-600 to-sky-500',
      sidebarBg: 'bg-[#081e36]',
      sidebarText: 'text-slate-300',
      sidebarActive: 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-lg shadow-cyan-900/30 ring-1 ring-cyan-400/40',
      sidebarHover: 'hover:bg-[#0f2e52] hover:text-white',
      accent: 'text-cyan-600',
      badgeBg: 'bg-cyan-50 border-cyan-200',
      badgeText: 'text-cyan-800',
      ring: 'focus:ring-cyan-500',
      dotPreview: ['#0096c7', '#081e36', '#38bdf8'],
    },
  },
  'emerald-mint': {
    id: 'emerald-mint',
    name: 'Esmeralda Clínico (Verde Quirúrgico)',
    shortName: 'Esmeralda',
    tagline: 'Paleta clínica de verdes relajantes y menta ideal para consultorios médicos',
    isDark: false,
    colors: {
      primary: '#059669',
      primaryHover: '#047857',
      primaryLight: '#d1fae5',
      primaryGradient: 'from-emerald-600 to-teal-500',
      sidebarBg: 'bg-[#072419]',
      sidebarText: 'text-slate-300',
      sidebarActive: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-400/40',
      sidebarHover: 'hover:bg-[#0e3b2b] hover:text-white',
      accent: 'text-emerald-600',
      badgeBg: 'bg-emerald-50 border-emerald-200',
      badgeText: 'text-emerald-800',
      ring: 'focus:ring-emerald-500',
      dotPreview: ['#059669', '#072419', '#34d399'],
    },
  },
  'royal-navy': {
    id: 'royal-navy',
    name: 'Zafiro Hospitalario (Azul Marino)',
    shortName: 'Zafiro Real',
    tagline: 'Azul cobalto corporativo con acabado moderno y elegante para instituciones médicas',
    isDark: false,
    colors: {
      primary: '#2563eb',
      primaryHover: '#1d4ed8',
      primaryLight: '#dbeafe',
      primaryGradient: 'from-blue-600 to-indigo-600',
      sidebarBg: 'bg-[#0f172a]',
      sidebarText: 'text-slate-300',
      sidebarActive: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-950/40 ring-1 ring-blue-400/40',
      sidebarHover: 'hover:bg-slate-800 hover:text-white',
      accent: 'text-blue-600',
      badgeBg: 'bg-blue-50 border-blue-200',
      badgeText: 'text-blue-800',
      ring: 'focus:ring-blue-500',
      dotPreview: ['#2563eb', '#0f172a', '#60a5fa'],
    },
  },
  'dark-surgical': {
    id: 'dark-surgical',
    name: 'Modo Quirófano Noche (Alto Contraste)',
    shortName: 'Quirófano Noche',
    tagline: 'Fondo oscuro con acentos de alta visibilidad para turnos de guardia o noche',
    isDark: true,
    colors: {
      primary: '#0284c7',
      primaryHover: '#0369a1',
      primaryLight: '#1e293b',
      primaryGradient: 'from-sky-500 to-cyan-400',
      sidebarBg: 'bg-[#070b13]',
      sidebarText: 'text-slate-300',
      sidebarActive: 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-lg shadow-sky-950/60 ring-1 ring-cyan-300/40',
      sidebarHover: 'hover:bg-slate-800 hover:text-white',
      accent: 'text-sky-400',
      badgeBg: 'bg-slate-800 border-slate-700',
      badgeText: 'text-sky-300',
      ring: 'focus:ring-sky-400',
      dotPreview: ['#38bdf8', '#070b13', '#64748b'],
    },
  },
  'amethyst-health': {
    id: 'amethyst-health',
    name: 'Amatista Salud (Violeta Moderno)',
    shortName: 'Amatista',
    tagline: 'Elegancia moderna con tonos lavanda y púrpura suave para consultorios especializados',
    isDark: false,
    colors: {
      primary: '#7c3aed',
      primaryHover: '#6d28d9',
      primaryLight: '#ede9fe',
      primaryGradient: 'from-violet-600 to-purple-500',
      sidebarBg: 'bg-[#1e1333]',
      sidebarText: 'text-slate-300',
      sidebarActive: 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-950/40 ring-1 ring-purple-400/40',
      sidebarHover: 'hover:bg-[#2e1c4e] hover:text-white',
      accent: 'text-violet-600',
      badgeBg: 'bg-violet-50 border-violet-200',
      badgeText: 'text-violet-800',
      ring: 'focus:ring-violet-500',
      dotPreview: ['#7c3aed', '#1e1333', '#c084fc'],
    },
  },
};

interface ThemeContextType {
  theme: ThemeId;
  themeConfig: ThemeConfig;
  setTheme: (themeId: ThemeId) => Promise<void>;
  themes: ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode; userThemePreference?: string }> = ({
  children,
  userThemePreference,
}) => {
  const [theme, setCurrentTheme] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('medicore_theme') as ThemeId;
    if (saved && THEMES[saved]) return saved;
    if (userThemePreference && THEMES[userThemePreference as ThemeId]) {
      return userThemePreference as ThemeId;
    }
    return 'integrando-cyan';
  });

  useEffect(() => {
    if (userThemePreference && THEMES[userThemePreference as ThemeId] && userThemePreference !== theme) {
      setCurrentTheme(userThemePreference as ThemeId);
    }
  }, [userThemePreference]);

  useEffect(() => {
    // Apply dataset attribute to document body for global CSS selectors if needed
    document.documentElement.setAttribute('data-theme', theme);
    if (THEMES[theme].isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const setTheme = async (newTheme: ThemeId) => {
    if (!THEMES[newTheme]) return;
    setCurrentTheme(newTheme);
    await api.updateThemePreference(newTheme);
  };

  const currentConfig = THEMES[theme] || THEMES['integrando-cyan'];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeConfig: currentConfig,
        setTheme,
        themes: Object.values(THEMES),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
