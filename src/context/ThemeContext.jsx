import { createContext, useState, useEffect, useContext, useCallback } from 'react';

const ThemeContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);

function darkenHex(hex, amount = 0.2) {
  const f = 1 - amount;
  const r = Math.max(0, Math.round(parseInt(hex.slice(1, 3), 16) * f));
  const g = Math.max(0, Math.round(parseInt(hex.slice(3, 5), 16) * f));
  const b = Math.max(0, Math.round(parseInt(hex.slice(5, 7), 16) * f));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function applyPrimaryColor(color, theme) {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', color);
  root.style.setProperty('--color-primary-dark', darkenHex(color, 0.2));
  root.style.setProperty('--color-primary-light', hexToRgba(color, theme === 'dark' ? 0.18 : 0.12));
}

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => localStorage.getItem('snapcook_theme') || 'light');
  const [primaryColor, setPrimaryColorState] = useState(() => localStorage.getItem('snapcook_accent') || '#C84B31');

  const setTheme = useCallback((t) => {
    setThemeState(t);
    localStorage.setItem('snapcook_theme', t);
  }, []);

  const setPrimaryColor = useCallback((color) => {
    setPrimaryColorState(color);
    localStorage.setItem('snapcook_accent', color);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    applyPrimaryColor(primaryColor, theme);
  }, [theme, primaryColor]);

  const value = { theme, setTheme, primaryColor, setPrimaryColor };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
