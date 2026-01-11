import { Image, Text, View } from 'react-native';
import styles from '../styles/MultiplayerLobbyScreen.styles';

const EMPTY_BATTLES_ICON = require('../../../assets/animations/no-battles.gif');

export default function LobbyEmptyState() {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>Noch keine offenen Battles</Text>
      <Image source={EMPTY_BATTLES_ICON} style={styles.emptyIcon} resizeMode="contain" />
    </View>
  );
}
