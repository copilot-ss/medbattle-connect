import { Pressable, Text, View } from 'react-native';
import styles from '../styles/QuizScreen.styles';

export default function QuizHeader({
  difficultyLabel,
  totalQuestions,
  questionLimit,
  onExit,
}) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerMeta}>
          {difficultyLabel} - {(totalQuestions || questionLimit) || 0} Fragen
        </Text>
      </View>
      <Pressable onPress={onExit} style={styles.exitButton}>
        <Text style={styles.exitButtonText}>✕</Text>
      </Pressable>
    </View>
  );
}
