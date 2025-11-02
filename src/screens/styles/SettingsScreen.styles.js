import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
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
  headerButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
  },
  headerButtonText: {
    color: '#E0E7FF',
    fontWeight: '600',
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
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: '#CBD5F5',
    fontSize: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  disabledButton: {
    backgroundColor: '#1E3A8A',
  },
  warningButtonDisabled: {
    backgroundColor: '#0F172A',
  },
  friendList: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
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
  friendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.12)',
  },
  friendEmail: {
    color: '#E2E8F0',
    fontSize: 14,
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
  friendEmpty: {
    color: '#94A3B8',
    textAlign: 'center',
  },
  infoBox: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.6)',
  },
  infoTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  infoSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 12,
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
  footerButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
  },
  footerButtonText: {
    color: '#E0E7FF',
    fontWeight: '600',
  },
});

export default styles;
