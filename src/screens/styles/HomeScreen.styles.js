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
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(148, 163, 184, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  menuIcon: {
    width: 24,
    height: 24,
  },
  modeSection: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    rowGap: 18,
    marginTop: 320,
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
    top: 70,
    right: 20,
    zIndex: 11,
    alignItems: 'flex-end',
  },
  menuCard: {
    width: 220,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
  },
  menuGroup: {
    marginBottom: 0,
  },
  menuGroupSpacing: {
    marginBottom: 12,
  },
  menuGroupTitle: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  menuItem: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  menuItemLabel: {
    color: '#E2E8F0',
    fontSize: 16,
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
