import { Text, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/QuizScreen.styles';

export default function QuestionCard({
  activeIndex,
  totalQuestions,
  question,
  metaLabel = null,
  showProgress = true,
}) {
  const { t } = useTranslation();
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
      <Text style={styles.questionText}>{question}</Text>
    </View>
  );
}
