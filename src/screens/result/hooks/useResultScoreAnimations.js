import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated } from 'react-native';

export default function useResultScoreAnimations({
  isPerfectScore,
  showZeroScoreAnimation,
}) {
  const perfectScoreMotion = useRef(new Animated.Value(0)).current;
  const [showPerfectTopAnimation, setShowPerfectTopAnimation] = useState(false);
  const [showZeroGhostOverlay, setShowZeroGhostOverlay] = useState(false);

  useEffect(() => {
    if (!isPerfectScore) {
      perfectScoreMotion.stopAnimation();
      perfectScoreMotion.setValue(0);
      setShowPerfectTopAnimation(false);
      return undefined;
    }

    perfectScoreMotion.setValue(0);
    const animation = Animated.timing(perfectScoreMotion, {
      toValue: 1,
      duration: 650,
      useNativeDriver: true,
    });

    animation.start();
    return () => animation.stop();
  }, [isPerfectScore, perfectScoreMotion]);

  useEffect(() => {
    if (!isPerfectScore) {
      return undefined;
    }

    setShowPerfectTopAnimation(true);
    const timeoutId = setTimeout(() => {
      setShowPerfectTopAnimation(false);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [isPerfectScore]);

  useEffect(() => {
    if (!showZeroScoreAnimation) {
      setShowZeroGhostOverlay(false);
      return undefined;
    }

    setShowZeroGhostOverlay(true);
    const timeoutId = setTimeout(() => {
      setShowZeroGhostOverlay(false);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [showZeroScoreAnimation]);

  const perfectScoreAnimatedStyle = useMemo(
    () => (isPerfectScore
      ? {
          transform: [
            {
              translateY: perfectScoreMotion.interpolate({
                inputRange: [0, 1],
                outputRange: [-46, 0],
              }),
            },
          ],
          opacity: perfectScoreMotion.interpolate({
            inputRange: [0, 0.2, 1],
            outputRange: [0, 1, 1],
          }),
        }
      : null),
    [isPerfectScore, perfectScoreMotion]
  );

  return {
    perfectScoreAnimatedStyle,
    showPerfectTopAnimation,
    showZeroGhostOverlay,
  };
}
