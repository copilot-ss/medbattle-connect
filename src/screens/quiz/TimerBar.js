import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { getTimerProgressFillStyle } from '../styles/QuizScreen.styles';
import styles from '../styles/QuizScreen.styles';

export default function TimerBar({ matchIsActive, timeLeftMs, progressPercent, timedOut }) {
  const progressValue = useRef(new Animated.Value(0)).current;
  const targetProgress = useMemo(() => {
    const parsed = Number.parseFloat(progressPercent);
    if (!Number.isFinite(parsed)) {
      return 0;
    }
    return Math.max(0, Math.min(100, parsed));
  }, [progressPercent]);
  const animatedWidth = useMemo(
    () =>
      progressValue.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
      }),
    [progressValue]
  );

  useEffect(() => {
    progressValue.stopAnimation();
    Animated.timing(progressValue, {
      toValue: matchIsActive ? targetProgress : 0,
      duration: 120,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [matchIsActive, progressValue, targetProgress]);

  return (
    <View style={styles.timerSection}>
      <View style={styles.timerRow}>
        <Text style={styles.timerValue}>
          {matchIsActive ? `${(Math.max(timeLeftMs, 0) / 1000).toFixed(1)}s` : '--'}
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <Animated.View style={getTimerProgressFillStyle(animatedWidth, timedOut)} />
      </View>
    </View>
  );
}
