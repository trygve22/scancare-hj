import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import getTheme from './theme';

const ThemeContext = createContext({
  mode: 'light',
  theme: getTheme('light'),
  toggleTheme: () => {},
  setMode: () => {},
});

export const ThemeProvider = ({ children, initialMode }) => {
  const system = Appearance.getColorScheme?.() || 'light';
  const [mode, setMode] = useState(initialMode || system || 'light');

  const toggleTheme = useCallback(() => {
    setMode(m => (m === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo(() => ({
    mode,
    theme: getTheme(mode),
    toggleTheme,
    setMode,
  }), [mode, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
