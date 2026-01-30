import { View, Text } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/ResultScreen.styles';

export default function ResultReviewList({ items } = {}) {
  const { t } = useTranslation();
  const safeItems = Array.isArray(items) ? items : [];

  if (!safeItems.length) {
    return null;
  }

  return (
    <View style={styles.reviewSection}>
      <Text style={styles.reviewTitle}>{t('Quiz Review')}</Text>
      {safeItems.map((item, idx) => {
        const statusLabel = item.timedOut
          ? t('Timeout')
          : item.isCorrect
          ? t('Richtig')
          : t('Falsch');
        const statusStyle = item.timedOut
          ? styles.reviewStatusTimedOut
          : item.isCorrect
          ? styles.reviewStatusCorrect
          : styles.reviewStatusWrong;
        const selectedAnswer = item.timedOut
          ? t('Zeit abgelaufen')
          : item.selectedOption ?? t('Keine Antwort');
        const explanationText =
          typeof item.explanation === 'string' && item.explanation.trim()
            ? item.explanation
            : t('Noch keine Erklärung hinterlegt.');

        return (
          <View
            key={item.questionId ?? `${idx}`}
            style={styles.reviewCard}
          >
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewIndex}>
                {t('Frage {index}', { index: idx + 1 })}
              </Text>
              <Text style={[styles.reviewStatus, statusStyle]}>{statusLabel}</Text>
            </View>
            <Text style={styles.reviewQuestion}>{item.question}</Text>
            <View style={styles.reviewAnswers}>
              <Text style={styles.reviewLabel}>{t('Deine Antwort')}</Text>
              <Text style={styles.reviewAnswer}>{selectedAnswer}</Text>
              <Text style={styles.reviewLabel}>{t('Richtig')}</Text>
              <Text style={[styles.reviewAnswer, styles.reviewAnswerCorrect]}>
                {item.correctAnswer ?? '-'}
              </Text>
            </View>
            <Text style={styles.reviewExplanationLabel}>{t('Erklärung')}</Text>
            <Text style={styles.reviewExplanationText}>{explanationText}</Text>
          </View>
        );
      })}
    </View>
  );
}
