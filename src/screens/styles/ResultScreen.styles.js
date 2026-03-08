import { StyleSheet } from 'react-native';
import { colors, fonts, radii } from '../../styles/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
  },
  scrollContent: {
    width: '100%',
    alignItems: 'stretch',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 56,
    rowGap: 24,
    flexGrow: 1,
  },
  backgroundGlowLarge: {
    display: 'none',
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    opacity: 0.2,
    top: -60,
  },
  backgroundGlowSmall: {
    display: 'none',
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
    display: 'none',
    position: 'absolute',
  },
  sparkleHorizontal: {
    display: 'none',
    position: 'absolute',
    left: 0,
    right: 0,
  },
  sparkleVertical: {
    display: 'none',
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  cardWrap: {
    maxWidth: 420,
    position: 'relative',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  card: {
    width: '100%',
    borderRadius: radii.xl,
    paddingVertical: 28,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    borderWidth: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  heading: {
    fontSize: 22,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: fonts.regular,
  },
  subtitleCompact: {
    marginBottom: 10,
  },
  feedbackLine: {
    fontSize: 15,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: fonts.medium,
  },
  feedbackLineLow: {
    color: colors.accentWarm,
  },
  feedbackLineHigh: {
    color: colors.accentGreen,
  },
  anatomyAnimationWrap: {
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  anatomyAnimation: {
    width: 120,
    height: 120,
  },
  scoreSummary: {
    width: '100%',
    alignItems: 'center',
    marginTop: 6,
    rowGap: 12,
  },
  trophyWrap: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  scoreLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.medium,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 12,
  },
  scoreValueWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    color: colors.textPrimary,
    fontSize: 34,
    fontFamily: fonts.bold,
  },
  scorePoints: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(87, 199, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(87, 199, 255, 0.4)',
  },
  scorePointsIcon: {
    marginRight: 6,
  },
  scorePointsText: {
    color: colors.accent,
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  scoreKiwi: {
    width: 26,
    height: 26,
  },
  scoreKiwiWrap: {
    position: 'absolute',
    top: -12,
    right: -26,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(87, 199, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(87, 199, 255, 0.4)',
  },
  scoreTopAnimationWrap: {
    width: '100%',
    alignSelf: 'stretch',
    alignItems: 'center',
    marginHorizontal: -24,
    marginBottom: 12,
  },
  scoreTopAnimation: {
    width: '100%',
    height: 96,
  },
  perfectTopAnimationWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    overflow: 'hidden',
    zIndex: 0,
  },
  perfectTopAnimation: {
    width: '100%',
    height: '100%',
  },
  zeroTopAnimationWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 0,
    overflow: 'hidden',
  },
  zeroGhostOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 6,
    overflow: 'hidden',
  },
  zeroGhostOverlayImage: {
    width: '100%',
    height: '100%',
  },
  zeroScoreOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 24,
    backgroundColor: 'transparent',
    zIndex: 0,
    overflow: 'hidden',
  },
  zeroScoreOverlayImage: {
    width: '100%',
    height: '100%',
  },
  trophyAnimation: {
    width: 96,
    height: 96,
  },
  trophyIcon: {
    width: 72,
    height: 72,
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
    flexWrap: 'wrap',
    rowGap: 8,
    columnGap: 10,
  },
  statsRowSecondary: {
    marginTop: 10,
  },
  rewardRow: {
    marginTop: 12,
    justifyContent: 'center',
    flexWrap: 'nowrap',
    columnGap: 12,
  },
  rewardSummaryRow: {
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(87, 199, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(87, 199, 255, 0.4)',
    columnGap: 10,
  },
  rewardSummaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  rewardSummaryText: {
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  rewardSummaryDivider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    marginHorizontal: 12,
  },
  rewardIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardIconXp: {
    backgroundColor: 'rgba(87, 199, 255, 0.9)',
  },
  rewardIconCoins: {
    backgroundColor: 'rgba(255, 178, 92, 0.95)',
  },
  rewardIconText: {
    color: '#0A0A12',
    fontSize: 12,
    fontFamily: fonts.bold,
    letterSpacing: 0.4,
  },
  rewardValueXp: {
    color: '#DFF3FF',
  },
  rewardValueCoins: {
    color: '#FFE6C7',
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
  multiplayerWaitingCard: {
    width: '100%',
    marginTop: 20,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    paddingVertical: 18,
    paddingHorizontal: 20,
    rowGap: 8,
    alignItems: 'center',
  },
  multiplayerWaitingTitle: {
    color: '#CBEAFF',
    fontSize: 17,
    fontFamily: fonts.medium,
    textAlign: 'center',
  },
  multiplayerWaitingName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  multiplayerWaitingLoader: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
  },
  multiplayerWaitingHint: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: fonts.regular,
  },
  multiplayerRewards: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    flexWrap: 'nowrap',
    columnGap: 12,
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
  scoreboardRowInteractive: {
    opacity: 0.98,
  },
  scoreboardRowSelected: {
    borderColor: 'rgba(255, 178, 92, 0.75)',
    backgroundColor: 'rgba(255, 178, 92, 0.18)',
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
  scoreboardIdentityPressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
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
  actionsStack: {
    width: '100%',
    marginTop: 24,
    rowGap: 12,
    alignItems: 'center',
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
    width: '100%',
    maxWidth: 320,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.accentWarm,
    backgroundColor: colors.accentWarm,
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: colors.accentWarm,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  tertiaryButtonText: {
    color: '#0A0A12',
    fontSize: 15,
    fontFamily: fonts.bold,
    letterSpacing: 0.3,
  },
  reviewSection: {
    maxWidth: 420,
    rowGap: 16,
    alignSelf: 'stretch',
  },
  reviewTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontFamily: fonts.bold,
    textAlign: 'left',
  },
  reviewCard: {
    width: '100%',
    borderRadius: radii.lg,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    rowGap: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewIndex: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.medium,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  reviewStatus: {
    fontSize: 12,
    fontFamily: fonts.bold,
    letterSpacing: 0.4,
  },
  reviewStatusCorrect: {
    color: colors.success,
  },
  reviewStatusWrong: {
    color: colors.danger,
  },
  reviewStatusTimedOut: {
    color: colors.accentWarm,
  },
  reviewQuestion: {
    color: colors.textPrimary,
    fontSize: 16,
    fontFamily: fonts.bold,
    lineHeight: 24,
  },
  reviewAnswers: {
    rowGap: 4,
  },
  reviewLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  reviewAnswer: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: fonts.regular,
    lineHeight: 21,
  },
  reviewAnswerCorrect: {
    color: colors.success,
    fontFamily: fonts.medium,
  },
  reviewExplanationLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  reviewExplanationText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: fonts.regular,
    lineHeight: 21,
  },
  spotlight: {
    display: 'none',
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
