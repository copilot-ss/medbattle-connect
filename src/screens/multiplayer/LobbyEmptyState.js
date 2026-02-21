import { Text, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/MultiplayerLobbyScreen.styles';

export default function LobbyEmptyState() {
  const { t } = useTranslation();

  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{t('Noch keine offenen Battles')}</Text>
    </View>
  );
}
