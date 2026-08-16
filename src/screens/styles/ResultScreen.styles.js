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
    paddingTop: 12,
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
    maxWidth: 460,
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
  scoreSummary: {
    width: '100%',
    alignItems: 'center',
    marginTop: 6,
    rowGap: 12,
  },
  trophyRewardRow: {
    width: '100%',
    minHeight: 120,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trophyWrap: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
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
  scorePointsIconTrailing: {
    marginLeft: 6,
  },
  scorePointsText: {
    color: colors.accent,
    fontSize: 12,
    fontFamily: fonts.bold,
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
  rewardSummaryRowSide: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    marginLeft: 72,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rewardSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 10,
  },
  rewardSummaryColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    rowGap: 6,
  },
  rewardSummaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardSummaryItemColumn: {
    justifyContent: 'flex-start',
  },
  rewardSummaryText: {
    fontSize: 15,
    fontFamily: fonts.bold,
  },
  rewardSummarySpacer: {
    width: 12,
  },
  rewardSummarySpacerColumn: {
    width: 0,
    height: 0,
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  multiplayerWaitingLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
  },
  waitingText: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 18,
    fontFamily: fonts.bold,
  },
  waitingDots: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    minWidth: 18,
    height: 18,
  },
  waitingDot: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 16,
    fontFamily: fonts.bold,
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
    paddingHorizontal: 16,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scoreboardRowInteractive: {
    opacity: 0.98,
  },
  scoreboardRowLeft: {
    borderColor: 'rgba(148, 163, 184, 0.52)',
    borderWidth: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    shadowOpacity: 0,
    elevation: 0,
  },
  scoreboardRank: {
    width: 34,
    color: colors.textSecondary,
    fontFamily: fonts.medium,
  },
  scoreboardRankLeft: {
    color: '#94A3B8',
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
    marginRight: 14,
  },
  scoreboardAvatarLeft: {
    borderColor: 'rgba(148, 163, 184, 0.55)',
    borderWidth: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
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
    rowGap: 4,
  },
  scoreboardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  scoreboardName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: fonts.medium,
    flexShrink: 1,
  },
  scoreboardNameSelf: {
    color: '#57C7FF',
    fontFamily: fonts.bold,
  },
  scoreboardNameLeft: {
    color: '#94A3B8',
  },
  scoreboardLeftLabel: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    color: '#CBD5E1',
    fontSize: 11,
    fontFamily: fonts.medium,
  },
  scoreboardBoostRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 6,
    columnGap: 6,
  },
  scoreboardBoostChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(87, 199, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(87, 199, 255, 0.28)',
  },
  scoreboardBoostChipIconOnly: {
    minWidth: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreboardBoostChipText: {
    color: '#DFF3FF',
    fontSize: 11,
    fontFamily: fonts.medium,
  },
  scoreboardScoreBox: {
    alignItems: 'flex-end',
    minWidth: 48,
  },
  scoreboardScoreBoxLeft: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  scoreboardScore: {
    color: colors.accent,
    fontSize: 22,
    fontFamily: fonts.bold,
  },
  scoreboardScoreLeft: {
    color: '#94A3B8',
  },
  multiplayerPointsWrap: {
    alignItems: 'center',
    marginTop: 2,
  },
  multiplayerScorePointsPlain: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
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
  primaryButtonTextLarge: {
    fontSize: 22,
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
  actionReveal: {
    width: '100%',
  },
  tertiaryButton: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#28497B',
    backgroundColor: '#15315A',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#15315A',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  tertiaryButtonText: {
    color: '#F6F4FF',
    fontSize: 15,
    fontFamily: fonts.bold,
    letterSpacing: 0.3,
  },
  reviewSection: {
    maxWidth: 460,
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
  reviewCardCorrect: {
    backgroundColor: 'rgba(57, 229, 138, 0.07)',
    borderColor: 'rgba(57, 229, 138, 0.2)',
  },
  reviewCardWrong: {
    backgroundColor: 'rgba(255, 107, 124, 0.07)',
    borderColor: 'rgba(255, 107, 124, 0.2)',
  },
  reviewCardTimedOut: {
    backgroundColor: 'rgba(255, 178, 92, 0.07)',
    borderColor: 'rgba(255, 178, 92, 0.2)',
  },
  reviewCardInteractive: {
    borderColor: 'rgba(158, 220, 255, 0.34)',
  },
  reviewCardPressed: {
    transform: [{ scale: 0.995 }],
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
  reviewImage: {
    width: '100%',
    height: 150,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  reviewAnswers: {
    rowGap: 4,
  },
  reviewBoostRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 6,
    columnGap: 6,
    marginTop: 2,
  },
  reviewBoostChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(87, 199, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(87, 199, 255, 0.26)',
  },
  reviewBoostChipText: {
    color: '#DFF3FF',
    fontSize: 11,
    fontFamily: fonts.medium,
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
  reviewAnswerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  reviewAnswerValue: {
    flex: 1,
  },
  reviewAnswerTimeoutIcon: {
    width: 40,
    height: 40,
  },
  reviewAnswerCorrect: {
    color: colors.success,
    fontFamily: fonts.medium,
  },
  reviewOtherAnswers: {
    rowGap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  reviewOtherAnswersTitle: {
    color: '#9EDCFF',
    fontSize: 12,
    fontFamily: fonts.medium,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  reviewOtherAnswerRow: {
    rowGap: 4,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  reviewOtherAnswerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: 10,
  },
  reviewOtherAnswerName: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  reviewOtherAnswerStatus: {
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  reviewOtherAnswerText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: fonts.regular,
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
