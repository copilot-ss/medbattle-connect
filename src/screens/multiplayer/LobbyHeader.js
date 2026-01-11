import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/MultiplayerLobbyScreen.styles';

export default function LobbyHeader({
  isCreateOnly,
  closingLobby,
  onNavigateHome,
  onLeaveLobby,
}) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.title}>Multiplayer Arena</Text>
      </View>
      <View style={styles.headerActions}>
        <Pressable
          style={[
            styles.homeButton,
            closingLobby ? styles.actionDisabled : null,
          ]}
          onPress={onNavigateHome}
          disabled={closingLobby}
        >
          <Ionicons name="home" size={18} color="#E2E8F0" />
        </Pressable>
        {isCreateOnly ? (
          <Pressable
            style={[
              styles.closeButton,
              closingLobby ? styles.actionDisabled : null,
            ]}
            onPress={onLeaveLobby}
            disabled={closingLobby}
          >
            <Text style={styles.closeButtonText}>X</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
