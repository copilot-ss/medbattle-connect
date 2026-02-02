import { Pressable, Text, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/QuizScreen.styles';

export default function QuizHeader({
  difficultyLabel,
  totalQuestions,
  questionLimit,
  activeIndex = 0,
  onExit,
  showMeta = true,
  showProgress = true,
  categoryLabel = '',
}) {
  const { t } = useTranslation();
  const total = totalQuestions || questionLimit || 0;
  const isQuickPlay = difficultyLabel === 'Quick Play';
  const resolvedDifficulty = difficultyLabel ? t(difficultyLabel) : '';
  const resolvedCategory = categoryLabel || t('Quiz');

  return (
    <View style={styles.header}>
      <View>
        {showMeta ? (
          <Text style={isQuickPlay ? styles.headerQuick : styles.headerMeta}>
            {isQuickPlay
              ? t('Quick Play')
              : `${resolvedDifficulty} - ${total} ${t('Fragen')}`}
          </Text>
        ) : null}
        {showProgress ? (
          <Text style={styles.headerCategory}>{resolvedCategory}</Text>
        ) : null}
      </View>
      <Pressable onPress={onExit} style={styles.exitButton}>
        <Text style={styles.exitButtonText}>X</Text>
      </Pressable>
    </View>
  );
}
