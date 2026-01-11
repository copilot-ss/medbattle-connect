import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { supabase } from '../lib/supabaseClient';
import styles from './styles/LeaderboardScreen.styles';
import { fetchLeaderboard } from '../services/quizService';
import { getTitleProgress } from '../services/titleService';

function formatUserId(value) {
  if (!value) {
    return 'Unbekannt';
  }

  if (value.length <= 8) {
    return value;
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

export default function LeaderboardScreen({ navigation }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

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
          'Rangliste konnte nicht geladen werden. Bitte versuche es spaeter erneut.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
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
    const highlightColors = ['#FACC15', '#C4B5FD', '#F472B6'];
    const accent = highlightColors[index] ?? '#38BDF8';
    const isCurrent = currentUserId && item.userId === currentUserId;
    const containerBackground =
      index < 3 ? 'rgba(59, 130, 246, 0.18)' : 'rgba(15, 23, 42, 0.85)';
    const title = Number.isFinite(item.xp)
      ? getTitleProgress(item.xp).current.label
      : '-';

    return (
      <View
        style={[
          styles.entry,
          {
            backgroundColor: containerBackground,
            borderColor: isCurrent ? '#FACC15' : 'rgba(71, 85, 105, 0.45)',
          },
        ]}
      >
        <Text style={[styles.entryRank, { color: accent }]}>{index + 1}.</Text>
        <View style={styles.entryMeta}>
          <Text style={styles.entryName}>
            {(() => {
              const name = item.username?.trim()
                ? item.username
                : formatUserId(item.userId);
              return isCurrent ? `${name} (Du)` : name;
            })()}
          </Text>
          <Text style={styles.entryTitle}>Titel: {title}</Text>
        </View>
        <View style={styles.entryScoreWrap}>
          <Text style={styles.entryScore}>{item.points}</Text>
          <Text style={styles.entryScoreLabel}>Punkte</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>Rangliste</Text>
            <Ionicons
              name="trophy"
              size={22}
              color="#FACC15"
              style={styles.headerTitleIcon}
            />
          </View>
          <Pressable onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>X</Text>
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color="#60A5FA" />
          <Text style={styles.stateMessage}>Daten werden geladen ...</Text>
        </View>
      ) : error ? (
        <View style={styles.stateContainer}>
          <Text style={styles.errorMessage}>{error}</Text>
          <Pressable onPress={() => loadLeaderboard({ force: true })} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Erneut versuchen</Text>
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
              tintColor="#60A5FA"
              progressBackgroundColor="#0F172A"
              colors={['#2563EB']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Noch keine Eintraege vorhanden.</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          style={styles.list}
        />
      )}
    </View>
  );
}



