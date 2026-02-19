import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { supabase } from '../lib/supabaseClient';
import styles from './styles/LeaderboardScreen.styles';
import { colors } from '../styles/theme';
import { fetchLeaderboard } from '../services/quizService';
import { getTitleProgress } from '../services/titleService';
import { usePreferences } from '../context/PreferencesContext';
import AVATARS from './settings/avatars';
import { getInitials } from './result/resultUtils';
import { useTranslation } from '../i18n/useTranslation';

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
  const { avatarId, avatarUri } = usePreferences();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const currentAvatarEntry = useMemo(
    () => AVATARS.find((item) => item.id === avatarId) ?? AVATARS[0],
    [avatarId]
  );
  const currentAvatarSource = useMemo(
    () => (avatarUri ? { uri: avatarUri } : currentAvatarEntry?.source ?? null),
    [avatarUri, currentAvatarEntry?.source]
  );
  const currentAvatarIcon = useMemo(
    () => (!avatarUri ? currentAvatarEntry?.icon ?? null : null),
    [avatarUri, currentAvatarEntry?.icon]
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

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(({ data, error: userError }) => {
      if (!active) {
        return;
      }

      if (userError) {
        console.warn('Konnte Nutzer nicht abrufen:', userError.message);
      }

      setCurrentUserId(data?.user?.id ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!active) {
          return;
        }

        setCurrentUserId(session?.user?.id ?? null);
      }
    );

    return () => {
      active = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const refresh = useCallback(() => {
    loadLeaderboard({ force: true });
  }, [loadLeaderboard]);

  function renderItem({ item, index }) {
    const highlightColors = [colors.highlight, colors.accent, colors.accentPink];
    const accent = highlightColors[index] ?? colors.accent;
    const isCurrent = currentUserId && item.userId === currentUserId;
    const containerBackground =
      index < 3 ? 'rgba(87, 199, 255, 0.16)' : 'rgba(18, 18, 28, 0.9)';
    const title = Number.isFinite(item.xp)
      ? getTitleProgress(item.xp).current.label
      : '-';
    const name = item.username?.trim()
      ? item.username
      : formatUserId(item.userId, t);
    const displayName = isCurrent ? `${name} (${t('Du')})` : name;
    const initials = getInitials(name);
    const avatarSource = isCurrent
      ? currentAvatarSource
      : item.avatarUrl
      ? { uri: item.avatarUrl }
      : null;
    const avatarIcon = isCurrent && !avatarSource ? currentAvatarIcon : null;

    return (
      <View
        style={[
          styles.entry,
          {
            backgroundColor: containerBackground,
            borderColor: isCurrent ? colors.highlight : 'rgba(117, 117, 138, 0.45)',
          },
        ]}
      >
        <Text style={[styles.entryRank, { color: accent }]}>{index + 1}.</Text>
        <View style={styles.entryAvatar}>
          {avatarSource ? (
            <Image source={avatarSource} style={styles.entryAvatarImage} resizeMode="cover" />
          ) : avatarIcon ? (
            <Ionicons
              name={avatarIcon}
              size={20}
              color={currentAvatarEntry?.color ?? '#9EDCFF'}
            />
          ) : (
            <Text style={styles.entryAvatarText}>{initials}</Text>
          )}
        </View>
        <View style={styles.entryMeta}>
          <Text style={styles.entryName}>{displayName}</Text>
          <Text style={styles.entryTitle}>{t('Titel')}: {title}</Text>
        </View>
        <View style={styles.entryScoreWrap}>
          <Text style={styles.entryScore}>{item.points}</Text>
          <Text style={styles.entryScoreLabel}>{t('Punkte')}</Text>
        </View>
      </View>
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
              name="trophy"
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
          <Text style={styles.errorMessage}>{t(error)}</Text>
          <Pressable onPress={() => loadLeaderboard({ force: true })} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>{t('Erneut versuchen')}</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={entries}
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
    </View>
  );
}



