import { Text, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/QuizScreen.styles';

export default function QuestionCard({
  activeIndex,
  totalQuestions,
  question,
  showProgress = true,
}) {
  const { t } = useTranslation();
  const current = Math.min(activeIndex + 1, totalQuestions || activeIndex + 1);
  const total = Math.max(totalQuestions, current);

  return (
    <View style={styles.questionCard}>
      {showProgress ? (
        <Text style={styles.questionMeta}>
          {t('Frage {current}/{total}', { current, total })}
        </Text>
      ) : null}
      <Text style={styles.questionText}>{question}</Text>
    </View>
  );
}
