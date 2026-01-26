import { Pressable, Text } from 'react-native';
import styles from '../styles/HomeScreen.styles';

export default function ActiveLobbyBanner({ activeLobby, hasActiveLobby, onOpenLobby }) {
  if (!hasActiveLobby) {
    return null;
  }

  return (
    <Pressable
      style={styles.activeLobbyBanner}
      onPress={onOpenLobby}
    >
      <Text style={styles.activeLobbyTitle}>
        Lobby {activeLobby?.players ?? 1}/{activeLobby?.capacity ?? 2}
      </Text>
      <Text style={styles.activeLobbyCode}>{activeLobby?.code ?? ''}</Text>
    </Pressable>
  );
}
