import { StyleSheet } from 'react-native';
import { colors, fonts, radii } from '../../styles/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  backgroundGlowLarge: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    opacity: 0.2,
    top: -60,
  },
  backgroundGlowSmall: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.accent,
    opacity: 0.16,
    bottom: -80,
    right: -40,
  },
  sparkle: {
    position: 'absolute',
  },
  sparkleHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  sparkleVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  cardWrap: {
    width: '100%',
    maxWidth: 420,
    position: 'relative',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    borderRadius: radii.xl,
    paddingVertical: 28,
    paddingHorizontal: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    zIndex: 1,
  },
  badgePill: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: radii.pill,
    marginBottom: 18,
  },
  badgePillText: {
    color: '#0A0A12',
    fontSize: 14,
    fontFamily: fonts.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heading: {
    fontSize: 32,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: fonts.regular,
  },
  statsSection: {
    width: '100%',
    borderRadius: radii.lg,
    paddingVertical: 20,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(87, 199, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(87, 199, 255, 0.4)',
  },
  offlineBanner: {
    width: '100%',
    marginTop: 16,
    borderRadius: radii.lg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(87, 199, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(87, 199, 255, 0.4)',
  },
  offlineBannerTitle: {
    color: '#CBEAFF',
    fontFamily: fonts.medium,
    letterSpacing: 0.4,
  },
  offlineBannerText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
    fontFamily: fonts.regular,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 0,
  },
  statPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 6,
    alignItems: 'center',
  },
  statPillLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  statPillValue: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    marginTop: 2,
  },
  multiplayerCard: {
    width: '100%',
    marginTop: 20,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  multiplayerTitle: {
    color: '#CBEAFF',
    fontSize: 16,
    fontFamily: fonts.medium,
    textAlign: 'center',
    marginBottom: 12,
  },
  scoreboardList: {
    rowGap: 12,
    marginBottom: 12,
  },
  scoreboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scoreboardRowSelf: {
    borderColor: 'rgba(87, 199, 255, 0.6)',
    backgroundColor: 'rgba(87, 199, 255, 0.16)',
  },
  scoreboardRank: {
    width: 26,
    color: colors.textSecondary,
    fontFamily: fonts.medium,
  },
  scoreboardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 12,
  },
  scoreboardAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  scoreboardAvatarText: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
  },
  scoreboardMeta: {
    flex: 1,
  },
  scoreboardName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: fonts.medium,
  },
  scoreboardTag: {
    color: '#9EDCFF',
    fontSize: 12,
    marginTop: 2,
    fontFamily: fonts.regular,
  },
  scoreboardScoreBox: {
    alignItems: 'flex-end',
  },
  scoreboardScore: {
    color: colors.accent,
    fontSize: 22,
    fontFamily: fonts.bold,
  },
  scoreboardScoreLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    fontFamily: fonts.regular,
  },
  multiplayerMeta: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    fontFamily: fonts.regular,
  },
  primaryButton: {
    marginTop: 28,
    width: '100%',
    paddingVertical: 16,
    borderRadius: radii.md,
    alignItems: 'center',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  primaryButtonText: {
    color: '#0A0A12',
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  primaryButtonContent: {
    alignItems: 'center',
    gap: 6,
  },
  primaryButtonMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  primaryButtonMetaText: {
    color: '#0A0A12',
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    marginTop: 14,
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  tertiaryButton: {
    marginTop: 16,
  },
  tertiaryButtonText: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  spotlight: {
    position: 'absolute',
    width: '70%',
    height: 120,
    top: 90,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 214, 117, 0.18)',
    transform: [{ rotate: '-5deg' }],
  },
});

export function getLargeGlowStyle(color) {
  return StyleSheet.compose(styles.backgroundGlowLarge, { backgroundColor: color });
}

export function getBadgePillStyle(color) {
  return StyleSheet.compose(styles.badgePill, { backgroundColor: color });
}

export function getPrimaryButtonStyle(color) {
  return StyleSheet.compose(styles.primaryButton, {
    backgroundColor: color,
    shadowColor: color,
  });
}

export function getSparkleContainerStyle({ size, top, left, opacity, rotate = '0deg' }) {
  return StyleSheet.compose(styles.sparkle, {
    top,
    left,
    width: size,
    height: size,
    opacity,
    transform: [{ rotate }],
  });
}

export function getSparkleHorizontalStyle({ centerOffset, height, color }) {
  return StyleSheet.compose(styles.sparkleHorizontal, {
    top: centerOffset,
    height,
    borderRadius: height / 2,
    backgroundColor: color,
  });
}

export function getSparkleVerticalStyle({ leftOffset, width, color }) {
  return StyleSheet.compose(styles.sparkleVertical, {
    left: leftOffset,
    width,
    borderRadius: width / 2,
    backgroundColor: color,
  });
}

export default styles;
