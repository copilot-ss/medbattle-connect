import { View, Text } from 'react-native';
import styles from '../styles/ResultScreen.styles';

export default function ResultReviewList({ items } = {}) {
  const safeItems = Array.isArray(items) ? items : [];

  if (!safeItems.length) {
    return null;
  }

  return (
    <View style={styles.reviewSection}>
      <Text style={styles.reviewTitle}>Quiz Review</Text>
      {safeItems.map((item, idx) => {
        const statusLabel = item.timedOut
          ? 'Timeout'
          : item.isCorrect
          ? 'Richtig'
          : 'Falsch';
        const statusStyle = item.timedOut
          ? styles.reviewStatusTimedOut
          : item.isCorrect
          ? styles.reviewStatusCorrect
          : styles.reviewStatusWrong;
        const selectedAnswer = item.timedOut
          ? 'Zeit abgelaufen'
          : item.selectedOption ?? 'Keine Antwort';
        const explanationText =
          typeof item.explanation === 'string' && item.explanation.trim()
            ? item.explanation
            : 'Noch keine Erklärung hinterlegt.';

        return (
          <View
            key={item.questionId ?? `${idx}`}
            style={styles.reviewCard}
          >
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewIndex}>{`Frage ${idx + 1}`}</Text>
              <Text style={[styles.reviewStatus, statusStyle]}>{statusLabel}</Text>
            </View>
            <Text style={styles.reviewQuestion}>{item.question}</Text>
            <View style={styles.reviewAnswers}>
              <Text style={styles.reviewLabel}>Deine Antwort</Text>
              <Text style={styles.reviewAnswer}>{selectedAnswer}</Text>
              <Text style={styles.reviewLabel}>Richtig</Text>
              <Text style={[styles.reviewAnswer, styles.reviewAnswerCorrect]}>
                {item.correctAnswer ?? '-'}
              </Text>
            </View>
            <Text style={styles.reviewExplanationLabel}>Erklärung</Text>
            <Text style={styles.reviewExplanationText}>{explanationText}</Text>
          </View>
        );
      })}
    </View>
  );
}
