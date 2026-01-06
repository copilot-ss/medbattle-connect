import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1120',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  backgroundGlowLarge: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    opacity: 0.2,
    top: -60,
  },
  backgroundGlowSmall: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#2563EB',
    opacity: 0.18,
    bottom: -80,
    right: -40,
  },
  sparkle: {
    position: 'absolute',
  },
  sparkleHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  sparkleVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  cardWrap: {
    width: '100%',
    maxWidth: 420,
    position: 'relative',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
    alignItems: 'center',
    zIndex: 1,
  },
  badgePill: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 999,
    marginBottom: 18,
  },
  badgePillText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heading: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F8FAFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#CBD5F5',
    textAlign: 'center',
    marginBottom: 24,
  },
  statsSection: {
    width: '100%',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(30, 64, 175, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  offlineBanner: {
    width: '100%',
    marginTop: 16,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(14, 116, 144, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.4)',
  },
  offlineBannerTitle: {
    color: '#7DD3FC',
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  offlineBannerText: {
    color: '#E2E8F0',
    fontSize: 13,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 0,
  },
  statPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    marginHorizontal: 6,
    alignItems: 'center',
  },
  statPillLabel: {
    color: '#CBD5F5',
    fontSize: 12,
  },
  statPillValue: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 2,
  },
  multiplayerCard: {
    width: '100%',
    marginTop: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.35)',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  multiplayerTitle: {
    color: '#BFDBFE',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  multiplayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  multiplayerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  multiplayerLabel: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 4,
  },
  multiplayerScore: {
    color: '#38BDF8',
    fontSize: 26,
    fontWeight: '800',
  },
  multiplayerDivider: {
    width: 1,
    height: '70%',
    backgroundColor: 'rgba(148, 163, 184, 0.35)',
  },
  multiplayerMeta: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
  },
  primaryButton: {
    marginTop: 28,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  primaryButtonText: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '700',
  },
  primaryButtonContent: {
    alignItems: 'center',
    gap: 6,
  },
  primaryButtonMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  primaryButtonMetaText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
    alignItems: 'center',
    marginTop: 14,
  },
  secondaryButtonText: {
    color: '#E0E7FF',
    fontSize: 16,
    fontWeight: '600',
  },
  tertiaryButton: {
    marginTop: 16,
  },
  tertiaryButtonText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  spotlight: {
    position: 'absolute',
    width: '70%',
    height: 120,
    top: 90,
    borderRadius: 60,
    backgroundColor: 'rgba(250, 204, 21, 0.16)',
    transform: [{ rotate: '-5deg' }],
  },
});

export function getLargeGlowStyle(color) {
  return StyleSheet.compose(styles.backgroundGlowLarge, { backgroundColor: color });
}

export function getBadgePillStyle(color) {
  return StyleSheet.compose(styles.badgePill, { backgroundColor: color });
}

export function getPrimaryButtonStyle(color) {
  return StyleSheet.compose(styles.primaryButton, {
    backgroundColor: color,
    shadowColor: color,
  });
}

export function getSparkleContainerStyle({ size, top, left, opacity, rotate = '0deg' }) {
  return StyleSheet.compose(styles.sparkle, {
    top,
    left,
    width: size,
    height: size,
    opacity,
    transform: [{ rotate }],
  });
}

export function getSparkleHorizontalStyle({ centerOffset, height, color }) {
  return StyleSheet.compose(styles.sparkleHorizontal, {
    top: centerOffset,
    height,
    borderRadius: height / 2,
    backgroundColor: color,
  });
}

export function getSparkleVerticalStyle({ leftOffset, width, color }) {
  return StyleSheet.compose(styles.sparkleVertical, {
    left: leftOffset,
    width,
    borderRadius: width / 2,
    backgroundColor: color,
  });
}

export default styles;
