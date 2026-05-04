import { Image, Text, View } from 'react-native';
import { getQuestionImageAsset } from '../../data/questionImageAssets';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/QuizScreen.styles';

function resolveImageSource(imageSource, imageUrl) {
  if (typeof imageSource === 'number') {
    return imageSource;
  }
  if (imageSource && typeof imageSource === 'object') {
    return imageSource;
  }
  if (typeof imageUrl !== 'string') {
    return null;
  }
  const trimmed = imageUrl.trim();
  const localAsset = getQuestionImageAsset(trimmed);
  if (localAsset) {
    return localAsset;
  }
  return /^https?:\/\//i.test(trimmed) ? { uri: trimmed } : null;
}

export default function QuestionCard({
  activeIndex,
  totalQuestions,
  question,
  imageSource = null,
  imageUrl = null,
  imageAlt = null,
  imageOnly = false,
  metaLabel = null,
  showProgress = true,
}) {
  const { t } = useTranslation();
  const resolvedImageSource = resolveImageSource(imageSource, imageUrl);
  const visibleQuestion =
    typeof question === 'string' && question.trim() ? question.trim() : '';
  const shouldShowQuestion = Boolean(visibleQuestion && !(imageOnly && resolvedImageSource));
  const current = Math.min(activeIndex + 1, totalQuestions || activeIndex + 1);
  const total = Math.max(totalQuestions, current);
  const resolvedMeta =
    typeof metaLabel === 'string' && metaLabel.trim()
      ? metaLabel
      : showProgress
      ? t('Frage {current}/{total}', { current, total })
      : null;

  return (
    <View style={styles.questionCard}>
      {resolvedMeta ? (
        <Text style={styles.questionMeta}>
          {resolvedMeta}
        </Text>
      ) : null}
      {resolvedImageSource ? (
        <Image
          source={resolvedImageSource}
          style={[
            styles.questionImage,
            imageOnly ? styles.questionImageOnly : null,
          ]}
          resizeMode="contain"
          accessibilityLabel={
            typeof imageAlt === 'string' && imageAlt.trim() ? imageAlt.trim() : visibleQuestion
          }
        />
      ) : null}
      {shouldShowQuestion ? (
        <Text style={styles.questionText}>{visibleQuestion}</Text>
      ) : null}
    </View>
  );
}
