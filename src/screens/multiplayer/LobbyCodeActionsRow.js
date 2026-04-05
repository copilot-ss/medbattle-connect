import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/MultiplayerLobbyScreen.styles';

export default function LobbyCodeActionsRow({
  currentJoinCode,
  copied,
  onCopyCode,
  questionLimit,
}) {
  return (
    <View style={styles.codeActionsRow}>
      <Pressable
        onPress={onCopyCode}
        style={[styles.codeBadge, copied ? styles.codeBadgeSuccess : null]}
      >
        <View style={styles.codeBadgeInline}>
          <Ionicons
            name={copied ? 'checkmark-circle' : 'copy-outline'}
            size={14}
            color={copied ? '#06140D' : '#DDF5FF'}
          />
          <Text style={styles.codeBadgeText}>{currentJoinCode}</Text>
        </View>
      </Pressable>
      <View style={styles.codeSettingsWrap}>
        <Text style={styles.codeSettingText}>
          {`Questions: ${questionLimit}`}
        </Text>
      </View>
    </View>
  );
}
