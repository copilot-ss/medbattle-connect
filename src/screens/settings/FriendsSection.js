import { Pressable, Switch, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/SettingsScreen.styles';

export default function FriendsSection({
  friendRequestsEnabled,
  friendRequestsStatus,
  onToggleFriendRequests,
  friendCode,
  copySuccess,
  onCopyFriendCode,
  friendCodeInput,
  setFriendCodeInput,
  friendInputRef,
  onAddFriend,
  addingFriend,
  friends,
  loadingFriends,
  onlineFriends,
  loadingOnline,
  onRemoveFriend,
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
      lobby: friend?.lobby ?? null,
      lobbyPlayers: friend?.lobbyPlayers ?? null,
      lobbyCapacity: friend?.lobbyCapacity ?? null,
    });
    seen.add(code);
  });

  entries.sort((a, b) => {
    const rank = (entry) => (entry.lobby ? 2 : entry.isOnline ? 1 : 0);
    const diff = rank(b) - rank(a);
    if (diff !== 0) {
      return diff;
    }
    return String(a.name).localeCompare(String(b.name));
  });

  const totalCount = entries.length;
  const onlineCount = entries.filter((entry) => entry.isOnline).length;
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
    return entry.isOnline ? t('Online') : t('Offline');
  };

  const resolveDotStyle = (entry) => {
    if (entry.lobby) {
      return styles.friendStatusDotLobby;
    }
    return entry.isOnline ? styles.friendStatusDotOnline : styles.friendStatusDotOffline;
  };

  const resolveStatusTextStyle = (entry) => {
    if (entry.lobby) {
      return styles.friendStatusTextLobby;
    }
    return entry.isOnline ? styles.friendStatusTextOnline : styles.friendStatusTextOffline;
  };

  return (
    <View style={[styles.card, styles.squadCard]}>
      <View style={[styles.rowBetween, styles.friendToggleRow]}>
        <Text style={styles.cardLabel}>{t('Freundesanfragen')}</Text>
        <Switch
          value={friendRequestsEnabled}
          onValueChange={onToggleFriendRequests}
          trackColor={{ false: '#1F2937', true: '#0EA5E9' }}
          thumbColor={friendRequestsEnabled ? '#F8FAFC' : '#94A3B8'}
          accessibilityHint={friendRequestsStatus}
        />
      </View>

      <View style={styles.friendList}>
        <View style={styles.friendListHeader}>
          <Text style={styles.friendListTitle}>{t('Freunde')}</Text>
          <Text style={styles.friendListCount}>
            {statusSummary}
          </Text>
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
      </View>

      <View style={styles.friendListDivider} />

      <View style={styles.friendHeroRow}>
        <View style={styles.friendHeroTextGroup}>
          <Text style={styles.friendHeroTitle}>{t('Freunde hinzufügen')}</Text>
          <Text style={styles.friendHeroSubtitle}>
            {t('Teile deinen Code und hol deine Crew ins Battle.')}
          </Text>
        </View>
      </View>

      <View style={styles.friendCodeCard}>
        <Pressable
          onPress={onCopyFriendCode}
          style={styles.friendCodeValueWrapper}
          accessibilityLabel={t('Code kopieren')}
        >
          <Text style={styles.friendCodeValue}>
            {friendCode || '------'}
          </Text>
          {copySuccess ? (
            <Text style={styles.friendCodeCopy}>{t('Kopiert!')}</Text>
          ) : (
            <Ionicons
              name="copy-outline"
              size={18}
              color="#93C5FD"
              style={styles.friendCodeCopyIcon}
            />
          )}
        </Pressable>
      </View>

      <Text style={styles.friendInputLabel}>{t('Code von Freund eingeben')}</Text>
      <View style={styles.fieldGroup}>
        <TextInput
          ref={friendInputRef}
          value={friendCodeInput}
          onChangeText={setFriendCodeInput}
          placeholder="ABC12345"
          placeholderTextColor="#64748B"
          autoCapitalize="characters"
          keyboardType="default"
          style={styles.input}
        />
        <Pressable
          onPress={onAddFriend}
          disabled={addingFriend}
          style={[
            styles.actionButton,
            styles.successButton,
            addingFriend ? styles.disabledButton : null,
          ]}
        >
          {addingFriend ? (
            <ActivityIndicator color="#F8FAFC" />
          ) : (
            <Text style={styles.successButtonText}>{t('Freund hinzufügen')}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
