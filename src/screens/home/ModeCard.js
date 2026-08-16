import { useMemo, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../../styles/theme';
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
  icon = null,
  tone = 'default',
  containerStyle = null,
  pressableStyle = null,
  titleStyle = null,
}) {
  const glow = useRef(new Animated.Value(0)).current;
  const glowColors = useMemo(
    () => ({
      inactive: hexToRgba(accent, 0.7),
      active: hexToRgba(accent, 1),
    }),
    [accent]
  );
  const toneConfig = useMemo(() => {
    if (tone === 'play') {
      return { gradient: gradients.play, content: '#211500' };
    }
    if (tone === 'lobby') {
      return { gradient: gradients.lobby, content: '#041B18' };
    }
    if (tone === 'join') {
      return { gradient: gradients.join, content: colors.textPrimary };
    }
    return {
      gradient: [`${accent}38`, 'rgba(17, 20, 44, 0.98)'],
      content: accent,
    };
  }, [accent, tone]);

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
      style={[getModeCardContainerStyle(accent, glow, glowColors), containerStyle]}
    >
      <Pressable
        style={[
          styles.modeCardPressable,
          pressableStyle,
          disabled ? styles.modeCardDisabled : null,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled }}
      >
        <LinearGradient
          colors={toneConfig.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          pointerEvents="none"
          style={styles.modeCardGradient}
        />
        <View style={styles.modeCardTitleRow}>
          {icon ? (
            <View style={styles.modeCardIconWrap}>
              <Ionicons name={icon} size={22} color={toneConfig.content} />
            </View>
          ) : null}
          <Text
            style={[
              getModeCardTitleStyle(accent),
              { color: toneConfig.content },
              titleStyle,
            ]}
          >
            {title}
          </Text>
          {titleMeta ? (
            <View style={styles.modeCardTitleMeta}>{titleMeta}</View>
          ) : null}
        </View>
        {subtitle ? <Text style={styles.modeCardSubtitle}>{subtitle}</Text> : null}
      </Pressable>
    </Animated.View>
  );
}
