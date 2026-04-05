import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/SettingsScreen.styles';

export default function FriendRemoveConfirmModal({
  visible,
  friendName,
  loading = false,
  onCancel,
  onConfirm,
}) {
  const { locale, t } = useTranslation();

  if (!visible) {
    return null;
  }

  const isGerman = locale === 'de';
  const resolvedFriendName = friendName || t('Freund');
  const message = isGerman
    ? `Moechtest du ${resolvedFriendName} wirklich aus deinen Freunden entfernen?`
    : `Do you really want to remove ${resolvedFriendName} from your friends?`;

  return (
    <View style={styles.friendRemoveConfirmOverlay}>
      <Pressable
        style={styles.friendRemoveConfirmBackdrop}
        onPress={loading ? undefined : onCancel}
      />
      <View style={styles.friendRemoveConfirmCard}>
        <Text style={styles.friendRemoveConfirmMessage}>{message}</Text>
        <View style={styles.friendRemoveConfirmActions}>
          <Pressable
            onPress={onCancel}
            disabled={loading}
            style={[
              styles.friendRemoveConfirmButton,
              styles.friendRemoveConfirmCancelButton,
              loading ? styles.friendRemoveConfirmButtonDisabled : null,
            ]}
          >
            <Text style={styles.friendRemoveConfirmCancelText}>{t('Abbrechen')}</Text>
          </Pressable>
          <Pressable
            onPress={onConfirm}
            disabled={loading}
            style={[
              styles.friendRemoveConfirmButton,
              styles.friendRemoveConfirmDangerButton,
              loading ? styles.friendRemoveConfirmButtonDisabled : null,
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF1F4" />
            ) : (
              <Text style={styles.friendRemoveConfirmDangerText}>{t('Entfernen')}</Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}
