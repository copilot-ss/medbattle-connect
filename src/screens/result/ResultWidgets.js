import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import styles, {
  getSparkleContainerStyle,
  getSparkleHorizontalStyle,
  getSparkleVerticalStyle,
} from '../styles/ResultScreen.styles';

export function Sparkle({ size, top, left, opacity, rotate = '0deg', color }) {
  const horizontalHeight = size * 0.2;
  const verticalWidth = size * 0.2;
  const centerOffset = (size - horizontalHeight) / 2;
  const containerStyle = getSparkleContainerStyle({ size, top, left, opacity, rotate });
  const horizontalStyle = getSparkleHorizontalStyle({ centerOffset, height: horizontalHeight, color });
  const verticalStyle = getSparkleVerticalStyle({
    leftOffset: (size - verticalWidth) / 2,
    width: verticalWidth,
    color,
  });

  return (
    <View pointerEvents="none" style={containerStyle}>
      <View style={horizontalStyle} />
      <View style={verticalStyle} />
    </View>
  );
}

export function RewardSummary({ items = [], delay = 0 }) {
  const scale = useRef(new Animated.Value(0.96)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          speed: 14,
          bounciness: 6,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start();
    return () => animation.stop();
  }, [delay, opacity, scale]);

  if (!safeItems.length) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.rewardSummary,
        { opacity, transform: [{ scale }] },
      ]}
    >
      {safeItems.map((item, index) => {
        const isXp = item.tone === 'xp';
        const key = item.key ?? `${item.tone}-${index}`;

        return (
          <View key={key} style={styles.rewardSummaryItem}>
            <View style={[styles.rewardIcon, isXp ? styles.rewardIconXp : styles.rewardIconCoins]}>
              <Text style={styles.rewardIconText}>{isXp ? 'XP' : 'C'}</Text>
            </View>
            <Text
              style={[
                styles.rewardSummaryText,
                isXp ? styles.rewardValueXp : styles.rewardValueCoins,
              ]}
            >
              {item.value} {item.label}
            </Text>
            {index < safeItems.length - 1 ? (
              <View style={styles.rewardSummaryDivider} />
            ) : null}
          </View>
        );
      })}
    </Animated.View>
  );
}
