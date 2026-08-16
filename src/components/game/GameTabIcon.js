import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, radii } from '../../styles/theme';

function GameTabIcon({ focused, color, icon, label, size = 24 }) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={
          focused
            ? ['rgba(34, 211, 238, 0.24)', 'rgba(124, 58, 237, 0.2)']
            : ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0)']
        }
        style={[styles.iconShell, focused ? styles.iconShellFocused : null]}
      >
        <Ionicons name={icon} size={size} color={color} />
      </LinearGradient>
      {focused ? (
        <Text
          style={styles.label}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.72}
        >
          {label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 72,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconShell: {
    width: 42,
    height: 34,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  iconShellFocused: {
    borderColor: 'rgba(34, 211, 238, 0.48)',
    shadowColor: colors.accentCyan,
    shadowOpacity: 0.48,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  label: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 9,
    lineHeight: 11,
    marginTop: 1,
  },
});

export default memo(GameTabIcon);
