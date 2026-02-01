import { StyleSheet } from 'react-native';
import { colors, fonts, radii } from '../../styles/theme';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  backgroundGlowTop: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.accent,
    opacity: 0.16,
    top: -120,
    right: -100,
  },
  backgroundGlowBottom: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.accentWarm,
    opacity: 0.12,
    bottom: -120,
    left: -80,
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
  headerProgressPill: {
    marginTop: 6,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(87, 199, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(87, 199, 255, 0.45)',
  },
  headerProgressText: {
    color: '#DFF3FF',
    fontFamily: fonts.bold,
    letterSpacing: 0.5,
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
  progressTrack: {
    height: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
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

export function getTimerProgressFillStyle(progressPercent, timedOut) {
  return StyleSheet.compose(styles.progressFill, {
    width: progressPercent,
    backgroundColor: timedOut ? 'rgba(255, 93, 110, 0.85)' : colors.highlight,
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
