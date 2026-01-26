import { Pressable, Text, View } from 'react-native';
import styles from '../styles/HomeScreen.styles';

export default function HomeHeader({
  isOffline,
  onOpenFriends,
  userName,
  isGuest,
}) {
  const resolvedName = typeof userName === 'string' ? userName.trim() : '';
  const displayName = isGuest ? 'Guest' : resolvedName;

  return (
    <View style={styles.header}>
      <View style={styles.headerTitle}>
        <Text style={styles.welcomeText} numberOfLines={1}>
          Welcome back
        </Text>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {displayName}
        </Text>
      </View>

      <View style={styles.quickActions}>
        <Pressable
          onPress={onOpenFriends}
          style={[styles.friendsButton, isOffline ? styles.quickActionDisabled : null]}
          disabled={isOffline}
        >
          <Text style={styles.friendsEmoji}>{'\u{1F9C2}'}</Text>
        </Pressable>
      </View>
    </View>
  );
}
