import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/MultiplayerLobbyScreen.styles';

export default function LobbyOnlineFriendsSection({
  isHostWaiting,
  friendsLoading,
  onlineFriends,
  invitingFriendCodes,
  onInviteFriend,
}) {
  const { t } = useTranslation();
  const showSection = isHostWaiting && (friendsLoading || onlineFriends.length);

  if (!showSection) {
    return null;
  }

  return (
    <View style={styles.onlineFriendsSection}>
      {friendsLoading ? (
        <View style={styles.loadingInline}>
          <ActivityIndicator size="small" color="#60A5FA" />
          <Text style={styles.loadingInlineText}>{t('Suche Freunde ...')}</Text>
        </View>
      ) : null}

      {!friendsLoading && onlineFriends.length ? (
        <View style={styles.onlineFriendList}>
          {onlineFriends.map((friend) => {
            const inviteCode =
              typeof friend?.code === 'string'
                ? friend.code.trim().toUpperCase()
                : null;
            const isInviting =
              Boolean(inviteCode) && Boolean(invitingFriendCodes?.[inviteCode]);

            return (
              <View key={friend.code} style={styles.onlineFriendRow}>
                <View style={styles.onlineFriendIdentity}>
                  <View style={styles.onlineFriendDot} />
                  <Text style={styles.onlineFriendName} numberOfLines={1}>
                    {friend.username ?? t('Freund:in')}
                  </Text>
                </View>
                <Pressable
                  onPress={() => onInviteFriend(friend)}
                  style={[
                    styles.onlineFriendInviteButton,
                    isInviting ? styles.onlineFriendInviteButtonDisabled : null,
                  ]}
                  disabled={isInviting}
                  accessibilityLabel={t('Freund einladen')}
                >
                  {isInviting ? (
                    <ActivityIndicator size="small" color="#6EE7A7" />
                  ) : (
                    <Ionicons
                      name="add"
                      size={18}
                      color="#6EE7A7"
                      style={styles.onlineFriendInviteIcon}
                    />
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
