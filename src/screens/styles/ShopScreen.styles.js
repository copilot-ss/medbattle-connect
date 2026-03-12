import { StyleSheet } from 'react-native';
import { colors, fonts, radii } from '../../styles/theme';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  energyFlashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 214, 117, 0.12)',
    zIndex: 3,
  },
  energyFlashIconWrap: {
    padding: 18,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 214, 117, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 214, 117, 0.45)',
  },
  scrollContent: {
    paddingHorizontal: 24,
    rowGap: 24,
  },
  stickyHeader: {
    backgroundColor: colors.background,
    rowGap: 12,
    paddingBottom: 12,
    zIndex: 2,
  },
  header: {
    rowGap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
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
    paddingHorizontal: 10,
    height: 44,
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
    fontSize: 13,
    marginLeft: 6,
  },
  energyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(165, 107, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(165, 107, 255, 0.55)',
    marginLeft: 10,
  },
  energyEmoji: {
    fontSize: 16,
  },
  energyText: {
    color: '#C9A8FF',
    fontFamily: fonts.bold,
    fontSize: 13,
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
  cardList: {
    flexDirection: 'row',
    columnGap: 12,
    paddingRight: 12,
  },
  itemWrap: {
    flexShrink: 0,
    alignItems: 'center',
  },
  itemCard: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    minHeight: 108,
    position: 'relative',
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    backfaceVisibility: 'hidden',
    rowGap: 6,
  },
  itemCardDaily: {
    minHeight: 102,
    paddingBottom: 9,
  },
  itemBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 30,
    height: 18,
    paddingHorizontal: 6,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentGreen,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.12)',
    zIndex: 1,
  },
  itemBadgeText: {
    color: '#0A0A12',
    fontFamily: fonts.bold,
    fontSize: 9,
    textAlign: 'center',
  },
  itemIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 0,
  },
  itemIconImage: {
    width: 22,
    height: 22,
  },
  coinStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinStackEmoji: {
    fontSize: 14,
  },
  coinStackEmojiOffset: {
    marginLeft: -4,
  },
  itemInfo: {
    width: '100%',
    alignItems: 'center',
    minHeight: 18,
  },
  itemTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 13,
    textAlign: 'center',
  },
  itemTitleSingleLine: {
    fontSize: 12,
  },
  itemTitleFreezeTime: {
    fontSize: 14,
  },
  itemAction: {
    alignItems: 'center',
    width: '100%',
    marginTop: 4,
  },
  priceText: {
    color: colors.highlight,
    fontFamily: fonts.bold,
    fontSize: 11,
    marginBottom: 4,
    textAlign: 'center',
  },
  buyButton: {
    width: '100%',
    height: 30,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
    borderRadius: radii.pill,
    backfaceVisibility: 'hidden',
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  buyButtonOutside: {
    marginTop: 6,
  },
  buyButtonDailyCompact: {
    height: 26,
    marginTop: 4,
  },
  buyButtonActive: {
    backgroundColor: colors.accent,
    borderColor: 'rgba(87, 199, 255, 0.7)',
  },
  buyButtonDailyActive: {
    backgroundColor: colors.success,
    borderColor: 'rgba(57, 229, 138, 0.75)',
  },
  buyButtonDisabled: {
    opacity: 0.6,
  },
  buyButtonText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 12,
    textAlign: 'center',
  },
  buyButtonTextActive: {
    color: '#0A0A12',
  },
});

export default styles;
