import { Pressable, Text, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/MultiplayerLobbyScreen.styles';

export default function LobbyCreateAction({
  creating,
  userId,
  onCreateMatch,
}) {
  const { t } = useTranslation();

  return (
    <View style={styles.actionsRow}>
      <Pressable
        style={[
          styles.primaryAction,
          creating ? styles.actionDisabled : null,
        ]}
        onPress={onCreateMatch}
        disabled={creating || !userId}
      >
        <Text style={styles.primaryActionText}>
          {creating ? t('Erstelle Lobby ...') : t('Lobby erstellen')}
        </Text>
      </Pressable>
    </View>
  );
}
