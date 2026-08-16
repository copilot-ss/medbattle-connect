import { memo } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/QuizScreen.styles';

function TimeoutBanner({ timedOut, isAnswerLocked }) {
  const { t } = useTranslation();

  if (!timedOut || !isAnswerLocked) {
    return null;
  }
  return (
    <View style={styles.timeoutBanner}>
      <Text style={styles.timeoutTitle}>{t('Zeit abgelaufen!')}</Text>
    </View>
  );
}

export default memo(TimeoutBanner);
