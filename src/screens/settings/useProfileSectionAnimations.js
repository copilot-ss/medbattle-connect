import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, Easing } from 'react-native';

const ENTRANCE_STAGGER_MS = 90;

function createMotion(initialTranslateY = 20, initialScale = 0.985) {
  return {
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(initialTranslateY),
    scale: new Animated.Value(initialScale),
  };
}

function resetMotion(motion, translateY = 20, scale = 0.985) {
  motion.opacity.setValue(0);
  motion.translateY.setValue(translateY);
  motion.scale.setValue(scale);
}

function buildEntrance(motion, duration = 360) {
  return Animated.parallel([
    Animated.timing(motion.opacity, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
    Animated.timing(motion.translateY, {
      toValue: 0,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
    Animated.timing(motion.scale, {
      toValue: 1,
      duration: Math.max(260, Math.round(duration * 0.86)),
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
  ]);
}

function toAnimatedStyle(motion) {
  return {
    opacity: motion.opacity,
    transform: [
      { translateY: motion.translateY },
      { scale: motion.scale },
    ],
  };
}

function clampProgress(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
}

export default function useProfileSectionAnimations({
  progressTarget = 0,
}) {
  const heroMotion = useRef(createMotion(18, 0.99)).current;
  const statsMotion = useRef(createMotion(20, 0.988)).current;
  const inventoryMotion = useRef(createMotion(22, 0.986)).current;
  const achievementsMotion = useRef(createMotion(24, 0.984)).current;
  const accountMotion = useRef(createMotion(20, 0.99)).current;
  const avatarScaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const safeProgress = clampProgress(progressTarget);

  useEffect(() => {
    resetMotion(heroMotion, 18, 0.99);
    resetMotion(statsMotion, 20, 0.988);
    resetMotion(inventoryMotion, 22, 0.986);
    resetMotion(achievementsMotion, 24, 0.984);
    resetMotion(accountMotion, 20, 0.99);

    const sequence = Animated.stagger(ENTRANCE_STAGGER_MS, [
      buildEntrance(heroMotion, 340),
      buildEntrance(statsMotion, 360),
      buildEntrance(inventoryMotion, 360),
      buildEntrance(achievementsMotion, 380),
      buildEntrance(accountMotion, 340),
    ]);
    sequence.start();

    return () => {
      sequence.stop();
    };
  }, [
    accountMotion,
    achievementsMotion,
    heroMotion,
    inventoryMotion,
    statsMotion,
  ]);

  useEffect(() => {
    const animation = Animated.timing(progressAnim, {
      toValue: safeProgress,
      duration: 580,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    animation.start();

    return () => animation.stop();
  }, [progressAnim, safeProgress]);

  const handleAvatarPressIn = useCallback(() => {
    Animated.spring(avatarScaleAnim, {
      toValue: 0.94,
      speed: 22,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
  }, [avatarScaleAnim]);

  const handleAvatarPressOut = useCallback(() => {
    Animated.spring(avatarScaleAnim, {
      toValue: 1,
      speed: 18,
      bounciness: 8,
      useNativeDriver: true,
    }).start();
  }, [avatarScaleAnim]);

  const heroAnimatedStyle = useMemo(
    () => toAnimatedStyle(heroMotion),
    [heroMotion]
  );
  const statsAnimatedStyle = useMemo(
    () => toAnimatedStyle(statsMotion),
    [statsMotion]
  );
  const inventoryAnimatedStyle = useMemo(
    () => toAnimatedStyle(inventoryMotion),
    [inventoryMotion]
  );
  const achievementsAnimatedStyle = useMemo(
    () => toAnimatedStyle(achievementsMotion),
    [achievementsMotion]
  );
  const accountAnimatedStyle = useMemo(
    () => toAnimatedStyle(accountMotion),
    [accountMotion]
  );
  const avatarAnimatedStyle = useMemo(
    () => ({
      transform: [{ scale: avatarScaleAnim }],
    }),
    [avatarScaleAnim]
  );
  const progressWidth = useMemo(
    () =>
      progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
      }),
    [progressAnim]
  );

  return {
    heroAnimatedStyle,
    statsAnimatedStyle,
    inventoryAnimatedStyle,
    achievementsAnimatedStyle,
    accountAnimatedStyle,
    avatarAnimatedStyle,
    progressWidth,
    handleAvatarPressIn,
    handleAvatarPressOut,
  };
}
