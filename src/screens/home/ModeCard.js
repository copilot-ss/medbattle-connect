import { useMemo, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import styles, {
  getModeCardContainerStyle,
  getModeCardTitleStyle,
} from '../styles/HomeScreen.styles';

function parseHex(hex) {
  const normalized = hex.replace('#', '');
  const isShort = normalized.length === 3;
  const full = isShort
    ? normalized
        .split('')
        .map((char) => char + char)
        .join('')
    : normalized;

  const parsed = Number.parseInt(full, 16);
  const r = (parsed >> 16) & 255;
  const g = (parsed >> 8) & 255;
  const b = parsed & 255;

  return { r, g, b };
}

function hexToRgba(hex, alpha = 1) {
  const { r, g, b } = parseHex(hex);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function ModeCard({
  title,
  subtitle,
  accent,
  onPress,
  disabled = false,
  titleMeta = null,
}) {
  const glow = useRef(new Animated.Value(0)).current;
  const glowColors = useMemo(
    () => ({
      inactive: hexToRgba(accent, 0.7),
      active: hexToRgba(accent, 1),
    }),
    [accent]
  );

  function handlePressIn() {
    Animated.timing(glow, {
      toValue: 1,
      duration: 160,
      useNativeDriver: false,
    }).start();
  }

  function handlePressOut() {
    Animated.timing(glow, {
      toValue: 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }

  return (
    <Animated.View
      style={getModeCardContainerStyle(accent, glow, glowColors)}
    >
      <Pressable
        style={[styles.modeCardPressable, disabled ? styles.modeCardDisabled : null]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
      >
        <View style={styles.modeCardTitleRow}>
          <Text style={getModeCardTitleStyle(accent)}>{title}</Text>
          {titleMeta ? (
            <View style={styles.modeCardTitleMeta}>{titleMeta}</View>
          ) : null}
        </View>
        {subtitle ? <Text style={styles.modeCardSubtitle}>{subtitle}</Text> : null}
      </Pressable>
    </Animated.View>
  );
}
