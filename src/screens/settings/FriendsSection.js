import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/SettingsScreen.styles';

export default function FriendsSection({
  friends,
  loadingFriends,
  friendRequests,
  loadingFriendRequests,
  respondingFriendRequestId,
  onAcceptFriendRequest,
  onlineFriends,
  loadingOnline,
  onRemoveFriend,
  onOpenAdd,
  showAddButton = false,
}) {
  const { t } = useTranslation();
  const onlineByCode = new Map(
    (onlineFriends ?? []).map((friend) => [
      friend.code,
      friend,
    ])
  );
  const seen = new Set();
  const entries = [];

  (friends ?? []).forEach((friend) => {
    const code = friend?.code ?? '';
    if (!code || seen.has(code)) {
      return;
    }
    const presence = onlineByCode.get(code) ?? null;
    entries.push({
      code,
      name: presence?.username ?? code,
      title: presence?.title ?? null,
      isOnline: Boolean(presence),
      activity: presence?.activity ?? (presence ? 'online' : 'offline'),
      lobby: presence?.lobby ?? null,
      lobbyPlayers: presence?.lobbyPlayers ?? null,
      lobbyCapacity: presence?.lobbyCapacity ?? null,
    });
    seen.add(code);
  });

  (onlineFriends ?? []).forEach((friend) => {
    const code = friend?.code ?? '';
    if (!code || seen.has(code)) {
      return;
    }
    entries.push({
      code,
      name: friend?.username ?? code,
      title: friend?.title ?? null,
      isOnline: true,
      activity: friend?.activity ?? (friend?.lobby ? 'lobby' : 'online'),
      lobby: friend?.lobby ?? null,
      lobbyPlayers: friend?.lobbyPlayers ?? null,
      lobbyCapacity: friend?.lobbyCapacity ?? null,
    });
    seen.add(code);
  });

  entries.sort((a, b) => {
    const rank = (entry) => {
      if (entry.lobby) {
        return 3;
      }
      if (entry.activity === 'quiz') {
        return 2;
      }
      return entry.isOnline ? 1 : 0;
    };
    const diff = rank(b) - rank(a);
    if (diff !== 0) {
      return diff;
    }
    return String(a.name).localeCompare(String(b.name));
  });

  const totalCount = entries.length;
  const onlineCount = entries.filter((entry) => entry.isOnline).length;
  const quizCount = entries.filter((entry) => entry.activity === 'quiz').length;
  const lobbyCount = entries.filter((entry) => entry.lobby).length;
  const statusSummaryParts = [];
  if (totalCount) {
    statusSummaryParts.push(
      t('{onlineCount}/{totalCount} online', { onlineCount, totalCount })
    );
  }
  if (lobbyCount) {
    statusSummaryParts.push(t('{lobbyCount} in Lobby', { lobbyCount }));
  }
  if (quizCount) {
    statusSummaryParts.push(t('{quizCount} im Quiz', { quizCount }));
  }
  const statusSummary = statusSummaryParts.join(' | ');
  const isLoading = loadingFriends || loadingOnline;

  const formatStatus = (entry) => {
    if (entry.lobby) {
      const players = entry.lobbyPlayers;
      const capacity = entry.lobbyCapacity;
      if (Number.isFinite(players) && Number.isFinite(capacity)) {
        return t('Lobby {players}/{capacity}', { players, capacity });
      }
      return t('Lobby');
    }
    if (entry.activity === 'quiz') {
      return t('Im Quiz');
    }
    return entry.isOnline ? t('Online') : t('Offline');
  };

  const resolveDotStyle = (entry) => {
    if (entry.lobby) {
      return styles.friendStatusDotLobby;
    }
    if (entry.activity === 'quiz') {
      return styles.friendStatusDotQuiz;
    }
    return entry.isOnline ? styles.friendStatusDotOnline : styles.friendStatusDotOffline;
  };

  const resolveStatusTextStyle = (entry) => {
    if (entry.lobby) {
      return styles.friendStatusTextLobby;
    }
    if (entry.activity === 'quiz') {
      return styles.friendStatusTextQuiz;
    }
    return entry.isOnline ? styles.friendStatusTextOnline : styles.friendStatusTextOffline;
  };

  const requests = Array.isArray(friendRequests) ? friendRequests : [];
  const showRequestsSection = loadingFriendRequests || requests.length > 0;

  return (
    <View style={[styles.card, styles.squadCard]}>
      <View style={styles.friendList}>
        <View style={styles.friendListHeader}>
          <View style={styles.friendListHeaderText}>
            <Text style={styles.friendListTitle}>{t('Freunde')}</Text>
            {statusSummary ? (
              <Text style={styles.friendListCount}>
                {statusSummary}
              </Text>
            ) : null}
          </View>
          {showAddButton ? (
            <Pressable
              onPress={onOpenAdd}
              style={styles.friendAddButton}
              accessibilityLabel={t('Freunde hinzufügen')}
            >
              <Ionicons name="person-add" size={18} color="#9EDCFF" />
            </Pressable>
          ) : null}
        </View>

        {isLoading ? (
          <View style={styles.friendLoading}>
            <Text style={styles.friendLoadingText}>
              {t('Online-Status wird geladen ...')}
            </Text>
          </View>
        ) : entries.length ? (
          entries.map((friend, index) => (
            <View
              key={friend.code}
              style={[
                styles.friendRow,
                index === entries.length - 1 ? styles.friendRowLast : null,
              ]}
            >
              <View>
                <Text style={styles.friendCodeText}>
                  {friend.name || t('Freund')}
                </Text>
                {friend.title ? (
                  <Text style={styles.friendTitleText}>{t(friend.title)}</Text>
                ) : null}
                <View style={styles.friendStatusRow}>
                  <View style={[styles.friendStatusDot, resolveDotStyle(friend)]} />
                  <Text
                    style={[
                      styles.friendStatusText,
                      resolveStatusTextStyle(friend),
                    ]}
                  >
                    {formatStatus(friend)}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => onRemoveFriend({ code: friend.code })}
                style={styles.friendRemoveButton}
              >
                <Text style={styles.friendRemoveText}>{t('Entfernen')}</Text>
              </Pressable>
            </View>
          ))
        ) : (
          <Text style={styles.friendEmptyText}>
            {t('Noch keine Freunde gespeichert. Teile deinen Code und starte!')}
          </Text>
        )}

        {showRequestsSection ? (
          <>
            <View style={styles.friendListDivider} />
            <View style={styles.friendRequestsSection}>
              <Text style={styles.friendRequestsTitle}>{t('Freundesanfragen')}</Text>
              {loadingFriendRequests ? (
                <View style={styles.friendLoading}>
                  <ActivityIndicator size="small" color="#60A5FA" />
                  <Text style={styles.friendLoadingText}>
                    {t('Freundesanfragen werden geladen ...')}
                  </Text>
                </View>
              ) : (
                requests.map((request, index) => {
                  const requesterName = request?.username ?? request?.code ?? t('Freund');
                  const requestCode = request?.code ?? '';
                  const isBusy = respondingFriendRequestId === request?.id;
                  const showCode =
                    requestCode &&
                    String(requesterName).toUpperCase() !== String(requestCode).toUpperCase();
                  return (
                    <View
                      key={request?.id ?? `${requestCode}-${index}`}
                      style={[
                        styles.friendRequestRow,
                        index === requests.length - 1 ? styles.friendRowLast : null,
                      ]}
                    >
                      <View style={styles.friendRequestInfo}>
                        <Text style={styles.friendCodeText}>{requesterName}</Text>
                        {showCode ? (
                          <Text style={styles.friendTitleText}>{requestCode}</Text>
                        ) : null}
                      </View>
                      <Pressable
                        onPress={() => onAcceptFriendRequest?.(request?.id)}
                        style={[
                          styles.friendRequestAcceptButton,
                          isBusy ? styles.friendRequestAcceptButtonDisabled : null,
                        ]}
                        disabled={isBusy || !request?.id}
                      >
                        <Text style={styles.friendRequestAcceptText}>
                          {isBusy ? t('Annehmen...') : t('Annehmen')}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })
              )}
            </View>
          </>
        ) : null}
      </View>
    </View>
  );
}
