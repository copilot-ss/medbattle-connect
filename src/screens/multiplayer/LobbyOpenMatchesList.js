import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/MultiplayerLobbyScreen.styles';
import LobbyEmptyState from './LobbyEmptyState';

export default function LobbyOpenMatchesList({
  matchesLoading,
  openMatches,
  onRefreshMatches,
  onJoinQuick,
}) {
  const { t } = useTranslation();
  const resolvedOpenMatches = Array.isArray(openMatches) ? openMatches : [];
  const visibleMatchCount = resolvedOpenMatches.length;
  const clampedMatchCount = Math.min(visibleMatchCount, 3);
  const listMinHeight =
    visibleMatchCount === 0
      ? 92
      : clampedMatchCount * 92 + Math.max(0, clampedMatchCount - 1) * 14;

  return (
    <>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>{t('Offene Lobbys')}</Text>
        <Pressable onPress={onRefreshMatches}>
          <Text style={styles.listRefresh}>{t('Aktualisieren')}</Text>
        </Pressable>
      </View>

      {matchesLoading ? (
        <View style={styles.loadingList}>
          <ActivityIndicator size="small" color="#60A5FA" />
          <Text style={styles.loadingListText}>{t('Lade Lobbys ...')}</Text>
        </View>
      ) : (
        <FlatList
          data={resolvedOpenMatches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onJoinQuick(item.code)}
              style={styles.matchCard}
            >
              <View style={styles.matchInfo}>
                <Text style={styles.matchHostName} numberOfLines={1}>
                  {item.hostUsername || t('Freund')}
                </Text>
                <Text style={styles.matchMeta}>
                  {item.category ? t(item.category) : '-'}
                </Text>
                <Text style={styles.matchPlayers}>
                  {t('Lobby {players}/{capacity}', {
                    players: Number.isFinite(item.players) ? item.players : 1,
                    capacity: Number.isFinite(item.capacity) ? item.capacity : 2,
                  })}
                </Text>
              </View>
              <View style={styles.matchAction}>
                <Text style={styles.matchActionText}>{t('Beitreten')}</Text>
              </View>
            </Pressable>
          )}
          scrollEnabled={false}
          contentContainerStyle={[
            visibleMatchCount ? styles.listContent : styles.listEmpty,
            { minHeight: listMinHeight },
          ]}
          ListEmptyComponent={<LobbyEmptyState />}
        />
      )}
    </>
  );
}
