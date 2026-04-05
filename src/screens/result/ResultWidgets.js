import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import styles, {
  getSparkleContainerStyle,
  getSparkleHorizontalStyle,
  getSparkleVerticalStyle,
} from '../styles/ResultScreen.styles';

const COIN_EMOJI = '\uD83E\uDE99';

export function BubbleReveal({
  children,
  delay = 0,
  duration = 250,
  distance = 18,
  scaleFrom = 0.97,
  resetKey = '',
  style,
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;
  const scale = useRef(new Animated.Value(scaleFrom)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(distance);
    scale.setValue(scaleFrom);

    const animation = Animated.sequence([
      Animated.delay(Math.max(0, delay)),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          speed: 15,
          bounciness: 6,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start();
    return () => animation.stop();
  }, [delay, distance, duration, opacity, resetKey, scale, scaleFrom, translateY]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

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

export function RewardSummary({ items = [], delay = 0, direction = 'row' }) {
  const scale = useRef(new Animated.Value(0.96)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  const isColumn = direction === 'column';

  useEffect(() => {
    opacity.setValue(0);
    scale.setValue(0.96);
    translateY.setValue(16);

    const animation = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
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
  }, [delay, opacity, scale, translateY]);

  if (!safeItems.length) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.rewardSummary,
        isColumn ? styles.rewardSummaryColumn : null,
        { opacity, transform: [{ translateY }, { scale }] },
      ]}
    >
      {safeItems.map((item, index) => {
        const isXp = item.tone === 'xp';
        const key = item.key ?? `${item.tone}-${index}`;
        const rewardText = isXp ? `+${item.value}XP` : `+${item.value} ${COIN_EMOJI}`;

        return (
          <View
            key={key}
            style={[
              styles.rewardSummaryItem,
              isColumn ? styles.rewardSummaryItemColumn : null,
            ]}
          >
            <Text
              style={[
                styles.rewardSummaryText,
                isXp ? styles.rewardValueXp : styles.rewardValueCoins,
              ]}
            >
              {rewardText}
            </Text>
            {index < safeItems.length - 1 ? (
              <View
                style={[
                  styles.rewardSummarySpacer,
                  isColumn ? styles.rewardSummarySpacerColumn : null,
                ]}
              />
            ) : null}
          </View>
        );
      })}
    </Animated.View>
  );
}
