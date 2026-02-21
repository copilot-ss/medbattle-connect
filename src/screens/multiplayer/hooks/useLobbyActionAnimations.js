import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export default function useLobbyActionAnimations({ isHostWaiting }) {
  const startPulseValue = useRef(new Animated.Value(0)).current;
  const startPulseLoopRef = useRef(null);
  const joinPressValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isHostWaiting) {
      if (startPulseLoopRef.current) {
        startPulseLoopRef.current.stop();
        startPulseLoopRef.current = null;
      }
      startPulseValue.setValue(0);
      return;
    }

    startPulseValue.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(startPulseValue, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(startPulseValue, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    startPulseLoopRef.current = loop;
    loop.start();

    return () => {
      loop.stop();
      if (startPulseLoopRef.current === loop) {
        startPulseLoopRef.current = null;
      }
    };
  }, [isHostWaiting, startPulseValue]);

  const startPulseStyle = useMemo(
    () => ({
      transform: [
        { scale: 0.9 },
        {
          scale: startPulseValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.96, 1.1],
          }),
        },
      ],
    }),
    [startPulseValue]
  );

  const handleJoinPressIn = useCallback(() => {
    Animated.timing(joinPressValue, {
      toValue: 1,
      duration: 140,
      useNativeDriver: false,
    }).start();
  }, [joinPressValue]);

  const handleJoinPressOut = useCallback(() => {
    Animated.timing(joinPressValue, {
      toValue: 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [joinPressValue]);

  const joinPressStyle = useMemo(
    () => ({
      transform: [
        {
          scale: joinPressValue.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.06],
          }),
        },
      ],
      backgroundColor: joinPressValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['#38BDF8', '#7DD3FC'],
      }),
    }),
    [joinPressValue]
  );

  return {
    startPulseStyle,
    handleJoinPressIn,
    handleJoinPressOut,
    joinPressStyle,
  };
}
