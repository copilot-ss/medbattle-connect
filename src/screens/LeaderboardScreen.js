import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';

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

function renderSeparator() {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 12,
      }}
    />
  );
}

export default function LeaderboardScreen({ navigation }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

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

  const refresh = useCallback(() => {
    loadLeaderboard({ force: true });
  }, [loadLeaderboard]);

  function renderItem({ item, index }) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 14,
          paddingHorizontal: 12,
          backgroundColor: index < 3 ? '#F9FAFB' : '#FFFFFF',
        }}
      >
        <Text
          style={{
            width: 40,
            fontSize: 16,
            fontWeight: '600',
            color: '#2563EB',
          }}
        >
          {index + 1}.
        </Text>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '500',
              color: '#111827',
            }}
          >
            {formatUserId(item.userId)}
          </Text>
          <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
            Schwierigkeit: {item.difficulty}
          </Text>
        </View>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
          {item.points}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View
        style={{
          paddingTop: 48,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: '#2563EB',
        }}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={{ color: '#BFDBFE', marginBottom: 12 }}>Zurueck</Text>
        </Pressable>
        <Text
          style={{
            fontSize: 26,
            fontWeight: '700',
            color: '#FFFFFF',
          }}
        >
          Rangliste
        </Text>
        <Text style={{ color: '#DBEAFE', marginTop: 4 }}>
          Die besten Ergebnisse der Community
        </Text>
      </View>

      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
          }}
        >
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={{ marginTop: 12, color: '#4B5563' }}>
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
            backgroundColor: '#FFFFFF',
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: '#B91C1C',
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
              borderRadius: 10,
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
          ItemSeparatorComponent={renderSeparator}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} />
          }
          ListEmptyComponent={
            <View
              style={{
                padding: 24,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 16, color: '#4B5563' }}>
                Noch keine Eintraege vorhanden.
              </Text>
            </View>
          }
          contentContainerStyle={{
            paddingBottom: 32,
            backgroundColor: '#FFFFFF',
          }}
        />
      )}
    </View>
  );
}
