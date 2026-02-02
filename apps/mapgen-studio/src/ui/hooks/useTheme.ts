import { useEffect, useMemo, useState } from 'react';
import type { Theme, ThemePreference } from '../types';

// ============================================================================
// Theme Preference Hook
// ============================================================================

export function useThemePreference() {
  const [preference, setPreference] = useState<ThemePreference>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme-preference');
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    }
    return 'system';
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) =>
    setSystemPrefersDark(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme-preference', preference);
  }, [preference]);

  const isLightMode = useMemo(() => {
    if (preference === 'system') return !systemPrefersDark;
    return preference === 'light';
  }, [preference, systemPrefersDark]);

  const cyclePreference = () => {
    setPreference((current) => {
      switch (current) {
        case 'system':
          return 'light';
        case 'light':
          return 'dark';
        case 'dark':
          return 'system';
        default:
          return 'system';
      }
    });
  };

  return { preference, setPreference, isLightMode, cyclePreference };
}

// ============================================================================
// Design Tokens
// ============================================================================

// Light mode palette
const light = {
  // Backgrounds
  bg: {
    page: '#f5f5f7',
    panel: '#ffffff',
    panelAlt: '#fafafa',
    nested: '#f5f5f7',
    deepNested: '#ffffff',
    hover: '#f0f0f2',
    active: '#e8e8ec'
  },
  // Borders
  border: {
    default: '#e5e5e5',
    subtle: '#ebebeb',
    strong: '#d4d4d4'
  },
  // Text
  text: {
    primary: '#1f2937',
    secondary: '#6b7280',
    muted: '#9ca3af',
    accent: '#4b5563'
  },
  // Interactive
  interactive: {
    primary: '#4b5563',
    primaryHover: '#374151',
    secondary: '#ffffff',
    secondaryHover: '#f5f5f7'
  }
};

// Dark mode palette
const dark = {
  // Backgrounds
  bg: {
    page: '#0a0a0f',
    panel: '#141418',
    panelAlt: '#111114',
    nested: '#0f0f12',
    deepNested: '#141418',
    hover: '#1a1a1f',
    active: '#222228'
  },
  // Borders
  border: {
    default: '#2a2a32',
    subtle: '#222228',
    strong: '#3a3a44'
  },
  // Text
  text: {
    primary: '#e8e8ed',
    secondary: '#8a8a96',
    muted: '#5a5a66',
    accent: '#a0a0b0'
  },
  // Interactive
  interactive: {
    primary: '#4b5563',
    primaryHover: '#5b6573',
    secondary: '#1a1a1f',
    secondaryHover: '#222228'
  }
};

// ============================================================================
// Theme Object Generator
// ============================================================================

export function createTheme(isLightMode: boolean): Theme {
  const p = isLightMode ? light : dark;

  return {
    // Containers
    container: `bg-[${p.bg.page}] text-[${p.text.primary}] border-[${p.border.default}]`,
    card: `bg-[${p.bg.panel}]/95 border-[${p.border.default}]`,
    nestedCard: `bg-[${p.bg.nested}] border-[${p.border.subtle}]`,
    deepNestedCard: `bg-[${p.bg.deepNested}] border-[${p.border.subtle}]`,

    // Text
    text: `text-[${p.text.primary}]`,
    textBright: `text-[${p.text.primary}]`,
    label: `text-[${p.text.secondary}]`,
    muted: `text-[${p.text.muted}]`,
    sectionTitle: `text-[${p.text.accent}]`,
    subtitle: `text-[${p.text.secondary}]`,

    // Interactive
    input: `bg-[${p.bg.panel}] text-[${p.text.primary}] border-[${p.border.default}]`,
    button: `bg-[${p.interactive.secondary}] text-[${p.text.primary}] border-[${p.border.default}] hover:bg-[${p.interactive.secondaryHover}]`,
    primaryButton: `bg-[${p.interactive.primary}] text-white border-[${p.interactive.primary}] hover:bg-[${p.interactive.primaryHover}]`,
    checkbox: isLightMode ? 'accent-gray-600' : 'accent-gray-500',
    hoverBg: `hover:bg-[${p.bg.hover}]`,

    // Tabs & Toggles
    tabActive: `bg-[${p.bg.panel}] border-[${p.border.strong}] text-[${p.text.primary}]`,
    tabInactive: `bg-transparent border-transparent text-[${p.text.secondary}] hover:text-[${p.text.primary}]`,
    toggleActive: `bg-[${p.interactive.primary}] text-white`,
    toggleInactive: `bg-[${p.bg.hover}] text-[${p.text.secondary}] hover:bg-[${p.bg.active}]`,

    // Misc
    divider: `border-[${p.border.subtle}]`,
    strategyBadge: isLightMode ?
    'bg-gray-100 text-gray-600' :
    'bg-[#222228] text-[#8a8a96]'
  };
}