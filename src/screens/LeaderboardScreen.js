import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';

import { supabase } from '../lib/supabaseClient';
import { fetchLeaderboard } from '../services/quizService';

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

    return (
      <View
        style={{
          borderRadius: 20,
          backgroundColor: containerBackground,
          borderWidth: 1,
          borderColor: isCurrent ? '#FACC15' : 'rgba(71, 85, 105, 0.45)',
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 18,
          paddingHorizontal: 18,
          marginBottom: 14,
          gap: 14,
        }}
      >
        <Text
          style={{
            width: 46,
            fontSize: 18,
            fontWeight: '800',
            color: accent,
          }}
        >
          {index + 1}.
        </Text>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#F8FAFC',
            }}
          >
            {(() => {
              const name = item.username?.trim()
                ? item.username
                : formatUserId(item.userId);
              return isCurrent ? `${name} (Du)` : name;
            })()}
          </Text>
          <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
            Schwierigkeit: {item.difficulty}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: '#FACC15',
            }}
          >
            {item.points}
          </Text>
          <Text style={{ fontSize: 11, color: '#CBD5F5', marginTop: 4 }}>
            Punkte
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#030712' }}>
      <View
        style={{
          paddingTop: 60,
          paddingHorizontal: 20,
          paddingBottom: 24,
          backgroundColor: '#0F172A',
          borderBottomWidth: 1,
          borderColor: 'rgba(59, 130, 246, 0.3)',
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={{
            alignSelf: 'flex-start',
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: 'rgba(148, 163, 184, 0.35)',
            backgroundColor: 'rgba(2, 6, 23, 0.6)',
            marginBottom: 18,
          }}
        >
          <Text style={{ color: '#E0E7FF', fontWeight: '600' }}>Zurueck</Text>
        </Pressable>
        <Text
          style={{
            fontSize: 30,
            fontWeight: '800',
            color: '#F8FAFC',
          }}
        >
          Rangliste
        </Text>
        <Text style={{ color: '#CBD5F5', marginTop: 6 }}>
          Die besten Ergebnisse der Community
        </Text>
      </View>

      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#030712',
          }}
        >
          <ActivityIndicator size="large" color="#60A5FA" />
          <Text style={{ marginTop: 12, color: '#94A3B8' }}>
            Daten werden geladen ...
          </Text>
        </View>
      ) : error ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 24,
            backgroundColor: '#030712',
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: '#FCA5A5',
              textAlign: 'center',
              marginBottom: 16,
            }}
          >
            {error}
          </Text>
          <Pressable
            onPress={() => loadLeaderboard({ force: true })}
            style={{
              backgroundColor: '#2563EB',
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
              Erneut versuchen
            </Text>
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
            <View
              style={{
                padding: 24,
                alignItems: 'center',
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                borderRadius: 16,
              }}
            >
              <Text style={{ fontSize: 16, color: '#CBD5F5' }}>
                Noch keine Eintraege vorhanden.
              </Text>
            </View>
          }
          contentContainerStyle={{
            paddingTop: 20,
            paddingHorizontal: 20,
            paddingBottom: 40,
          }}
          style={{ flex: 1, backgroundColor: '#030712' }}
        />
      )}
    </View>
  );
}
