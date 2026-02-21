import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../i18n/useTranslation';
import { getTitleProgress } from '../../services/titleService';
import AvatarView from '../../components/avatar/AvatarView';
import { getAvatarInitials, getAvatarPresetSource } from '../../utils/avatarUtils';
import { buildPublicProfilePayload } from '../../utils/publicProfile';
import styles from '../styles/SettingsScreen.styles';

export default function FriendsSection({
  friends,
  loadingFriends,
  friendRequests,
  loadingFriendRequests,
  respondingFriendRequestId,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
  onlineFriends,
  onRemoveFriend,
  onOpenProfile,
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
    const fallbackTitle =
      Number.isFinite(friend?.xp)
        ? getTitleProgress(friend.xp).current?.label ?? null
        : null;
    entries.push({
      code,
      name: presence?.username ?? friend?.username ?? null,
      username: presence?.username ?? friend?.username ?? null,
      title: presence?.title ?? fallbackTitle,
      xp: Number.isFinite(friend?.xp) ? friend.xp : null,
      isOnline: Boolean(presence),
      activity: presence?.activity ?? (presence ? 'online' : 'offline'),
      lobby: presence?.lobby ?? null,
      lobbyPlayers: presence?.lobbyPlayers ?? null,
      lobbyCapacity: presence?.lobbyCapacity ?? null,
      userId: presence?.userId ?? null,
      avatarUrl: presence?.avatarUri ?? friend?.avatarUrl ?? null,
      avatarIcon: presence?.avatarIcon ?? friend?.avatarIcon ?? null,
      avatarColor: presence?.avatarColor ?? friend?.avatarColor ?? null,
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
      name: friend?.username ?? null,
      username: friend?.username ?? null,
      title: friend?.title ?? null,
      xp: Number.isFinite(friend?.xp) ? friend.xp : null,
      isOnline: true,
      activity: friend?.activity ?? (friend?.lobby ? 'lobby' : 'online'),
      lobby: friend?.lobby ?? null,
      lobbyPlayers: friend?.lobbyPlayers ?? null,
      lobbyCapacity: friend?.lobbyCapacity ?? null,
      userId: friend?.userId ?? null,
      avatarUrl: friend?.avatarUri ?? friend?.avatarUrl ?? null,
      avatarIcon: friend?.avatarIcon ?? null,
      avatarColor: friend?.avatarColor ?? null,
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
  const isLoading = loadingFriends && entries.length === 0;

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
          entries.map((friend, index) => {
            const presetAvatarSource = getAvatarPresetSource(friend.avatarIcon);

            return (
              <View
                key={friend.code}
                style={[
                  styles.friendRow,
                  index === entries.length - 1 ? styles.friendRowLast : null,
                ]}
              >
                <Pressable
                  style={styles.friendMainPressable}
                  onPress={() =>
                    onOpenProfile?.(buildPublicProfilePayload({
                      userId: friend.userId ?? null,
                      friendCode: friend.code ?? null,
                      name: friend.name ?? t('Freund'),
                      username: friend.username ?? null,
                      title: friend.title ?? null,
                      xp: Number.isFinite(friend.xp) ? friend.xp : null,
                      isOnline: Boolean(friend.isOnline),
                      activity: friend.activity ?? null,
                      statusLabel: formatStatus(friend),
                      avatarUrl: friend.avatarUrl ?? null,
                      avatarIcon: friend.avatarIcon ?? null,
                      avatarColor: friend.avatarColor ?? null,
                    }))
                  }
                  disabled={!onOpenProfile}
                >
                  <View style={styles.friendIdentityRow}>
                    <AvatarView
                      uri={friend.avatarUrl}
                      source={presetAvatarSource}
                      icon={friend.avatarIcon}
                      color={friend.avatarColor ?? '#9EDCFF'}
                      initials={getAvatarInitials(friend.name || t('Freund'))}
                      circleStyle={styles.friendAvatar}
                      imageStyle={styles.friendAvatarImage}
                      iconSize={20}
                      textStyle={styles.friendAvatarText}
                    />
                    <View style={styles.friendIdentityMeta}>
                      <Text style={styles.friendCodeText} numberOfLines={1}>
                        {friend.name || t('Freund')}
                      </Text>
                      {friend.title ? (
                        <Text style={styles.friendTitleText} numberOfLines={1}>
                          {t(friend.title)}
                        </Text>
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
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => onRemoveFriend({ code: friend.code })}
                  style={styles.friendRemoveButton}
                >
                  <Text style={styles.friendRemoveText}>{t('Entfernen')}</Text>
                </Pressable>
              </View>
            );
          })
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
                  const requesterName =
                    request?.displayName
                    ?? request?.username
                    ?? t('Freund');
                  const requestCode = request?.code ?? '';
                  const requestXp =
                    Number.isFinite(request?.xp) && request.xp >= 0
                      ? request.xp
                      : null;
                  const requestTitle =
                    Number.isFinite(requestXp)
                      ? getTitleProgress(requestXp).current?.label ?? null
                      : null;
                  const requestAvatarUrl = request?.avatarUrl ?? null;
                  const requestAvatarIcon = request?.avatarIcon ?? null;
                  const requestAvatarColor = request?.avatarColor ?? null;
                  const requestPresetAvatarSource = getAvatarPresetSource(requestAvatarIcon);
                  const isBusy = respondingFriendRequestId === request?.id;
                  return (
                    <View
                      key={request?.id ?? `${requestCode}-${index}`}
                      style={[
                        styles.friendRequestRow,
                        index === requests.length - 1 ? styles.friendRowLast : null,
                      ]}
                    >
                      <Pressable
                        style={styles.friendRequestInfo}
                        onPress={() =>
                          onOpenProfile?.(buildPublicProfilePayload({
                            userId: request?.requesterId ?? null,
                            friendCode: requestCode || null,
                            name: requesterName,
                            username: request?.username ?? null,
                            title: requestTitle ?? null,
                            xp: requestXp,
                            isOnline: false,
                            activity: 'offline',
                            statusLabel: t('Offline'),
                            avatarUrl: requestAvatarUrl,
                            avatarIcon: requestAvatarIcon,
                            avatarColor: requestAvatarColor,
                          }))
                        }
                        disabled={!onOpenProfile}
                      >
                        <View style={styles.friendIdentityRow}>
                          <AvatarView
                            uri={requestAvatarUrl}
                            source={requestPresetAvatarSource}
                            icon={requestAvatarIcon}
                            color={requestAvatarColor ?? '#9EDCFF'}
                            initials={getAvatarInitials(requesterName)}
                            circleStyle={styles.friendAvatar}
                            imageStyle={styles.friendAvatarImage}
                            iconSize={20}
                            textStyle={styles.friendAvatarText}
                          />
                          <View style={styles.friendIdentityMeta}>
                            <Text style={styles.friendCodeText} numberOfLines={1}>
                              {requesterName}
                            </Text>
                            {requestTitle ? (
                              <Text style={styles.friendTitleText} numberOfLines={1}>
                                {t(requestTitle)}
                              </Text>
                            ) : null}
                            <View style={styles.friendStatusRow}>
                              <View style={[styles.friendStatusDot, styles.friendStatusDotOffline]} />
                              <Text style={[styles.friendStatusText, styles.friendStatusTextOffline]}>
                                {t('Offline')}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </Pressable>
                      <View style={styles.friendRequestActions}>
                        <Pressable
                          onPress={() => onDeclineFriendRequest?.(request?.id)}
                          style={[
                            styles.friendRequestDeclineButton,
                            isBusy ? styles.friendRequestAcceptButtonDisabled : null,
                          ]}
                          disabled={isBusy || !request?.id}
                        >
                          <Text style={styles.friendRequestDeclineText}>
                            {isBusy ? t('Ablehnen...') : t('Ablehnen')}
                          </Text>
                        </Pressable>
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
