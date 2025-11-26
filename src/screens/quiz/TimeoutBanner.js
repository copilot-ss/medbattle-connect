import { Text, View } from 'react-native';
import styles from '../styles/QuizScreen.styles';

export default function TimeoutBanner({ timedOut, isAnswerLocked }) {
  if (!timedOut || !isAnswerLocked) {
    return null;
  }
  return (
    <View style={styles.timeoutBanner}>
      <Text style={styles.timeoutTitle}>Zeit abgelaufen!</Text>
      <Text style={styles.timeoutSubtitle}>
        Reagiere schneller, um deinen Combo-Bonus zu sichern.
      </Text>
    </View>
  );
}
