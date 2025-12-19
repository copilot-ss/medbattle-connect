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
  const isQuickPlay = difficultyLabel === 'Quick Play';

  return (
    <View style={styles.header}>
      <View>
        <Text style={isQuickPlay ? styles.headerQuick : styles.headerMeta}>
          {isQuickPlay ? 'Quick Play' : `${difficultyLabel} - ${total} Fragen`}
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
