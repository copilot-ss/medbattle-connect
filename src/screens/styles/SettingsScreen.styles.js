import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 1,
  },
  headerCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCloseText: {
    color: '#E0E7FF',
    fontWeight: '700',
    fontSize: 18,
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  audioCard: {
    borderColor: 'rgba(96, 165, 250, 0.35)',
  },
  squadCard: {
    borderColor: 'rgba(14, 165, 233, 0.35)',
  },
  profileCard: {
    borderColor: 'rgba(226, 232, 240, 0.18)',
  },
  cardLabel: {
    color: '#60A5FA',
    fontSize: 14,
    letterSpacing: 1.5,
    marginBottom: 0,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#111827',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#E2E8F0',
    fontSize: 14,
  },
  actionButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  successButton: {
    backgroundColor: '#22C55E',
  },
  successButtonText: {
    color: '#0F172A',
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
  },
  primaryButtonText: {
    color: '#F8FAFC',
    fontWeight: '600',
  },
  warningButton: {
    backgroundColor: '#F59E0B',
  },
  warningButtonText: {
    color: '#0F172A',
    fontWeight: '700',
  },
  dangerButton: {
    backgroundColor: '#F87171',
  },
  dangerButtonText: {
    color: '#0F172A',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dangerButtonDisabled: {
    backgroundColor: '#7F1D1D',
  },
  disabledButton: {
    backgroundColor: '#1E3A8A',
  },
  warningButtonDisabled: {
    backgroundColor: '#0F172A',
  },
  friendList: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 16,
    padding: 16,
    maxHeight: 200,
  },
  friendLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  friendLoadingText: {
    color: '#94A3B8',
    marginTop: 8,
  },
  friendCodeBadge: {
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.35)',
  },
  friendCodeHint: {
    color: '#93C5FD',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  friendCodeValue: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 2,
  },
  friendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.12)',
  },
  friendCodeText: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 2,
  },
  friendRemoveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  friendRemoveText: {
    color: '#FCA5A5',
    fontSize: 12,
  },
  banner: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.16)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.35)',
    marginBottom: 24,
  },
  bannerText: {
    color: '#BFDBFE',
    fontSize: 13,
  },
  inlineLink: {
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  inlineLinkText: {
    color: '#BFDBFE',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  resetContainer: {
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
});

export default styles;
