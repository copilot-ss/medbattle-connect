import { Text, View } from 'react-native';
import { getTimerProgressFillStyle } from '../styles/QuizScreen.styles';
import styles from '../styles/QuizScreen.styles';

export default function TimerBar({ matchIsActive, timeLeftMs, progressPercent, timedOut }) {
  return (
    <View style={styles.timerSection}>
      <View style={styles.timerRow}>
        <Text style={styles.timerValue}>
          {matchIsActive ? `${(Math.max(timeLeftMs, 0) / 1000).toFixed(1)}s` : '--'}
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={getTimerProgressFillStyle(progressPercent, timedOut)} />
      </View>
    </View>
  );
}
