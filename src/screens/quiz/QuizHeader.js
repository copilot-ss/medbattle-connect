import { Pressable, Text, View } from 'react-native';
import styles from '../styles/QuizScreen.styles';

export default function QuizHeader({
  difficultyLabel,
  totalQuestions,
  questionLimit,
  activeIndex = 0,
  onExit,
}) {
  const total = totalQuestions || questionLimit || 0;
  const current = Math.min(activeIndex + 1, total || activeIndex + 1);

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerMeta}>
          {difficultyLabel} - {total} Fragen
        </Text>
        <View style={styles.headerProgressPill}>
          <Text style={styles.headerProgressText}>
            {current}/{total || '?'}
          </Text>
        </View>
      </View>
      <Pressable onPress={onExit} style={styles.exitButton}>
        <Text style={styles.exitButtonText}>X</Text>
      </Pressable>
    </View>
  );
}
