import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import AvatarView from '../components/avatar/AvatarView';
import styles from './styles/LeaderboardScreen.styles';
import { colors } from '../styles/theme';
import { fetchLeaderboard } from '../services/quizService';
import { getTitleProgress } from '../services/titleService';
import { useAvatarPrefs, useStatsPrefs } from '../context/PreferencesContext';
import useSupabaseUserId from '../hooks/useSupabaseUserId';
import useCurrentAvatar from '../hooks/useCurrentAvatar';
import { useTranslation } from '../i18n/useTranslation';
import PublicProfileSheet from '../components/PublicProfileSheet';
import usePublicProfileSheet from '../hooks/usePublicProfileSheet';
import { getAvatarInitials, getAvatarPresetSource } from '../utils/avatarUtils';
import { buildPublicProfilePayload } from '../utils/publicProfile';

const TOP_RANK_CONFIGS = [
  {
    color: '#F4D06A',
    badgeBackground: '#F4D06A',
    badgeBorder: '#F7DE8B',
    cardBackground: 'rgba(244, 208, 106, 0.12)',
    cardBorder: 'rgba(244, 208, 106, 0.28)',
  },
  {
    color: '#D7DEEE',
    badgeBackground: '#D7DEEE',
    badgeBorder: '#E6ECF8',
    cardBackground: 'rgba(215, 222, 238, 0.1)',
    cardBorder: 'rgba(215, 222, 238, 0.24)',
  },
  {
    color: '#E3A271',
    badgeBackground: '#E3A271',
    badgeBorder: '#EDB487',
    cardBackground: 'rgba(227, 162, 113, 0.1)',
    cardBorder: 'rgba(227, 162, 113, 0.24)',
  },
];

