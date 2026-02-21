import { StyleSheet } from 'react-native';
import { colors, fonts, radii } from '../../styles/theme';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerMeta: {
    color: colors.textMuted,
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontFamily: fonts.medium,
  },
  headerQuick: {
    color: colors.accent,
    fontSize: 20,
    fontFamily: fonts.bold,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  headerCategory: {
    marginTop: 6,
    color: colors.accentPink,
    fontSize: 26,
    fontFamily: fonts.bold,
    letterSpacing: 0.8,
    textShadowColor: 'rgba(87, 199, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 26,
    fontFamily: fonts.bold,
  },
  offlineBanner: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 18,
  },
  offlineBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  offlineBannerTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  offlineBannerText: {
    color: colors.textSecondary,
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.regular,
  },
  offlineButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(87, 199, 255, 0.45)',
    backgroundColor: 'rgba(87, 199, 255, 0.16)',
  },
  offlineButtonDisabled: {
    opacity: 0.6,
  },
  offlineButtonText: {
    color: '#CBEAFF',
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  exitButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 93, 110, 0.6)',
    backgroundColor: 'rgba(255, 93, 110, 0.15)',
  },
  exitButtonText: {
    color: '#FFB1B9',
    fontFamily: fonts.bold,
  },
  timerSection: {
    marginBottom: 24,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  timerLabel: {
    color: colors.highlight,
    fontSize: 14,
    fontFamily: fonts.medium,
    letterSpacing: 1.1,
  },
  timerValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: fonts.medium,
    marginLeft: 'auto',
  },
  timerValueFrozen: {
    color: '#9EEBFF',
    textShadowColor: 'rgba(158, 235, 255, 0.75)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  progressWrap: {
    position: 'relative',
  },
  progressTrack: {
    height: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  progressTrackFrozen: {
    backgroundColor: 'rgba(110, 194, 238, 0.18)',
    borderColor: 'rgba(110, 194, 238, 0.8)',
  },
  frozenOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    opacity: 0.65,
  },
  frozenShard: {
    width: 3,
    height: '100%',
    borderRadius: 2,
    backgroundColor: 'rgba(211, 244, 255, 0.65)',
    transform: [{ rotate: '18deg' }],
  },
  frozenSnowBadge: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(110, 194, 238, 0.9)',
    backgroundColor: 'rgba(211, 244, 255, 0.9)',
  },
  snailIcon: {
    position: 'absolute',
    top: -15,
    left: 0,
    width: 26,
    height: 26,
    resizeMode: 'contain',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    elevation: 3,
    shadowColor: colors.highlight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 28,
  },
  boostRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 10,
    rowGap: 10,
    marginBottom: 18,
  },
  boostButton: {
    flexBasis: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  boostButtonActive: {
    borderColor: 'rgba(255, 199, 87, 0.6)',
    backgroundColor: 'rgba(255, 199, 87, 0.25)',
  },
  boostButtonFreezeActive: {
    justifyContent: 'center',
    borderColor: 'rgba(125, 214, 255, 0.95)',
    backgroundColor: 'rgba(173, 232, 255, 0.55)',
  },
  boostButtonDisabled: {
    opacity: 0.5,
  },
  boostButtonText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  boostButtonTextActive: {
    color: '#2B1400',
    fontFamily: fonts.bold,
  },
  questionMeta: {
    color: colors.accent,
    fontSize: 16,
    fontFamily: fonts.medium,
    marginBottom: 6,
  },
  questionText: {
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 28,
    fontFamily: fonts.medium,
  },
  optionsList: {
    rowGap: 12,
  },
  optionButton: {
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  timeoutBanner: {
    marginTop: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 93, 110, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 93, 110, 0.45)',
  },
  timeoutTitle: {
    color: '#FFB1B9',
    fontFamily: fonts.bold,
    textAlign: 'center',
    fontSize: 16,
  },
  timeoutSubtitle: {
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: 4,
    fontSize: 13,
    fontFamily: fonts.regular,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(7, 7, 11, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    rowGap: 16,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontFamily: fonts.bold,
  },
  modalMessage: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.regular,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    columnGap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: radii.md,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalButtonContinue: {
    backgroundColor: 'rgba(57, 229, 138, 0.2)',
    borderColor: 'rgba(57, 229, 138, 0.5)',
  },
  modalButtonContinueText: {
    color: '#B6F5D4',
    fontFamily: fonts.bold,
  },
  modalButtonExit: {
    backgroundColor: 'rgba(255, 93, 110, 0.22)',
    borderColor: 'rgba(255, 93, 110, 0.6)',
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonExitText: {
    color: '#FFB1B9',
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: fonts.medium,
  },
  errorButton: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: radii.md,
  },
  errorButtonText: {
    color: '#081019',
    fontSize: 16,
    fontFamily: fonts.bold,
  },
});

export function getTimerProgressFillStyle(progressPercent, timedOut, isFrozen = false) {
  return StyleSheet.compose(styles.progressFill, {
    width: progressPercent,
    backgroundColor: timedOut
      ? 'rgba(255, 93, 110, 0.85)'
      : isFrozen
      ? '#7DD6FF'
      : colors.highlight,
  });
}

export function getOptionButtonStyle({ backgroundColor, borderColor, opacity = 1 }) {
  return StyleSheet.compose(styles.optionButton, {
    backgroundColor,
    borderColor,
    opacity,
  });
}

export function getOptionTextStyle(color) {
  return StyleSheet.compose(styles.optionText, { color });
}

export default styles;
