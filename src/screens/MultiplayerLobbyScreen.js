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
  const initialMode =
    typeof route?.params?.mode === 'string' ? route.params.mode.toLowerCase() : 'hub';
  const normalizedMode =
    initialMode === 'create' || initialMode === 'join' ? initialMode : 'hub';
  const isCreateOnly = normalizedMode === 'create';
  const isJoinOnly = normalizedMode === 'join';

  const [difficulty] = useState(initialDifficulty);
  const [userId, setUserId] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [openMatches, setOpenMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(!isCreateOnly);
  const [matchesError, setMatchesError] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [currentMatch, setCurrentMatch] = useState(null);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const subscriptionRef = useRef(null);
  const autoCreateTriggeredRef = useRef(false);

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
  const helperText = useMemo(() => {
    if (isCreateOnly) {
      return `Direkt-Host: ${difficultyLabel} - 5 Fragen`;
    }
    if (isJoinOnly) {
      return `Beitritt: ${difficultyLabel} - 5 Fragen`;
    }
    return `Schwierigkeit: ${difficultyLabel} - 5 Fragen`;
  }, [difficultyLabel, isCreateOnly, isJoinOnly]);

  const refreshMatches = useCallback(
    async ({ force = false } = {}) => {
      if (isCreateOnly) {
        setOpenMatches([]);
        setMatchesLoading(false);
        return;
      }

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
    [difficulty, isCreateOnly]
  );

  useFocusEffect(
    useCallback(() => {
      if (!userId || isCreateOnly) {
        return () => {};
      }

      refreshMatches();

      return () => {};
    }, [isCreateOnly, refreshMatches, userId])
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
      if (!isCreateOnly) {
        refreshMatches({ force: true });
      }
    }
  }, [attachMatchSubscription, creating, difficulty, isCreateOnly, refreshMatches, userId]);

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
      if (!isCreateOnly) {
        refreshMatches({ force: true });
      }
    }
  }, [
    attachMatchSubscription,
    joinCode,
    joining,
    isCreateOnly,
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
        if (!isCreateOnly) {
          refreshMatches({ force: true });
        }
      }
    },
    [attachMatchSubscription, isCreateOnly, joining, refreshMatches, userId]
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
            {DIFFICULTY_LABELS[item.difficulty] ?? difficultyLabel} -{' '}
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

  useEffect(() => {
    if (!isCreateOnly) {
      return;
    }

    if (autoCreateTriggeredRef.current) {
      return;
    }

    if (!userId || loadingUser) {
      return;
    }

    autoCreateTriggeredRef.current = true;
    handleCreateMatch();
  }, [handleCreateMatch, isCreateOnly, loadingUser, userId]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.subtitle}>Multiplayer Arena</Text>
          <Text style={styles.title}>Online Battle</Text>
          <Text style={styles.helper}>{helperText}</Text>
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

      {!isJoinOnly ? (
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
      ) : null}

      {!isCreateOnly ? (
        <>
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
                autoFocus={isJoinOnly}
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
        </>
      ) : !currentJoinCode ? (
        <View style={styles.createInfoBox}>
          <Text style={styles.createInfoTitle}>Lobby vorbereiten</Text>
          <Text style={styles.createInfoText}>
            Wir hosten dein Match. Teile gleich danach den Code mit deinem Team.
          </Text>
        </View>
      ) : null}
    </View>
  );
}




