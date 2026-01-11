import { Pressable, Text, View } from 'react-native';
import styles from '../styles/HomeScreen.styles';

export default function ActiveLobbyBanner({ activeLobby, hasActiveLobby, onOpenLobby }) {
  return (
    <View style={styles.activeLobbyAnchor} pointerEvents="box-none">
      {hasActiveLobby ? (
        <Pressable
          style={styles.activeLobbyBanner}
          onPress={onOpenLobby}
        >
          <Text style={styles.activeLobbyTitle}>
            Lobby {activeLobby?.players ?? 1}/{activeLobby?.capacity ?? 2}
          </Text>
          <Text style={styles.activeLobbyCode}>{activeLobby?.code ?? ''}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
