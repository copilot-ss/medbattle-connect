import { StyleSheet } from 'react-native';

const quickActionButtonBase = {
  width: 44,
  height: 44,
  borderRadius: 16,
  backgroundColor: 'rgba(15, 23, 42, 0.95)',
  borderWidth: 1,
  borderColor: 'rgba(148, 163, 184, 0.45)',
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#0EA5E9',
  shadowOpacity: 0.3,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 8 },
  elevation: 8,
};

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
  title: {
    color: '#F8FAFC',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
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
    borderColor: 'rgba(251, 113, 133, 0.6)',
    shadowColor: '#FB7185',
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
    marginTop: 12,
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
    backgroundColor: '#0B1220',
    borderWidth: 1,
    borderColor: '#111827',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    shadowColor: '#111827',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
    zIndex: 6,
  },
  activeLobbyTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  activeLobbyCode: {
    color: '#9CA3AF',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 1.2,
  },
  offlineBanner: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
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
    backgroundColor: '#F87171',
    marginRight: 8,
  },
  offlineTitle: {
    color: '#F8FAFC',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  offlineText: {
    color: '#CBD5F5',
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
  },
  offlineButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.6)',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  offlineButtonDisabled: {
    opacity: 0.6,
  },
  offlineButtonText: {
    color: '#BFDBFE',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.4,
  },
  modeSection: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    rowGap: 18,
    marginTop: 60,
  },
  modeCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#030712',
    shadowOpacity: 0.3,
    shadowRadius: 18,
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
    fontWeight: '800',
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
    color: '#E5E7EB',
    marginTop: 6,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  energyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.55)',
    backgroundColor: 'rgba(250, 204, 21, 0.15)',
  },
  energyBadgeEmpty: {
    borderColor: 'rgba(248, 113, 113, 0.55)',
    backgroundColor: 'rgba(248, 113, 113, 0.16)',
  },
  energyBadgeIcon: {
    marginRight: 6,
  },
  energyBadgeText: {
    color: '#FACC15',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  energyBadgeTextEmpty: {
    color: '#FCA5A5',
  },
  flexSpacer: {
    flex: 1,
  },
  energyMessage: {
    color: '#FCA5A5',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '700',
  },
  boostButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.6)',
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    alignItems: 'center',
    width: '100%',
  },
  boostButtonDisabled: {
    opacity: 0.6,
  },
  boostButtonText: {
    color: '#FACC15',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  boostOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(3, 7, 18, 0.95)',
    alignItems: 'stretch',
  },
  boostCard: {
    flex: 1,
    width: '100%',
    backgroundColor: '#0B1220',
    paddingTop: 70,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  boostTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  boostText: {
    color: '#E2E8F0',
    marginTop: 8,
    fontSize: 14,
  },
  boostMessage: {
    color: '#FCA5A5',
    fontSize: 13,
    marginTop: 12,
    fontWeight: '700',
  },
  boostActions: {
    marginTop: 24,
    rowGap: 12,
  },
  boostButtonGhost: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.5)',
    alignItems: 'center',
    width: '100%',
  },
  boostGhostText: {
    color: '#E2E8F0',
    fontWeight: '700',
  },
  boostCancel: {
    alignItems: 'center',
    marginTop: 20,
  },
  boostCancelText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
});

export function getModeCardContainerStyle(accent, glow, glowColors) {
  return StyleSheet.compose(styles.modeCard, {
    shadowColor: accent,
    shadowOffset: { width: 0, height: 28 },
    borderColor: glow.interpolate({
      inputRange: [0, 1],
      outputRange: [glowColors.inactive, glowColors.active],
    }),
    shadowOpacity: glow.interpolate({
      inputRange: [0, 1],
      outputRange: [0.7, 1],
    }),
    shadowRadius: glow.interpolate({
      inputRange: [0, 1],
      outputRange: [44, 80],
    }),
    transform: [
      {
        scale: glow.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.08],
        }),
      },
    ],
  });
}

export function getModeCardTitleStyle(accent) {
  return StyleSheet.compose(styles.modeCardTitle, { color: accent });
}

export default styles;
