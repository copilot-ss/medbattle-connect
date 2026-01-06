import { Text, View } from 'react-native';
import styles from '../styles/QuizScreen.styles';

export default function TimeoutBanner({ timedOut, isAnswerLocked }) {
  if (!timedOut || !isAnswerLocked) {
    return null;
  }
  return (
    <View style={styles.timeoutBanner}>
      <Text style={styles.timeoutTitle}>Zeit abgelaufen!</Text>
    </View>
  );
}
