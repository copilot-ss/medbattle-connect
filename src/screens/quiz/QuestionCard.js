import { Text, View } from 'react-native';
import styles from '../styles/QuizScreen.styles';

export default function QuestionCard({ activeIndex, totalQuestions, question }) {
  return (
    <View style={styles.questionCard}>
      <Text style={styles.questionMeta}>
        Frage {Math.min(activeIndex + 1, totalQuestions)} / {totalQuestions}
      </Text>
      <Text style={styles.questionText}>{question}</Text>
    </View>
  );
}
