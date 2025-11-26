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
  title: {
    color: '#F8FAFC',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
  },
  quickActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaderboardButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(96, 165, 250, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderboardIcon: {
    width: 24,
    height: 24,
  },
  menuButton: {
    width: 52,
    height: 52,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
    shadowColor: '#0EA5E9',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  menuIcon: {
    width: 28,
    height: 28,
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
  modeCardTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  flexSpacer: {
    flex: 1,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(3, 7, 18, 0.6)',
    zIndex: 10,
  },
  menuContainer: {
    position: 'absolute',
    top: 84,
    right: 16,
    zIndex: 11,
    alignItems: 'flex-end',
  },
  menuCard: {
    width: 260,
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(3, 7, 18, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.45)',
  },
  menuGroup: {
    marginBottom: 0,
  },
  menuGroupSpacing: {
    marginBottom: 12,
  },
  menuGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  menuGroupEmoji: {
    fontSize: 22,
    marginRight: 10,
  },
  menuGroupIonIcon: {
    marginRight: 10,
  },
  menuGroupTitle: {
    color: '#E2E8F0',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    marginTop: 6,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
  },
  menuItemIcon: {
    fontSize: 18,
  },
  menuItemLabel: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '600',
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
