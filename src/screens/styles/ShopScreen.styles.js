import { StyleSheet } from 'react-native';
import { colors, fonts, radii } from '../../styles/theme';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    rowGap: 24,
  },
  header: {
    rowGap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 30,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  message: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.md,
    backgroundColor: 'rgba(87, 199, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(87, 199, 255, 0.35)',
  },
  messageText: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 12,
    textAlign: 'center',
  },
  coinsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 214, 117, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 214, 117, 0.45)',
  },
  coinsEmoji: {
    fontSize: 16,
  },
  coinsText: {
    color: colors.highlight,
    fontFamily: fonts.bold,
    fontSize: 12,
    marginLeft: 6,
  },
  section: {
    rowGap: 12,
  },
  sectionHeader: {
    rowGap: 4,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  sectionSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: fonts.regular,
  },
  cardList: {
    rowGap: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  itemDescription: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  itemAction: {
    alignItems: 'flex-end',
    marginLeft: 12,
    minWidth: 110,
  },
  pricePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(87, 199, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(87, 199, 255, 0.4)',
    marginBottom: 8,
  },
  priceText: {
    color: colors.accent,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  buyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  buyButtonActive: {
    backgroundColor: colors.accent,
    borderColor: 'rgba(87, 199, 255, 0.7)',
  },
  buyButtonDisabled: {
    opacity: 0.6,
  },
  buyButtonText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  buyButtonTextActive: {
    color: '#0A0A12',
  },
  footerNote: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
});

export default styles;
