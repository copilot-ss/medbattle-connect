import { Pressable, Text, View } from 'react-native';
import styles from '../styles/SettingsScreen.styles';

export default function SettingsHeader({ onClose }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Einstellungen</Text>
      <Pressable
        onPress={onClose}
        style={styles.headerCloseButton}
        accessibilityLabel="Schliessen"
      >
        <Text style={styles.headerCloseText}>X</Text>
      </Pressable>
    </View>
  );
}
