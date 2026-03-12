import { Text, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/QuizScreen.styles';

export default function QuizHeader({
  difficultyLabel,
  totalQuestions,
  questionLimit,
  showMeta = true,
  showProgress = true,
  categoryLabel = '',
}) {
  const { t } = useTranslation();
  const total = totalQuestions || questionLimit || 0;
  const isQuickPlay = difficultyLabel === 'Quick Play';
  const resolvedDifficulty = difficultyLabel ? t(difficultyLabel) : '';
  const resolvedCategory = categoryLabel || t('Quiz');
  const metaLabel = isQuickPlay
    ? t('Quick Play')
    : resolvedDifficulty
      ? `${resolvedDifficulty} - ${total} ${t('Fragen')}`
      : `${total} ${t('Fragen')}`;
  const headerLabel = showProgress ? resolvedCategory : showMeta ? metaLabel : resolvedCategory;
  const headerTextStyle = showProgress ? styles.headerTitleLine : styles.headerMetaLine;

  return (
    <View style={styles.header}>
      <View style={styles.headerInfo}>
        <Text
          style={headerTextStyle}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {headerLabel}
        </Text>
      </View>
    </View>
  );
}
