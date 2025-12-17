import { StyleSheet } from 'react-native';

export const makeStyles = (theme) => StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'flex-start', 
    justifyContent: 'flex-start', 
    paddingHorizontal: theme.spacing.lg, 
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.background 
  },
});

export default makeStyles;
