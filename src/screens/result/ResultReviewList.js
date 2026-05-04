import { useState } from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { getQuestionImageAsset } from '../../data/questionImageAssets';
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

function resolveImageSource(item) {
  const imageSource = item?.imageSource ?? item?.image_asset ?? null;
  if (typeof imageSource === 'number') {
    return imageSource;
  }
  if (imageSource && typeof imageSource === 'object') {
    return imageSource;
  }
  if (typeof item?.imageUrl === 'string') {
    const trimmed = item.imageUrl.trim();
    const localAsset = getQuestionImageAsset(trimmed);
    if (localAsset) {
      return localAsset;
    }
    if (/^https?:\/\//i.test(trimmed)) {
      return { uri: trimmed };
    }
  }
  if (typeof item?.image_url === 'string') {
    const trimmed = item.image_url.trim();
    const localAsset = getQuestionImageAsset(trimmed);
    if (localAsset) {
      return localAsset;
    }
    if (/^https?:\/\//i.test(trimmed)) {
      return { uri: trimmed };
    }
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
  const [expandedQuestionKey, setExpandedQuestionKey] = useState(null);

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

        const imageSource = resolveImageSource(item);
        const imageAlt =
          typeof item.imageAlt === 'string' && item.imageAlt.trim()
            ? item.imageAlt.trim()
            : typeof item.image_alt === 'string' && item.image_alt.trim()
            ? item.image_alt.trim()
            : item.question;
        const imageOnly =
          item.imageOnly === true ||
          item.image_only === true ||
          item.promptMode === 'image_only' ||
          item.prompt_mode === 'image_only';
        const visibleQuestion =
          typeof item.question === 'string' && item.question.trim()
            ? item.question.trim()
            : '';
        const shouldShowQuestion = Boolean(visibleQuestion && !(imageOnly && imageSource));
        const otherPlayerAnswers = Array.isArray(item.otherPlayerAnswers)
          ? item.otherPlayerAnswers
          : [];
        const hasOtherPlayerAnswers = otherPlayerAnswers.length > 0;
        const questionKey = String(item.questionId ?? item.index ?? idx);
        const isExpanded = expandedQuestionKey === questionKey;
        const handleToggleOtherAnswers = hasOtherPlayerAnswers
          ? () => {
              setExpandedQuestionKey((prev) => (prev === questionKey ? null : questionKey));
            }
          : undefined;

        return (
          <BubbleReveal
            key={questionKey}
            delay={baseDelay + 90 * (idx + 1)}
            resetKey={`${entranceKey}:review-card:${idx}`}
          >
            <Pressable
              onPress={handleToggleOtherAnswers}
              disabled={!hasOtherPlayerAnswers}
              accessibilityRole={hasOtherPlayerAnswers ? 'button' : undefined}
              accessibilityState={hasOtherPlayerAnswers ? { expanded: isExpanded } : undefined}
              style={({ pressed }) => [
                styles.reviewCard,
                item.timedOut
                  ? styles.reviewCardTimedOut
                  : item.isCorrect
                    ? styles.reviewCardCorrect
                    : styles.reviewCardWrong,
                hasOtherPlayerAnswers ? styles.reviewCardInteractive : null,
                pressed ? styles.reviewCardPressed : null,
              ]}
            >
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewIndex}>
                {t('Frage {index}', { index: idx + 1 })}
              </Text>
              <Text style={[styles.reviewStatus, statusStyle]}>{statusLabel}</Text>
            </View>
            {imageSource ? (
              <Image
                source={imageSource}
                style={styles.reviewImage}
                resizeMode="contain"
                accessibilityLabel={imageAlt}
              />
            ) : null}
            {shouldShowQuestion ? (
              <Text style={styles.reviewQuestion}>{visibleQuestion}</Text>
            ) : null}
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
            {isExpanded ? (
              <View style={styles.reviewOtherAnswers}>
                <Text style={styles.reviewOtherAnswersTitle}>
                  {t('Andere Antworten')}
                </Text>
                {otherPlayerAnswers.map((answer) => {
                  const otherStatusLabel = answer.timedOut
                    ? t('Timeout')
                    : answer.isCorrect
                      ? t('Richtig')
                      : t('Falsch');
                  const otherStatusStyle = answer.timedOut
                    ? styles.reviewStatusTimedOut
                    : answer.isCorrect
                      ? styles.reviewStatusCorrect
                      : styles.reviewStatusWrong;

                  return (
                    <View key={`${questionKey}-${answer.key}`} style={styles.reviewOtherAnswerRow}>
                      <View style={styles.reviewOtherAnswerMeta}>
                        <Text style={styles.reviewOtherAnswerName} numberOfLines={1}>
                          {answer.name}
                        </Text>
                        <Text style={[styles.reviewOtherAnswerStatus, otherStatusStyle]}>
                          {otherStatusLabel}
                        </Text>
                      </View>
                      <Text style={styles.reviewOtherAnswerText}>
                        {answer.selectedOption ?? t('Keine Antwort')}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : null}
            <Text style={styles.reviewExplanationLabel}>{t('Erklärung')}</Text>
            <Text style={styles.reviewExplanationText}>{explanationText}</Text>
            </Pressable>
          </BubbleReveal>
        );
      })}
    </View>
  );
}
