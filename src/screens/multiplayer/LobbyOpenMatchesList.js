import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/MultiplayerLobbyScreen.styles';
import { DIFFICULTY_ACCENTS, DIFFICULTY_LABELS } from './lobbyConstants';
import LobbyEmptyState from './LobbyEmptyState';

export default function LobbyOpenMatchesList({
  matchesLoading,
  openMatches,
  onRefreshMatches,
  onJoinQuick,
  difficultyLabel,
}) {
  const { t } = useTranslation();

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
          data={openMatches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onJoinQuick(item.code)}
              style={styles.matchCard}
            >
              <View style={styles.matchInfo}>
                <Text style={styles.matchCode}>{item.code}</Text>
                <Text style={styles.matchMeta}>
                  <Text style={{ color: DIFFICULTY_ACCENTS[item.difficulty] ?? '#94A3B8' }}>
                    {t(DIFFICULTY_LABELS[item.difficulty] ?? difficultyLabel)}
                  </Text>
                  {' - '}
                  {item.questionLimit} {t('Fragen')}
                </Text>
                {item.hostUsername ? (
                  <Text style={styles.matchHost}>{t('Host')}: {item.hostUsername}</Text>
                ) : null}
              </View>
              <View style={styles.matchAction}>
                <Text style={styles.matchActionText}>{t('Beitreten')}</Text>
              </View>
            </Pressable>
          )}
          scrollEnabled={false}
          contentContainerStyle={
            openMatches.length ? styles.listContent : styles.listEmpty
          }
          ListEmptyComponent={<LobbyEmptyState />}
        />
      )}
    </>
  );
}
