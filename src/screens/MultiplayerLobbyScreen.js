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
  updateMatchSettings,
  abandonMatch,
} from '../services/matchService';
import styles from './styles/MultiplayerLobbyScreen.styles';

const DIFFICULTY_LABELS = {
  leicht: 'Leicht',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

const MIN_QUESTION_LIMIT = 3;
const MAX_QUESTION_LIMIT = 15;

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
  const [selectedDifficulty, setSelectedDifficulty] = useState(initialDifficulty);
  const [questionLimit, setQuestionLimit] = useState(5);
  const [userId, setUserId] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [openMatches, setOpenMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(!isCreateOnly);
  const [matchesError, setMatchesError] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [currentMatch, setCurrentMatch] = useState(null);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [closingLobby, setClosingLobby] = useState(false);
  const subscriptionRef = useRef(null);
  const closingRef = useRef(false);
  const skipAutoCloseRef = useRef(false);

  const adjustQuestionLimit = useCallback((delta) => {
    setQuestionLimit((prev) => {
      const next = prev + delta;
      if (next < MIN_QUESTION_LIMIT) {
        return MIN_QUESTION_LIMIT;
      }
      if (next > MAX_QUESTION_LIMIT) {
        return MAX_QUESTION_LIMIT;
      }
      return next;
    });
  }, []);

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
        difficulty: selectedDifficulty,
        questionLimit,
        userId,
      });

      if (!result.ok) {
        throw result.error ?? new Error('Match konnte nicht erstellt werden.');
      }

      setCurrentMatch(result.match);
      setQuestionLimit(result.match.question_limit ?? questionLimit);
      setSelectedDifficulty(result.match.difficulty ?? selectedDifficulty);
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
  }, [
    attachMatchSubscription,
    creating,
    isCreateOnly,
    questionLimit,
    refreshMatches,
    selectedDifficulty,
    userId,
  ]);

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

  const cancelLobbyAsHost = useCallback(async () => {
    if (!isHostWaiting || !currentMatch) {
      return null;
    }

    try {
      const result = await abandonMatch({
        match: currentMatch,
        role: 'host',
      });

      if (result?.ok) {
        setCurrentMatch(result.match);
      }

      return result;
    } catch (err) {
      console.error('Fehler beim Schliessen der Lobby:', err);
      return null;
    }
  }, [abandonMatch, currentMatch, isHostWaiting]);

  const handleUpdateMatchSettings = useCallback(async () => {
    if (!isHostWaiting || !currentMatch || updatingSettings) {
      return;
    }

    setUpdatingSettings(true);
    setMatchesError(null);

    try {
      const result = await updateMatchSettings({
        matchId: currentMatch.id,
        userId,
        difficulty: selectedDifficulty,
        questionLimit,
      });

      if (!result.ok) {
        throw (
          result.error ??
          new Error('Einstellungen konnten nicht gespeichert werden.')
        );
      }

      setCurrentMatch(result.match);
      setQuestionLimit(result.match.question_limit ?? questionLimit);
      setSelectedDifficulty(result.match.difficulty ?? selectedDifficulty);
    } catch (err) {
      console.error('Fehler beim Aktualisieren der Lobby-Einstellungen:', err);
      setMatchesError(err);
    } finally {
      setUpdatingSettings(false);
    }
  }, [
    currentMatch,
    isHostWaiting,
    questionLimit,
    selectedDifficulty,
    updateMatchSettings,
    updatingSettings,
    userId,
  ]);

  const handleLeaveLobby = useCallback(async () => {
    if (closingRef.current) {
      return;
    }

    closingRef.current = true;
    setClosingLobby(true);

    await cancelLobbyAsHost();

    setClosingLobby(false);
    skipAutoCloseRef.current = true;
    closingRef.current = false;
    navigation.goBack();
  }, [cancelLobbyAsHost, navigation]);

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
  const participants = useMemo(() => {
    if (!currentMatch?.state) {
      return [];
    }
    const hostState = currentMatch.state.host ?? {};
    const guestState = currentMatch.state.guest ?? {};

    const items = [
      {
        key: 'host',
        role: 'Host',
        name: hostState.username ?? 'Host',
        ready: Boolean(hostState.ready),
        isPlaceholder: false,
      },
    ];

    if (guestState?.username || currentMatch.guest_id) {
      items.push({
        key: 'guest',
        role: 'Gast',
        name: guestState.username ?? 'Gast',
        ready: Boolean(guestState.ready),
        isPlaceholder: false,
      });
    } else {
      items.push({
        key: 'guest',
        role: 'Gast',
        name: 'Warte auf Gegner',
        ready: false,
        isPlaceholder: true,
      });
    }

    return items;
  }, [currentMatch]);

  const isHostWaiting = useMemo(() => {
    if (!currentMatch || !userId) {
      return false;
    }

    return (
      deriveMatchRole(currentMatch, userId) === 'host' &&
      currentMatch.status === 'waiting'
    );
  }, [currentMatch, userId]);

  const showConfigCard = isCreateOnly && !currentMatch;

  useEffect(() => {
    if (!currentMatch) {
      return;
    }
    if (
      currentMatch.question_limit &&
      currentMatch.question_limit !== questionLimit
    ) {
      setQuestionLimit(currentMatch.question_limit);
    }
    if (
      currentMatch.difficulty &&
      currentMatch.difficulty !== selectedDifficulty
    ) {
      setSelectedDifficulty(currentMatch.difficulty);
    }
  }, [currentMatch]);

  useEffect(() => {
    if (!currentMatch) {
      return;
    }

    if (
      currentMatch.status === 'cancelled' ||
      currentMatch.status === 'completed'
    ) {
      if (subscriptionRef.current) {
        subscriptionRef.current();
        subscriptionRef.current = null;
      }

      setCurrentMatch(null);

      if (!isCreateOnly) {
        refreshMatches({ force: true });
      }

      if (currentMatch.status === 'cancelled' && !closingRef.current) {
        setMatchesError(new Error('Lobby wurde geschlossen.'));
      }
    }
  }, [currentMatch, isCreateOnly, refreshMatches]);

  useEffect(() => {
    if (!userId || isCreateOnly) {
      return () => {};
    }

    const intervalId = setInterval(() => {
      refreshMatches({ force: true });
    }, 15000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isCreateOnly, refreshMatches, userId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event) => {
      if (skipAutoCloseRef.current) {
        skipAutoCloseRef.current = false;
        return;
      }

      if (!isHostWaiting || !currentMatch) {
        return;
      }

      event.preventDefault();

      if (closingRef.current) {
        return;
      }

      closingRef.current = true;

      cancelLobbyAsHost()
        .catch(() => null)
        .finally(() => {
          closingRef.current = false;
          navigation.dispatch(event.data.action);
        });
    });

    return unsubscribe;
  }, [cancelLobbyAsHost, currentMatch, isHostWaiting, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.subtitle}>Multiplayer Arena</Text>
          <Text style={styles.title}>Online Battle</Text>
        </View>
        <Pressable
          style={[
            styles.closeButton,
            closingLobby ? styles.actionDisabled : null,
          ]}
          onPress={handleLeaveLobby}
          disabled={closingLobby}
        >
          <Text style={styles.closeButtonText}>X</Text>
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

      {showConfigCard ? (
        <View style={styles.configCard}>
          <Text style={styles.configTitle}>Lobby konfigurieren</Text>

          <View style={styles.configSection}>
            <Text style={styles.configLabel}>Schwierigkeit</Text>
            <View style={styles.difficultyChips}>
              {Object.keys(DIFFICULTY_LABELS).map((key) => {
                const active = key === selectedDifficulty;
                return (
                  <Pressable
                    key={key}
                    onPress={() => setSelectedDifficulty(key)}
                    style={[
                      styles.difficultyChip,
                      active ? styles.difficultyChipActive : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.difficultyChipText,
                        active ? styles.difficultyChipTextActive : null,
                      ]}
                    >
                      {DIFFICULTY_LABELS[key]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.configSection}>
            <Text style={styles.configLabel}>Fragenanzahl</Text>
            <View style={styles.questionStepper}>
              <Pressable
                onPress={() => adjustQuestionLimit(-1)}
                style={[
                  styles.stepperButton,
                  questionLimit <= MIN_QUESTION_LIMIT
                    ? styles.stepperButtonDisabled
                    : null,
                ]}
                disabled={questionLimit <= MIN_QUESTION_LIMIT}
              >
                <Text style={styles.stepperButtonText}>-</Text>
              </Pressable>
              <Text style={styles.stepperValue}>{questionLimit}</Text>
              <Pressable
                onPress={() => adjustQuestionLimit(1)}
                style={[
                  styles.stepperButton,
                  questionLimit >= MAX_QUESTION_LIMIT
                    ? styles.stepperButtonDisabled
                    : null,
                ]}
                disabled={questionLimit >= MAX_QUESTION_LIMIT}
              >
                <Text style={styles.stepperButtonText}>+</Text>
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={handleCreateMatch}
            disabled={creating || !userId}
            style={[
              styles.startAction,
              creating ? styles.actionDisabled : null,
            ]}
          >
            <Text style={styles.startActionText}>
              {creating ? 'Erstelle Lobby ...' : 'Lobby starten'}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {!isJoinOnly && !isCreateOnly ? (
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
      ) : null}

      {currentJoinCode ? (
        <View style={styles.lobbyCard}>
          <Text style={styles.lobbyTitle}>Warte auf Gegner</Text>
          <View style={styles.codeBadge}>
            <Text style={styles.codeBadgeText}>{currentJoinCode}</Text>
          </View>

          <View style={styles.participantsHeader}>
            <Text style={styles.participantsTitle}>Spieler</Text>
            <Text style={styles.participantsCount}>
              {participants.filter((item) => !item.isPlaceholder).length}/2
            </Text>
          </View>

          <View style={styles.participantList}>
            {participants.map((participant) => (
              <View key={participant.key} style={styles.participantRow}>
                <View style={styles.participantBadge}>
                  <Text style={styles.participantBadgeText}>
                    {participant.role}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.participantName,
                    participant.isPlaceholder ? styles.participantPlaceholder : null,
                  ]}
                >
                  {participant.name}
                </Text>
              </View>
            ))}
          </View>

          {isHostWaiting ? (
            <View style={styles.lobbyConfig}>
              <Text style={styles.lobbyConfigTitle}>Lobby Einstellungen</Text>

              <View style={styles.configSection}>
                <Text style={styles.configLabel}>Schwierigkeit</Text>
                <View style={styles.difficultyChips}>
                  {Object.keys(DIFFICULTY_LABELS).map((key) => {
                    const active = key === selectedDifficulty;
                    return (
                      <Pressable
                        key={key}
                        onPress={() => setSelectedDifficulty(key)}
                        style={[
                          styles.difficultyChip,
                          active ? styles.difficultyChipActive : null,
                        ]}
                      >
                        <Text
                          style={[
                            styles.difficultyChipText,
                            active ? styles.difficultyChipTextActive : null,
                          ]}
                        >
                          {DIFFICULTY_LABELS[key]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.configSection}>
                <Text style={styles.configLabel}>Fragenanzahl</Text>
                <View style={styles.questionStepper}>
                  <Pressable
                    onPress={() => adjustQuestionLimit(-1)}
                    style={[
                      styles.stepperButton,
                      questionLimit <= MIN_QUESTION_LIMIT
                        ? styles.stepperButtonDisabled
                        : null,
                    ]}
                    disabled={questionLimit <= MIN_QUESTION_LIMIT}
                  >
                    <Text style={styles.stepperButtonText}>-</Text>
                  </Pressable>
                  <Text style={styles.stepperValue}>{questionLimit}</Text>
                  <Pressable
                    onPress={() => adjustQuestionLimit(1)}
                    style={[
                      styles.stepperButton,
                      questionLimit >= MAX_QUESTION_LIMIT
                        ? styles.stepperButtonDisabled
                        : null,
                    ]}
                    disabled={questionLimit >= MAX_QUESTION_LIMIT}
                  >
                    <Text style={styles.stepperButtonText}>+</Text>
                  </Pressable>
                </View>
              </View>

              <Pressable
                onPress={handleUpdateMatchSettings}
                disabled={updatingSettings}
                style={[
                  styles.lobbyConfigAction,
                  updatingSettings ? styles.actionDisabled : null,
                ]}
              >
                <Text style={styles.lobbyConfigActionText}>
                  {updatingSettings ? 'Speichere ...' : 'Einstellungen speichern'}
                </Text>
              </Pressable>
            </View>
          ) : null}

          <Pressable
            onPress={() => refreshMatches({ force: true })}
            style={styles.refreshWaitingButton}
          >
            <Text style={styles.refreshWaitingText}>Status aktualisieren</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}




