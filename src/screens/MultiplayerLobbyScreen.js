import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { supabase } from '../lib/supabaseClient';
import {
  createMatch,
  deriveMatchRole,
  fetchOpenMatches,
  joinMatch,
  subscribeToMatch,
} from '../services/matchService';
import styles from './styles/MultiplayerLobbyScreen.styles';

const DIFFICULTY_LABELS = {
  leicht: 'Leicht',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>Noch keine offenen Battles</Text>
      <Text style={styles.emptySubtitle}>
        Starte selbst eine Lobby oder teile deinen Match-Code mit Freund:innen.
      </Text>
    </View>
  );
}

export default function MultiplayerLobbyScreen({ navigation, route }) {
  const initialDifficulty =
    typeof route?.params?.difficulty === 'string'
      ? route.params.difficulty
      : 'mittel';

  const [difficulty] = useState(initialDifficulty);
  const [userId, setUserId] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [openMatches, setOpenMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [matchesError, setMatchesError] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [currentMatch, setCurrentMatch] = useState(null);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    let active = true;

    async function resolveUser() {
      setLoadingUser(true);

      try {
        const { data, error } = await supabase.auth.getUser();

        if (!active) {
          return;
        }

        if (error) {
          console.warn('Konnte Multiplayer-Nutzer nicht abrufen:', error.message);
        }

        setUserId(data?.user?.id ?? null);
      } catch (err) {
        if (active) {
          console.warn('Unerwarteter Fehler beim Abrufen des Nutzers:', err);
          setUserId(null);
        }
      } finally {
        if (active) {
          setLoadingUser(false);
        }
      }
    }

    resolveUser();

    return () => {
      active = false;
      if (subscriptionRef.current) {
        subscriptionRef.current();
        subscriptionRef.current = null;
      }
    };
  }, []);

  const difficultyLabel = useMemo(
    () => DIFFICULTY_LABELS[difficulty] ?? DIFFICULTY_LABELS.mittel,
    [difficulty]
  );

  const refreshMatches = useCallback(
    async ({ force = false } = {}) => {
      setMatchesLoading(true);
      setMatchesError(null);

      try {
        const matches = await fetchOpenMatches({
          difficulty,
          force,
        });
        setOpenMatches(matches);
      } catch (err) {
        console.warn('Konnte offene Matches nicht laden:', err);
        setMatchesError(err);
      } finally {
        setMatchesLoading(false);
      }
    },
    [difficulty]
  );

  useFocusEffect(
    useCallback(() => {
      if (!userId) {
        return () => {};
      }

      refreshMatches();

      return () => {};
    }, [refreshMatches, userId])
  );

  useEffect(() => {
    if (!currentMatch || !userId) {
      return;
    }

    const role = deriveMatchRole(currentMatch, userId);

    if (!role) {
      return;
    }

    if (currentMatch.status === 'active') {
      navigation.replace('Quiz', {
        difficulty: currentMatch.difficulty ?? difficulty,
        mode: 'multiplayer',
        matchId: currentMatch.id,
        joinCode: currentMatch.code,
        role,
      });
    }
  }, [currentMatch, difficulty, navigation, userId]);

  const attachMatchSubscription = useCallback((matchId) => {
    if (subscriptionRef.current) {
      subscriptionRef.current();
      subscriptionRef.current = null;
    }

    subscriptionRef.current = subscribeToMatch(matchId, (updated) => {
      setCurrentMatch(updated);
    });
  }, []);

  const handleCreateMatch = useCallback(async () => {
    if (!userId || creating) {
      return;
    }

    setCreating(true);
    setMatchesError(null);

    try {
      const result = await createMatch({
        difficulty,
        questionLimit: 5,
        userId,
      });

      if (!result.ok) {
        throw result.error ?? new Error('Match konnte nicht erstellt werden.');
      }

      setCurrentMatch(result.match);
      attachMatchSubscription(result.match.id);
    } catch (err) {
      console.error('Fehler beim Erstellen eines Matches:', err);
      setMatchesError(err);
    } finally {
      setCreating(false);
      refreshMatches({ force: true });
    }
  }, [attachMatchSubscription, creating, difficulty, refreshMatches, userId]);

  const handleJoinByCode = useCallback(async () => {
    if (!userId || joining) {
      return;
    }

    const normalized = joinCode.trim().toUpperCase();

    if (!normalized) {
      setMatchesError(new Error('Bitte gib einen Match-Code ein.'));
      return;
    }

    setJoining(true);
    setMatchesError(null);

    try {
      const result = await joinMatch({
        code: normalized,
        userId,
      });

      if (!result.ok) {
        throw result.error ?? new Error('Match konnte nicht beigetreten werden.');
      }

      setCurrentMatch(result.match);
      attachMatchSubscription(result.match.id);
      setJoinCode('');
    } catch (err) {
      console.error('Fehler beim Beitritt ueber Code:', err);
      setMatchesError(err);
    } finally {
      setJoining(false);
      refreshMatches({ force: true });
    }
  }, [
    attachMatchSubscription,
    joinCode,
    joining,
    refreshMatches,
    userId,
  ]);

  const handleJoinQuick = useCallback(
    async (code) => {
      if (!userId || joining) {
        return;
      }

      setJoining(true);
      setMatchesError(null);

      try {
        const result = await joinMatch({
          code,
          userId,
        });

        if (!result.ok) {
          throw result.error ?? new Error('Match konnte nicht beigetreten werden.');
        }

        setCurrentMatch(result.match);
        attachMatchSubscription(result.match.id);
      } catch (err) {
        console.error('Fehler beim Schnellbeitritt:', err);
        setMatchesError(err);
      } finally {
        setJoining(false);
        refreshMatches({ force: true });
      }
    },
    [attachMatchSubscription, joining, refreshMatches, userId]
  );

  const renderMatch = useCallback(
    ({ item }) => (
      <Pressable
        onPress={() => handleJoinQuick(item.code)}
        style={styles.matchCard}
      >
        <View style={styles.matchInfo}>
          <Text style={styles.matchCode}>{item.code}</Text>
          <Text style={styles.matchMeta}>
            {DIFFICULTY_LABELS[item.difficulty] ?? difficultyLabel} •{' '}
            {item.questionLimit} Fragen
          </Text>
          {item.hostUsername ? (
            <Text style={styles.matchHost}>Host: {item.hostUsername}</Text>
          ) : null}
        </View>
        <View style={styles.matchAction}>
          <Text style={styles.matchActionText}>Beitreten</Text>
        </View>
      </Pressable>
    ),
    [difficultyLabel, handleJoinQuick]
  );

  const currentJoinCode = currentMatch?.code ?? null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.subtitle}>Multiplayer Arena</Text>
          <Text style={styles.title}>Online Battle</Text>
          <Text style={styles.helper}>
            Schwierigkeit: {difficultyLabel} • 5 Fragen
          </Text>
        </View>
        <Pressable
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeButtonText}>Schliessen</Text>
        </Pressable>
      </View>

      {loadingUser ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#60A5FA" />
          <Text style={styles.loadingText}>Profil wird geladen ...</Text>
        </View>
      ) : null}

      {matchesError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorMessage}>
            {matchesError.message ?? 'Es ist ein Fehler aufgetreten.'}
          </Text>
        </View>
      ) : null}

      {currentJoinCode ? (
        <View style={styles.lobbyCard}>
          <Text style={styles.lobbyTitle}>Warte auf Gegner</Text>
          <Text style={styles.lobbyDescription}>
            Teile den Code, damit dein:e Gegner:in beitritt.
          </Text>
          <View style={styles.codeBadge}>
            <Text style={styles.codeBadgeText}>{currentJoinCode}</Text>
          </View>
          <Pressable
            onPress={() => refreshMatches({ force: true })}
            style={styles.refreshWaitingButton}
          >
            <Text style={styles.refreshWaitingText}>Status aktualisieren</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.actionsRow}>
        <Pressable
          style={[
            styles.primaryAction,
            creating ? styles.actionDisabled : null,
          ]}
          onPress={handleCreateMatch}
          disabled={creating || !userId}
        >
          <Text style={styles.primaryActionText}>
            {creating ? 'Erstelle Lobby ...' : 'Lobby hosten'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.joinSection}>
        <Text style={styles.joinLabel}>Match-Code eingeben</Text>
        <View style={styles.joinRow}>
          <TextInput
            value={joinCode}
            onChangeText={(value) =>
              setJoinCode(value.toUpperCase().slice(0, 6))
            }
            style={styles.joinInput}
            placeholder="ABC12"
            placeholderTextColor="#64748B"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
          />
          <Pressable
            onPress={handleJoinByCode}
            style={[
              styles.joinButton,
              joining ? styles.actionDisabled : null,
            ]}
            disabled={joining || !joinCode.trim()}
          >
            <Text style={styles.joinButtonText}>
              {joining ? 'Beitreten...' : 'Go'}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Offene Lobbys</Text>
        <Pressable onPress={() => refreshMatches({ force: true })}>
          <Text style={styles.listRefresh}>Aktualisieren</Text>
        </Pressable>
      </View>

      {matchesLoading ? (
        <View style={styles.loadingList}>
          <ActivityIndicator size="small" color="#60A5FA" />
          <Text style={styles.loadingListText}>Lade Lobbys ...</Text>
        </View>
      ) : (
        <FlatList
          data={openMatches}
          keyExtractor={(item) => item.id}
          renderItem={renderMatch}
          contentContainerStyle={
            openMatches.length ? styles.listContent : styles.listEmpty
          }
          ListEmptyComponent={<EmptyState />}
        />
      )}
    </View>
  );
}

