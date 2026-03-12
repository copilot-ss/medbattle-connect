import { StyleSheet } from 'react-native';
import { colors, fonts, radii } from '../../styles/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundGlowTop: {
    display: 'none',
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: colors.accent,
    opacity: 0.16,
    top: -170,
    right: -90,
  },
  backgroundGlowBottom: {
    display: 'none',
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.accentWarm,
    opacity: 0.12,
    bottom: -140,
    left: -80,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 36,
    rowGap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    flex: 1,
  },
  energyBadgeReset: {
    marginLeft: 0,
  },
  categoryCard: {
    width: '100%',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 18,
    rowGap: 10,
  },
  categoryIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceHigh,
  },
  categoryTitle: {
    color: colors.textPrimary,
    fontSize: 28,
    fontFamily: fonts.bold,
  },
  categoryDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.regular,
  },
  categoryReward: {
    color: colors.highlight,
    fontSize: 12,
    fontFamily: fonts.medium,
    marginTop: 6,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontFamily: fonts.bold,
    letterSpacing: 0.3,
  },
  modeSection: {
    flex: 1,
    alignItems: 'center',
    rowGap: 18,
    marginTop: 18,
  },
  categoryHint: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
});

export default styles;
