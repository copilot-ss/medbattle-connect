import { StyleSheet } from 'react-native';
import { colors, fonts, radii } from '../../styles/theme';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundGlowTop: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.accent,
    opacity: 0.14,
    top: -140,
    right: -100,
  },
  backgroundGlowBottom: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.accentWarm,
    opacity: 0.1,
    bottom: -120,
    left: -80,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 30,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleIcon: {
    marginLeft: 8,
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  closeButtonText: {
    color: colors.textSecondary,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  headerSubtitle: {
    color: colors.textSecondary,
    marginTop: 6,
    fontFamily: fonts.regular,
  },
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: colors.background,
  },
  stateMessage: {
    marginTop: 12,
    color: colors.textMuted,
    fontFamily: fonts.regular,
  },
  errorMessage: {
    fontSize: 16,
    color: '#FFB1B9',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: fonts.medium,
  },
  retryButton: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: radii.md,
  },
  retryButtonText: {
    color: '#081019',
    fontFamily: fonts.bold,
  },
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.lg,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
  },
  entry: {
    borderRadius: radii.lg,
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
    fontFamily: fonts.bold,
  },
  entryMeta: {
    flex: 1,
    marginRight: 14,
  },
  entryName: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
  },
  entryTitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    fontFamily: fonts.regular,
  },
  entryScoreWrap: {
    alignItems: 'flex-end',
  },
  entryScore: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.highlight,
  },
  entryScoreLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
    fontFamily: fonts.regular,
  },
});

export default styles;
