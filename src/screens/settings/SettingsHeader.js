import { Pressable, Text, View } from 'react-native';
import styles from '../styles/SettingsScreen.styles';

export default function SettingsHeader({
  onClose,
  title = 'Einstellungen',
  showClose = true,
}) {
  const canClose = showClose && typeof onClose === 'function';

  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
      {canClose ? (
        <Pressable
          onPress={onClose}
          style={styles.headerCloseButton}
          accessibilityLabel="Schliessen"
        >
          <Text style={styles.headerCloseText}>X</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
