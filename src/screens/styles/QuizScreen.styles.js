import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#030712',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerMeta: {
    color: '#94A3B8',
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  headerQuick: {
    color: '#C084FC',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  headerProgressPill: {
    marginTop: 6,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(96, 165, 250, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.4)',
  },
  headerProgressText: {
    color: '#E0F2FE',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 26,
    fontWeight: '800',
  },
  matchStatusCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.35)',
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 22,
  },
  matchPlayersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: 12,
    marginBottom: 14,
  },
  playerPanel: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.25)',
  },
  playerPanelLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  playerPanelName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  playerPanelScore: {
    color: '#60A5FA',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 8,
  },
  vsDivider: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.4)',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  vsDividerText: {
    color: '#BFDBFE',
    fontSize: 16,
    fontWeight: '800',
  },
  matchMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchMetaLeft: {
    color: '#94A3B8',
    fontSize: 13,
  },
  matchMetaRight: {
    color: '#94A3B8',
    fontSize: 13,
  },
  matchWaitingHint: {
    marginTop: 12,
    color: '#A5B4FC',
    fontSize: 13,
    textAlign: 'center',
  },
  exitButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.6)',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  exitButtonText: {
    color: '#FCA5A5',
    fontWeight: '700',
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
    color: '#FACC15',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  timerValue: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 'auto',
  },
  progressTrack: {
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.3)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    elevation: 3,
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
  },
  questionCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
    marginBottom: 28,
  },
  questionMeta: {
    color: '#60A5FA',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  questionText: {
    color: '#F8FAFC',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  optionsList: {
    rowGap: 12,
  },
  optionButton: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  timeoutBanner: {
    marginTop: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(248, 113, 113, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.45)',
  },
  timeoutTitle: {
    color: '#FCA5A5',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 16,
  },
  timeoutSubtitle: {
    color: '#F8FAFC',
    textAlign: 'center',
    marginTop: 4,
    fontSize: 13,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
    rowGap: 16,
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
  },
  modalMessage: {
    color: '#CBD5F5',
    fontSize: 14,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    columnGap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalButtonContinue: {
    backgroundColor: 'rgba(34, 197, 94, 0.25)',
    borderColor: 'rgba(34, 197, 94, 0.55)',
  },
  modalButtonContinueText: {
    color: '#BBF7D0',
    fontWeight: '700',
  },
  modalButtonExit: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    borderColor: 'rgba(239, 68, 68, 0.6)',
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonExitText: {
    color: '#FCA5A5',
    fontWeight: '800',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#030712',
  },
  loadingText: {
    marginTop: 12,
    color: '#E2E8F0',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#030712',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#E2E8F0',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: '#60A5FA',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  errorButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '600',
  },
});

export function getTimerProgressFillStyle(progressPercent, timedOut) {
  return StyleSheet.compose(styles.progressFill, {
    width: progressPercent,
    backgroundColor: timedOut ? 'rgba(248, 113, 113, 0.85)' : '#FACC15',
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
