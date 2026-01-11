import { Pressable, Text, View } from 'react-native';
import styles from '../styles/HomeScreen.styles';

export default function OfflineBanner({ isVisible, isChecking, onGoOnline }) {
  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.offlineBanner}>
      <View style={styles.offlineHeader}>
        <View style={styles.offlineDot} />
        <Text style={styles.offlineTitle}>Offline Modus</Text>
      </View>
      <Text style={styles.offlineText}>
        Quick Play bleibt verf\u00fcgbar. Multiplayer, Freunde, Rangliste und Einstellungen sind offline gesperrt.
      </Text>
      <Pressable
        onPress={onGoOnline}
        style={[styles.offlineButton, isChecking ? styles.offlineButtonDisabled : null]}
        disabled={isChecking}
      >
        <Text style={styles.offlineButtonText}>
          {isChecking ? 'Verbindung pr\u00fcfen...' : 'Online gehen'}
        </Text>
      </Pressable>
    </View>
  );
}
