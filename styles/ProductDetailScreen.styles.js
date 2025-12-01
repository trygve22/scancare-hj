import { StyleSheet } from 'react-native';

export const makeStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
		paddingTop: 0,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
		paddingTop: theme.spacing.md,
		paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceAlt,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: theme.colors.text,
  },
  headerSpacer: {
    width: 40, // Same width as back button to center title
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.lg,
  },
  productIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  productImageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    width: '100%'
  },
  productImage: {
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceAlt,
    // width/height are set dynamically from component to preserve aspect ratio
  },
  iconText: {
    fontSize: 32,
  },
  productName: {
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
  },
  brandLogo: {
		height: 40,
		marginTop: 8,
		marginBottom: 8,
    resizeMode: 'contain',
  },
  categoryText: {
    textAlign: 'center',
    color: theme.colors.textMuted,
  },
  infoSection: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  infoTitle: {
    color: theme.colors.text,
  },
  infoText: {
    color: theme.colors.text,
    lineHeight: 20,
  },
  reviewsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingOverview: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
    gap: theme.spacing.lg,
  },
  ratingLeft: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  ratingRight: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  ratingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barBackground: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  prosConsSection: {
    flexDirection: 'row',
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  reviewItem: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
  },
  actionSection: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: theme.colors.text,
  },
});

export default makeStyles;
