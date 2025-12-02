import { StyleSheet } from 'react-native';

export const makeStyles = (theme) => StyleSheet.create({
  container: { 
    flex: 1, 
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: theme.colors.background 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    textAlign: 'center',
    color: theme.colors.text,
  },
  sectionHeader: { fontSize: theme.typography.h3, fontWeight: '600', backgroundColor: theme.colors.surfaceAlt, paddingVertical: 6, paddingHorizontal: 10, borderRadius: theme.radius.md, marginTop: theme.spacing.lg, color: theme.colors.text },
  item: { paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.surface },
  itemText: { fontSize: theme.typography.body, color: theme.colors.text },
  selectedItem: { backgroundColor: theme.colors.primaryMuted },
	searchInput: { borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt, color: theme.colors.text, borderRadius: theme.radius.lg, paddingHorizontal: 12, paddingVertical: 10, marginTop: theme.spacing.md, marginBottom: theme.spacing.md, fontSize: theme.typography.body },
  
  // Selected product container - ny forbedret styling
  selectedContainer: {
    backgroundColor: theme.colors.surface || theme.colors.background,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  selectedTextContainer: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  selectedProductName: {
    color: theme.colors.text,
    fontWeight: '600',
    fontSize: theme.typography.body,
  },
  selectedCategoryText: {
    marginTop: 2,
    fontSize: theme.typography.small,
  },
  detailButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: theme.radius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  detailButtonText: {
    color: '#fff',
    marginRight: theme.spacing.xs,
    fontSize: theme.typography.body,
  },
  
  // Product item improvements
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandLogo: {
    width: 48,
    height: 24,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productActions: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  tapHint: {
    fontSize: theme.typography.small - 1,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  categoryText: {
    marginTop: 2,
    fontSize: theme.typography.small - 1
  },
  emptyText: { textAlign: 'center', color: theme.colors.textMuted, marginTop: theme.spacing.xl },
});

export default makeStyles;