function formatUserId(value, t) {
  if (!value) {
    return t('Unbekannt');
  }

  if (value.length <= 8) {
    return value;
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

export default function LeaderboardScreen({ navigation, showClose = true }) {
  const { t } = useTranslation();
  const { avatarId, avatarUri } = useAvatarPrefs();
  const { userStats } = useStatsPrefs();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const currentUserId = useSupabaseUserId();
  const { openProfile, sheetProps } = usePublicProfileSheet();
  const {
    avatarEntry: currentAvatarEntry,
    avatarSource: currentAvatarSource,
    avatarIcon: currentAvatarIcon,
  } = useCurrentAvatar(avatarId);
  const currentUserXp = Number.isFinite(userStats?.xp) ? userStats.xp : null;
  const leaderboardExtraData = useMemo(
    () =>
      [
        currentUserId ?? '',
        Number.isFinite(currentUserXp) ? currentUserXp : '',
        avatarId ?? '',
        avatarUri ?? '',
        currentAvatarEntry?.color ?? '',
        t('Punkte'),
        t('Praktikant'),
      ].join('|'),
    [
      avatarId,
      avatarUri,
      currentAvatarEntry?.color,
      currentUserId,
      currentUserXp,
      t,
    ]
  );

  const loadLeaderboard = useCallback(
    async (options = {}) => {
      const { force = false } = options;

      if (!force) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        const data = await fetchLeaderboard(25, { force });
        setEntries(data);
        setError(null);
      } catch (err) {
        console.error('Konnte Rangliste nicht laden:', err);
        setError(
          t('Rangliste konnte nicht geladen werden. Bitte versuche es später erneut.')
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [t]
  );

  useFocusEffect(
    useCallback(() => {
      loadLeaderboard();
    }, [loadLeaderboard])
  );

  useEffect(() => {
    if (!currentUserId || !Number.isFinite(currentUserXp)) {
      return;
    }

    setEntries((previous) => {
      if (!Array.isArray(previous) || !previous.length) {
        return previous;
      }

      let changed = false;
      const next = previous.map((entry) => {
        if (entry?.userId !== currentUserId) {
          return entry;
        }

        const entryXp = Number.isFinite(entry?.xp) ? entry.xp : null;
        if (entryXp === currentUserXp) {
          return entry;
        }

        changed = true;
        return {
          ...entry,
          xp: currentUserXp,
        };
      });

      return changed ? next : previous;
    });
  }, [currentUserId, currentUserXp]);

  const refresh = useCallback(() => {
    loadLeaderboard({ force: true });
  }, [loadLeaderboard]);

  function renderItem({ item, index }) {
    const topRankConfig = TOP_RANK_CONFIGS[index] ?? null;
    const highlightColors = [colors.highlight, colors.accent, colors.accentPink];
    const accent = topRankConfig?.color ?? highlightColors[index] ?? colors.accent;
    const isCurrent = currentUserId && item.userId === currentUserId;
    const containerBackground = topRankConfig?.cardBackground ?? 'rgba(18, 18, 28, 0.9)';
    const borderColor = isCurrent
      ? accent
      : (topRankConfig?.cardBorder ?? 'rgba(117, 117, 138, 0.45)');
    const resolvedXp = isCurrent && Number.isFinite(currentUserXp)
      ? currentUserXp
      : item.xp;
    const title = Number.isFinite(resolvedXp)
      ? t(getTitleProgress(resolvedXp).current.label)
      : '-';
    const name = item.username?.trim()
      ? item.username
      : formatUserId(item.userId, t);
    const initials = getAvatarInitials(name);
    const avatarUriValue = isCurrent ? avatarUri : item.avatarUrl;
    const avatarSource = isCurrent
      ? currentAvatarSource
      : getAvatarPresetSource(item.avatarIcon);
    const avatarIcon = isCurrent
      ? currentAvatarIcon
      : item.avatarIcon ?? null;
    const avatarColor = isCurrent
      ? (currentAvatarEntry?.color ?? '#9EDCFF')
      : (item.avatarColor ?? '#9EDCFF');

    return (
      <Pressable
        onPress={
          isCurrent
            ? undefined
            : () =>
                openProfile(buildPublicProfilePayload({
                  userId: item.userId ?? null,
                  name,
                  username: item.username ?? null,
                  title,
                  xp: resolvedXp,
                  rank: index + 1,
                  points: item.points,
                  avatarUrl: item.avatarUrl ?? null,
                  avatarIcon: item.avatarIcon ?? null,
                  avatarColor: item.avatarColor ?? null,
                  statusLabel: t('Rangliste'),
                }))
        }
        disabled={isCurrent}
        style={[
          styles.entry,
          isCurrent && styles.entryCurrent,
          {
            backgroundColor: containerBackground,
            borderColor,
          },
        ]}
      >
        <View style={styles.rankSlot}>
          {topRankConfig ? (
            <View
              style={[
                styles.rankBadge,
                {
                  backgroundColor: topRankConfig.badgeBackground,
                  borderColor: topRankConfig.badgeBorder,
                },
              ]}
            >
              <Text style={styles.rankBadgeText}>
                {index + 1}
              </Text>
            </View>
          ) : (
            <Text style={[styles.entryRank, { color: accent }]}>{index + 1}.</Text>
          )}
        </View>
        <AvatarView
          uri={avatarUriValue}
          source={avatarSource}
          icon={avatarIcon}
          color={avatarColor}
          initials={initials}
          circleStyle={styles.entryAvatar}
          imageStyle={styles.entryAvatarImage}
          iconSize={20}
          textStyle={styles.entryAvatarText}
        />
        <View style={styles.entryMeta}>
          <Text style={styles.entryName} numberOfLines={1} ellipsizeMode="tail">
            {name}
          </Text>
          <Text style={styles.entryTitle} numberOfLines={1} ellipsizeMode="tail">
            {title}
          </Text>
        </View>
        <View style={styles.entryScoreWrap}>
          <Text style={[styles.entryScore, { color: accent }]}>{item.points}</Text>
          <Text style={styles.entryScoreLabel}>{t('Punkte')}</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.backgroundGlowTop} pointerEvents="none" />
      <View style={styles.backgroundGlowBottom} pointerEvents="none" />
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>{t('Rangliste')}</Text>
            <Ionicons
              name="sparkles"
              size={22}
              color={colors.highlight}
              style={styles.headerTitleIcon}
            />
          </View>
          {showClose ? (
            <Pressable onPress={() => navigation.goBack()} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>X</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {loading ? (
        <View style={styles.stateContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.stateMessage}>{t('Daten werden geladen ...')}</Text>
        </View>
      ) : error ? (
        <View style={styles.stateContainer}>
          <Text style={styles.errorMessage}>{error}</Text>
          <Pressable onPress={() => loadLeaderboard({ force: true })} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>{t('Erneut versuchen')}</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={entries}
          extraData={leaderboardExtraData}
          keyExtractor={(item) => item.id ?? `${item.userId}-${item.points}`}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={colors.accent}
              progressBackgroundColor={colors.surface}
              colors={[colors.accent]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{t('Noch keine Einträge vorhanden.')}</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          style={styles.list}
        />
      )}

      <PublicProfileSheet
        {...sheetProps}
      />
    </View>
  );
}



