import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../../styles/theme';

const PARTICLES = [
  { left: '10%', top: '16%', size: 3, color: colors.accentCyan },
  { left: '83%', top: '24%', size: 2, color: colors.highlight },
  { left: '72%', top: '54%', size: 3, color: colors.accentViolet },
  { left: '18%', top: '66%', size: 2, color: colors.accentBlue },
  { left: '90%', top: '78%', size: 2, color: colors.accentCyan },
  { left: '35%', top: '88%', size: 3, color: colors.accentPurple },
];

function GameBackground({ intensity = 'normal' }) {
  const subtle = intensity === 'subtle';

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={StyleSheet.absoluteFill}
    >
      <LinearGradient
        colors={gradients.background}
        locations={[0, 0.56, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.glow, styles.glowBlue, subtle ? styles.glowSubtle : null]} />
      <View style={[styles.glow, styles.glowPurple, subtle ? styles.glowSubtle : null]} />
      {PARTICLES.map((particle, index) => (
        <View
          key={`${particle.left}-${particle.top}-${index}`}
          style={[
            styles.particle,
            {
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              borderRadius: particle.size / 2,
              backgroundColor: particle.color,
              opacity: subtle ? 0.2 : 0.32,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.12,
  },
  glowBlue: {
    width: 360,
    height: 360,
    top: -220,
    left: -150,
    backgroundColor: colors.accentBlue,
  },
  glowPurple: {
    width: 420,
    height: 420,
    right: -250,
    bottom: -230,
    backgroundColor: colors.accentPurple,
  },
  glowSubtle: {
    opacity: 0.07,
  },
  particle: {
    position: 'absolute',
    shadowColor: colors.accentCyan,
    shadowOpacity: 0.5,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
  },
});

export default memo(GameBackground);
