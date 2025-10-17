// Centraliseret tema konfiguration (single source)
export const lightColors = {
  mode: 'light',
  primary: '#0a7ea4',
  primaryMuted: '#0a7ea410',
  background: '#ffffff',
  surface: '#ffffff',
  surfaceAlt: '#f2f2f5',
  text: '#222222',
  textMuted: '#555555',
  border: '#e5e5e9',
  danger: '#d9534f',
};

export const darkColors = {
  mode: 'dark',
  primary: '#33b4d6',
  primaryMuted: '#33b4d620',
  background: '#0f1214',
  surface: '#161b1f',
  surfaceAlt: '#1f252a',
  text: '#f5f7f9',
  textMuted: '#99a2ab',
  border: '#2a3137',
  danger: '#ef6461',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const radius = {
  sm: 4,
  md: 6,
  lg: 8,
  pill: 999,
};

export const typography = {
  h1: 32,
  h2: 24,
  h3: 18,
  body: 15,
  small: 13,
};

export const getTheme = (mode = 'light') => ({
  colors: mode === 'dark' ? darkColors : lightColors,
  spacing,
  radius,
  typography,
});

export default getTheme;
