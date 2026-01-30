import { ActivityIndicator, Animated, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/MultiplayerLobbyScreen.styles';
import LobbyEmptyState from './LobbyEmptyState';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function LobbyJoinSection({
  isCreateOnly,
  isJoinOnly,
  joinCode,
  onChangeJoinCode,
  onJoinByCode,
  onJoinPressIn,
  onJoinPressOut,
  joinPressStyle,
  joining,
  matchesLoading,
  openMatches,
  onRefreshMatches,
  renderMatch,
}) {
  const { t } = useTranslation();

  if (isCreateOnly) {
    return null;
  }

  return (
    <>
      <View style={styles.joinSection}>
        <Text style={styles.joinLabel}>{t('Match-Code eingeben')}</Text>
        <View style={styles.joinRow}>
          <TextInput
            value={joinCode}
            onChangeText={(value) =>
              onChangeJoinCode(value.toUpperCase().slice(0, 6))
            }
            style={styles.joinInput}
            placeholder="ABC12"
            placeholderTextColor="#64748B"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
            autoFocus={isJoinOnly}
          />
          <AnimatedPressable
            onPress={onJoinByCode}
            onPressIn={onJoinPressIn}
            onPressOut={onJoinPressOut}
            style={[
              styles.joinButton,
              joinPressStyle,
              joining ? styles.actionDisabled : null,
            ]}
            disabled={joining || !joinCode.trim()}
          >
            <Text style={styles.joinButtonText}>
              {joining ? t('Beitreten...') : t('Go')}
            </Text>
          </AnimatedPressable>
        </View>
      </View>

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
          renderItem={renderMatch}
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
