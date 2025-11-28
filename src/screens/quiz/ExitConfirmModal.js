import { Pressable, Text, View } from 'react-native';
import styles from '../styles/QuizScreen.styles';

export default function ExitConfirmModal({
  visible,
  isMultiplayer,
  onCancel,
  onConfirm,
}) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalCard}>
        <Text style={styles.modalTitle}>Quiz beenden?</Text>
        <Text style={styles.modalMessage}>
          {isMultiplayer
            ? 'Das laufende Duell gilt als aufgegeben. Moechtest du wirklich abbrechen?'
            : 'Nicht beantwortete Fragen zaehlen nicht. Moechtest du wirklich abbrechen?'}
        </Text>
        <View style={styles.modalActions}>
          <Pressable
            onPress={onCancel}
            style={[styles.modalButton, styles.modalButtonContinue]}
          >
            <Text style={styles.modalButtonContinueText}>Weiter spielen</Text>
          </Pressable>
          <Pressable
            onPress={onConfirm}
            style={[styles.modalButton, styles.modalButtonExit]}
          >
            <Text style={styles.modalButtonExitText}>Beenden</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
