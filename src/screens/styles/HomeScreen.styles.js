import { StyleSheet } from 'react-native';
import { colors, fonts, radii } from '../../styles/theme';

const quickActionButtonBase = {
  width: 44,
  height: 44,
  borderRadius: radii.md,
  backgroundColor: colors.surfaceAlt,
  borderWidth: 1,
  borderColor: colors.borderStrong,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: colors.accent,
  shadowOpacity: 0.35,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 10 },
  elevation: 8,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backgroundGlowTop: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: colors.accent,
    opacity: 0.18,
    top: -160,
    right: -80,
  },
  backgroundGlowBottom: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.accentWarm,
    opacity: 0.12,
    bottom: -120,
    left: -60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 32,
    fontFamily: fonts.bold,
    letterSpacing: 1.2,
  },
  quickActions: {
    flexDirection: 'row',
    alignItems: 'center',
    transform: [{ translateX: 2 }],
  },
  leaderboardButton: {
    ...quickActionButtonBase,
  },
  leaderboardIcon: {
    width: 22,
    height: 22,
  },
  friendsButton: {
    ...quickActionButtonBase,
    marginLeft: 8,
    borderColor: 'rgba(255, 127, 168, 0.55)',
    shadowColor: colors.accentPink,
  },
  friendsEmoji: {
    fontSize: 18,
  },
  menuButton: {
    ...quickActionButtonBase,
    marginLeft: 8,
  },
  menuIcon: {
    width: 22,
    height: 22,
  },
  quickActionDisabled: {
    opacity: 0.45,
  },
  animationWrapper: {
    alignItems: 'center',
    marginTop: 8,
  },
  animationView: {
    width: '100%',
    maxWidth: 420,
    height: 260,
  },
  activeLobbyAnchor: {
    position: 'relative',
    height: 0,
    zIndex: 5,
    overflow: 'visible',
  },
  activeLobbyBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    shadowColor: '#05050A',
    shadowOpacity: 0.6,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
    zIndex: 6,
  },
  activeLobbyTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontFamily: fonts.bold,
    letterSpacing: 0.5,
  },
  activeLobbyCode: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 14,
    letterSpacing: 1.2,
  },
  offlineBanner: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  offlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    marginRight: 8,
  },
  offlineTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 14,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  offlineText: {
    color: colors.textSecondary,
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
  },
  offlineButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
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
    fontSize: 12,
    letterSpacing: 0.4,
  },
  modeSection: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    rowGap: 18,
    marginTop: 52,
  },
  modeCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: radii.xl,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  modeCardPressable: {
    paddingVertical: 26,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  modeCardDisabled: {
    opacity: 0.5,
  },
  modeCardTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    letterSpacing: 0.5,
  },
  modeCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeCardTitleMeta: {
    marginLeft: 10,
  },
  modeCardSubtitle: {
    color: colors.textSecondary,
    marginTop: 6,
    fontSize: 12,
    letterSpacing: 0.3,
    fontFamily: fonts.regular,
  },
  energyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 214, 117, 0.5)',
    backgroundColor: 'rgba(255, 214, 117, 0.16)',
  },
  energyBadgeEmpty: {
    borderColor: 'rgba(255, 93, 110, 0.5)',
    backgroundColor: 'rgba(255, 93, 110, 0.16)',
  },
  energyBadgeIcon: {
    marginRight: 6,
  },
  energyBadgeText: {
    color: colors.highlight,
    fontSize: 11,
    fontFamily: fonts.bold,
    letterSpacing: 0.3,
  },
  energyBadgeTextEmpty: {
    color: '#FFB1B9',
  },
  flexSpacer: {
    flex: 1,
  },
  energyMessage: {
    color: '#FFB1B9',
    textAlign: 'center',
    marginTop: 10,
    fontFamily: fonts.medium,
  },
  boostButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 178, 92, 0.6)',
    backgroundColor: 'rgba(255, 178, 92, 0.2)',
    alignItems: 'center',
    width: '100%',
  },
  boostButtonDisabled: {
    opacity: 0.6,
  },
  boostButtonText: {
    color: colors.accentWarm,
    fontFamily: fonts.bold,
    letterSpacing: 0.5,
  },
  boostOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(7, 7, 11, 0.95)',
    alignItems: 'stretch',
  },
  boostCard: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.surface,
    paddingTop: 70,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  boostTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  boostText: {
    color: colors.textSecondary,
    marginTop: 8,
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  boostMessage: {
    color: '#FFB1B9',
    fontSize: 13,
    marginTop: 12,
    fontFamily: fonts.medium,
  },
  boostActions: {
    marginTop: 24,
    rowGap: 12,
  },
  boostButtonGhost: {
    paddingVertical: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    width: '100%',
  },
  boostGhostText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
  },
  boostCancel: {
    alignItems: 'center',
    marginTop: 20,
  },
  boostCancelText: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: fonts.medium,
  },
});

export function getModeCardContainerStyle(accent, glow, glowColors) {
  return StyleSheet.compose(styles.modeCard, {
    shadowColor: accent,
    shadowOffset: { width: 0, height: 24 },
    borderColor: glow.interpolate({
      inputRange: [0, 1],
      outputRange: [glowColors.inactive, glowColors.active],
    }),
    shadowOpacity: glow.interpolate({
      inputRange: [0, 1],
      outputRange: [0.45, 0.85],
    }),
    shadowRadius: glow.interpolate({
      inputRange: [0, 1],
      outputRange: [34, 64],
    }),
    transform: [
      {
        scale: glow.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.04],
        }),
      },
    ],
  });
}

export function getModeCardTitleStyle(accent) {
  return StyleSheet.compose(styles.modeCardTitle, { color: accent });
}

export default styles;
