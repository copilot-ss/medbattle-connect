import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/HomeScreen.styles';

export default function HomeHeader({
  isOffline,
  onOpenLeaderboard,
  onOpenFriends,
  onOpenSettings,
}) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>MedBattle</Text>

      <View style={styles.quickActions}>
        <Pressable
          onPress={onOpenLeaderboard}
          style={[styles.leaderboardButton, isOffline ? styles.quickActionDisabled : null]}
          disabled={isOffline}
        >
          <Ionicons name="trophy" size={22} color="#FACC15" style={styles.leaderboardIcon} />
        </Pressable>

        <Pressable
          onPress={onOpenFriends}
          style={[styles.friendsButton, isOffline ? styles.quickActionDisabled : null]}
          disabled={isOffline}
        >
          <Text style={styles.friendsEmoji}>{'\u{1F9C2}'}</Text>
        </Pressable>

        <Pressable
          onPress={onOpenSettings}
          style={[styles.menuButton, isOffline ? styles.quickActionDisabled : null]}
          disabled={isOffline}
        >
          <Ionicons name="settings" size={22} color="#E2E8F0" style={styles.menuIcon} />
        </Pressable>
      </View>
    </View>
  );
}
