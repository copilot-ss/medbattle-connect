import { Pressable, Text, View } from 'react-native';
import styles from '../styles/MultiplayerLobbyScreen.styles';

export default function LobbyLeaveConfirmModal({
  visible,
  onCancel,
  onConfirm,
}) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalCard}>
        <Text style={styles.modalTitle}>Lobby verlassen?</Text>
        <View style={styles.modalActions}>
          <Pressable
            onPress={onCancel}
            style={[styles.modalButton, styles.modalButtonContinue]}
          >
            <Text style={styles.modalButtonContinueText}>Bleiben</Text>
          </Pressable>
          <Pressable
            onPress={onConfirm}
            style={[styles.modalButton, styles.modalButtonExit]}
          >
            <Text style={styles.modalButtonExitText}>Verlassen</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
