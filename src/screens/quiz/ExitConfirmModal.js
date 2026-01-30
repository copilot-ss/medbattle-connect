import { Pressable, Text, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/QuizScreen.styles';

export default function ExitConfirmModal({
  visible,
  onCancel,
  onConfirm,
}) {
  const { t } = useTranslation();

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalCard}>
        <Text style={styles.modalTitle}>{t('Quiz beenden?')}</Text>
        <View style={styles.modalActions}>
          <Pressable
            onPress={onCancel}
            style={[styles.modalButton, styles.modalButtonContinue]}
          >
            <Text style={styles.modalButtonContinueText}>{t('Weiter spielen')}</Text>
          </Pressable>
          <Pressable
            onPress={onConfirm}
            style={[styles.modalButton, styles.modalButtonExit]}
          >
            <Text style={styles.modalButtonExitText}>{t('Beenden')}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
