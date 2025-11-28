import { Text, View } from 'react-native';
import styles from '../styles/QuizScreen.styles';

export default function QuestionCard({ activeIndex, totalQuestions, question }) {
  const current = Math.min(activeIndex + 1, totalQuestions || activeIndex + 1);
  const total = Math.max(totalQuestions, current);

  return (
    <View style={styles.questionCard}>
      <Text style={styles.questionMeta}>
        Frage {current}/{total}
      </Text>
      <Text style={styles.questionText}>{question}</Text>
    </View>
  );
}
