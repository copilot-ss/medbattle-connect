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
  activeLobbyBanner: {
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
  modeSection: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    rowGap: 18,
    marginTop: 60,
  },
  modeSectionCompact: {
    marginTop: 28,
  },
  momentumCard: {
    backgroundColor: '#0B1220',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.25)',
    borderRadius: 18,
    padding: 16,
    marginTop: 8,
    shadowColor: '#1D4ED8',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  momentumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  momentumTitle: {
    color: '#E5E7EB',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  momentumBadge: {
    backgroundColor: 'rgba(14, 165, 233, 0.12)',
    borderColor: 'rgba(14, 165, 233, 0.45)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  momentumBadgeText: {
    color: '#67E8F9',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  streakLabel: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  streakValue: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
  },
  streakBarOuter: {
    width: '100%',
    height: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    overflow: 'hidden',
    marginTop: 8,
  },
  streakBarInner: {
    height: '100%',
    backgroundColor: '#0EA5E9',
    borderRadius: 10,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: 10,
    marginTop: 12,
  },
  statPill: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderColor: 'rgba(148, 163, 184, 0.35)',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statPillLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  statPillValue: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  quickQuizButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(14, 165, 233, 0.12)',
    borderColor: 'rgba(14, 165, 233, 0.55)',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    columnGap: 6,
    minWidth: 120,
  },
  quickQuizText: {
    color: '#0EA5E9',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.2,
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
  flexSpacer: {
    flex: 1,
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
