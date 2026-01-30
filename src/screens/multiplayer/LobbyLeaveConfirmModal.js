import { Pressable, Text, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/MultiplayerLobbyScreen.styles';

export default function LobbyLeaveConfirmModal({
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
        <Text style={styles.modalTitle}>{t('Lobby verlassen?')}</Text>
        <View style={styles.modalActions}>
          <Pressable
            onPress={onCancel}
            style={[styles.modalButton, styles.modalButtonContinue]}
          >
            <Text style={styles.modalButtonContinueText}>{t('Bleiben')}</Text>
          </Pressable>
          <Pressable
            onPress={onConfirm}
            style={[styles.modalButton, styles.modalButtonExit]}
          >
            <Text style={styles.modalButtonExitText}>{t('Verlassen')}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
