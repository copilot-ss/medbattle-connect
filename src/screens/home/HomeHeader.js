import { Pressable, Text, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/HomeScreen.styles';

export default function HomeHeader({
  isOffline,
  onOpenFriends,
  coins = 0,
  userName,
  isGuest,
}) {
  const { t } = useTranslation();
  const resolvedName = typeof userName === 'string' ? userName.trim() : '';
  const displayName = isGuest ? t('Gast') : resolvedName;
  const welcomeLine = displayName
    ? t('Willkommen zurück, {name}', { name: displayName })
    : t('Willkommen zurück');

  return (
    <View style={styles.header}>
      <View style={styles.headerTitle}>
        <Text style={styles.welcomeText} numberOfLines={1}>
          {welcomeLine}
        </Text>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {t("Los geht's!")}
        </Text>
      </View>

      <View style={styles.quickActions}>
        <View style={styles.coinBadge}>
          <Text style={styles.coinEmoji}>{'\u{1FA99}'}</Text>
          <Text style={styles.coinBadgeText}>{coins}</Text>
        </View>
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
