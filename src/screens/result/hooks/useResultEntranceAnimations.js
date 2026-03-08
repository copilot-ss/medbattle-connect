import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing } from 'react-native';

const STAGGER_DELAY_MS = 95;

function createMotion(initialTranslateY = 24, initialScale = 0.985) {
  return {
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(initialTranslateY),
    scale: new Animated.Value(initialScale),
  };
}

function resetMotion(motion, translateY = 24, scale = 0.985) {
  motion.opacity.setValue(0);
  motion.translateY.setValue(translateY);
  motion.scale.setValue(scale);
}

function buildEntranceAnimation(motion, duration = 380) {
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
      duration: Math.max(280, Math.round(duration * 0.88)),
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

export default function useResultEntranceAnimations({
  triggerKey = '',
}) {
  const headerMotion = useRef(createMotion(22, 0.99)).current;
  const summaryMotion = useRef(createMotion(24, 0.985)).current;
  const offlineMotion = useRef(createMotion(20, 0.988)).current;
  const actionsMotion = useRef(createMotion(26, 0.982)).current;
  const reviewMotion = useRef(createMotion(30, 0.98)).current;

  useEffect(() => {
    resetMotion(headerMotion, 22, 0.99);
    resetMotion(summaryMotion, 24, 0.985);
    resetMotion(offlineMotion, 20, 0.988);
    resetMotion(actionsMotion, 26, 0.982);
    resetMotion(reviewMotion, 30, 0.98);

    const sequence = Animated.stagger(STAGGER_DELAY_MS, [
      buildEntranceAnimation(headerMotion, 360),
      buildEntranceAnimation(summaryMotion, 380),
      buildEntranceAnimation(offlineMotion, 340),
      buildEntranceAnimation(actionsMotion, 360),
      buildEntranceAnimation(reviewMotion, 420),
    ]);

    sequence.start();
    return () => sequence.stop();
  }, [
    actionsMotion,
    headerMotion,
    offlineMotion,
    reviewMotion,
    summaryMotion,
    triggerKey,
  ]);

  const headerAnimatedStyle = useMemo(
    () => toAnimatedStyle(headerMotion),
    [headerMotion]
  );
  const summaryAnimatedStyle = useMemo(
    () => toAnimatedStyle(summaryMotion),
    [summaryMotion]
  );
  const offlineAnimatedStyle = useMemo(
    () => toAnimatedStyle(offlineMotion),
    [offlineMotion]
  );
  const actionsAnimatedStyle = useMemo(
    () => toAnimatedStyle(actionsMotion),
    [actionsMotion]
  );
  const reviewAnimatedStyle = useMemo(
    () => toAnimatedStyle(reviewMotion),
    [reviewMotion]
  );

  return {
    headerAnimatedStyle,
    summaryAnimatedStyle,
    offlineAnimatedStyle,
    actionsAnimatedStyle,
    reviewAnimatedStyle,
  };
}
