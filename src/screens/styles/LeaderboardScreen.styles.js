import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#030712',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
    backgroundColor: 'rgba(2, 6, 23, 0.6)',
    marginBottom: 18,
  },
  backButtonText: {
    color: '#E0E7FF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  headerSubtitle: {
    color: '#CBD5F5',
    marginTop: 6,
  },
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#030712',
  },
  stateMessage: {
    marginTop: 12,
    color: '#94A3B8',
  },
  errorMessage: {
    fontSize: 16,
    color: '#FCA5A5',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  list: {
    flex: 1,
    backgroundColor: '#030712',
  },
  listContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#CBD5F5',
  },
  entry: {
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  entryRank: {
    width: 46,
    fontSize: 18,
    fontWeight: '800',
  },
  entryMeta: {
    flex: 1,
    marginRight: 14,
  },
  entryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  entryDifficulty: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  entryScoreWrap: {
    alignItems: 'flex-end',
  },
  entryScore: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FACC15',
  },
  entryScoreLabel: {
    fontSize: 11,
    color: '#CBD5F5',
    marginTop: 4,
  },
});

export default styles;
