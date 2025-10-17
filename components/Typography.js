import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../styles/ThemeContext';

const VARIANT_MAP = {
  h1: (t) => ({ fontSize: t.typography.h1, fontWeight: '600' }),
  h2: (t) => ({ fontSize: t.typography.h2, fontWeight: '600' }),
  h3: (t) => ({ fontSize: t.typography.h3, fontWeight: '600' }),
  body: (t) => ({ fontSize: t.typography.body }),
  small: (t) => ({ fontSize: t.typography.small }),
};

export default function Typography({ variant = 'body', color, style, children, weight, align, muted, ...rest }) {
  const { theme } = useTheme();
  const base = VARIANT_MAP[variant]?.(theme) || VARIANT_MAP.body(theme);
  const computed = {
    color: color || (muted ? theme.colors.textMuted : theme.colors.text),
    textAlign: align,
    fontWeight: weight || base.fontWeight || '400',
    ...base,
  };
  return (
    <Text style={[computed, style]} {...rest}>
      {children}
    </Text>
  );
}
