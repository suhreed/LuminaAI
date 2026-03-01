'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Theme } from '@/types';

const THEME_KEY = 'lumina-theme';

// Apply theme to document
function applyTheme(newTheme: Theme) {
  const root = document.documentElement;
  if (newTheme === 'light') {
    root.classList.add('light');
  } else {
    root.classList.remove('light');
  }
  // Update theme color meta tag
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) {
    themeColor.setAttribute('content', newTheme === 'dark' ? '#0a0a0a' : '#ffffff');
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null;
    if (stored && (stored === 'dark' || stored === 'light')) {
      setThemeState(stored);
      applyTheme(stored);
    } else {
      // Default to dark theme
      applyTheme('dark');
    }
    setMounted(true);
  }, []);

  // Set theme and persist to localStorage
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    applyTheme(newTheme);
  }, []);

  // Toggle between dark and light
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme, mounted };
}
