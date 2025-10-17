import React, { useMemo } from 'react';
import { View } from 'react-native';
import { makeStyles } from '../styles/ReviewScreen.styles';
import { useTheme } from '../styles/ThemeContext';
import Typography from '../components/Typography';

export default function ReviewScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={styles.container}>
      <Typography variant="h2">Reviews</Typography>
      <Typography variant="body" muted>Her kan du senere læse andres erfaringer.</Typography>
    </View>
  );
}

// styles genereres dynamisk via makeStyles(theme)
