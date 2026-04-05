import { View, Text, Image } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import { BubbleReveal } from './ResultWidgets';
import styles from '../styles/ResultScreen.styles';

const TIMEOUT_PILLS_ICON = require('../../../assets/animations/pharmacology/sleeping_pills_12082332.png');

function getBoostLabel(boostId, t) {
  if (boostId === 'joker_5050') {
    return '50/50';
  }
  if (boostId === 'freeze_time') {
    return t('Zeit einfrieren');
  }
  return null;
}

export default function ResultReviewList({
  items,
  title = null,
  answerLabel = null,
  entranceKey = '',
  baseDelay = 0,
} = {}) {
  const { t } = useTranslation();
  const safeItems = Array.isArray(items) ? items : [];
  const resolvedTitle = title || t('Quiz Zusammenfassung');
  const resolvedAnswerLabel = answerLabel || t('Deine Antwort');

  if (!safeItems.length) {
    return null;
  }

  return (
    <View style={styles.reviewSection}>
      <BubbleReveal delay={baseDelay} resetKey={`${entranceKey}:review-title`}>
        <Text style={styles.reviewTitle}>{resolvedTitle}</Text>
      </BubbleReveal>
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
          <BubbleReveal
            key={item.questionId ?? `${idx}`}
            delay={baseDelay + 90 * (idx + 1)}
            resetKey={`${entranceKey}:review-card:${idx}`}
            style={[
              styles.reviewCard,
              item.timedOut
                ? styles.reviewCardTimedOut
                : item.isCorrect
                  ? styles.reviewCardCorrect
                  : styles.reviewCardWrong,
            ]}
          >
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewIndex}>
                {t('Frage {index}', { index: idx + 1 })}
              </Text>
              <Text style={[styles.reviewStatus, statusStyle]}>{statusLabel}</Text>
            </View>
            <Text style={styles.reviewQuestion}>{item.question}</Text>
            <View style={styles.reviewAnswers}>
              <Text style={styles.reviewLabel}>{resolvedAnswerLabel}</Text>
              <View style={styles.reviewAnswerRow}>
                <Text style={[styles.reviewAnswer, styles.reviewAnswerValue]}>
                  {selectedAnswer}
                </Text>
                {item.timedOut ? (
                  <Image
                    source={TIMEOUT_PILLS_ICON}
                    style={styles.reviewAnswerTimeoutIcon}
                    resizeMode="contain"
                  />
                ) : null}
              </View>
              <Text style={styles.reviewLabel}>{t('Richtig')}</Text>
              <Text style={[styles.reviewAnswer, styles.reviewAnswerCorrect]}>
                {item.correctAnswer ?? '-'}
              </Text>
              {Array.isArray(item.boostsUsed) && item.boostsUsed.length ? (
                <>
                  <Text style={styles.reviewLabel}>{t('Joker benutzt')}</Text>
                  <View style={styles.reviewBoostRow}>
                    {item.boostsUsed.map((boostId) => {
                      const boostLabel = getBoostLabel(boostId, t);
                      if (!boostLabel) {
                        return null;
                      }
                      return (
                        <View
                          key={`${item.questionId ?? idx}-${boostId}`}
                          style={styles.reviewBoostChip}
                        >
                          <Text style={styles.reviewBoostChipText}>{boostLabel}</Text>
                        </View>
                      );
                    })}
                  </View>
                </>
              ) : null}
            </View>
            <Text style={styles.reviewExplanationLabel}>{t('Erklärung')}</Text>
            <Text style={styles.reviewExplanationText}>{explanationText}</Text>
          </BubbleReveal>
        );
      })}
    </View>
  );
}
