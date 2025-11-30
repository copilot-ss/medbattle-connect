import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View, Share, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';

import { supabase } from '../lib/supabaseClient';
import {
  createMatch,
  deriveMatchRole,
  fetchOpenMatches,
  getMatchById,
  joinMatch,
  subscribeToMatch,
  updateMatchSettings,
  abandonMatch,
  startMatch,
} from '../services/matchService';
import AVATARS from './settings/avatars';
import { usePreferences } from '../context/PreferencesContext';
import styles from './styles/MultiplayerLobbyScreen.styles';

const DIFFICULTY_LABELS = {
  leicht: 'Leicht',
  mittel: 'Mittel',
  schwer: 'Schwer',
};
const DIFFICULTY_OPTIONS = [
  { key: 'leicht', label: 'Leicht', accent: '#34D399' },
  { key: 'mittel', label: 'Mittel', accent: '#60A5FA' },
  { key: 'schwer', label: 'Schwer', accent: '#F472B6' },
];

const MIN_QUESTION_LIMIT = 3;
const MAX_QUESTION_LIMIT = 15;
const SHARE_ANIM = require('../../assets/animations/share_6172544.gif');

function getInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts[1]?.[0] ?? '';
  return (first + last || first).toUpperCase();
}

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
  const { avatarId } = usePreferences();
  const activeAvatarSource = useMemo(() => {
    const entry = AVATARS.find((item) => item.id === avatarId);
    return entry?.source ?? null;
  }, [avatarId]);
  const existingMatch = route?.params?.existingMatch ?? null;
  const hostBadgeIcon = require('../../assets/icons_profile/caduceus_1839855.png');

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
  const [startingMatch, setStartingMatch] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
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
      if (isHostWaiting && currentMatch) {
        pushHostSettings(selectedDifficulty, next);
      }
      return next;
    });
  }, [currentMatch, isHostWaiting, pushHostSettings, selectedDifficulty]);

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

  useEffect(() => {
    if (!currentMatch || currentMatch.status !== 'waiting') {
      return undefined;
    }

    const intervalId = setInterval(async () => {
      try {
        const result = await getMatchById(currentMatch.id);
        if (result.ok && result.match) {
          setCurrentMatch(result.match);
        }
      } catch (err) {
        console.warn('Konnte Lobby-Status nicht aktualisieren:', err);
      }
    }, 4000);

    return () => clearInterval(intervalId);
  }, [currentMatch]);

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

  const pushHostSettings = useCallback(
    async (nextDifficulty, nextQuestionLimit) => {
      if (!isHostWaiting || !currentMatch || updatingSettings) {
        return;
      }

      setUpdatingSettings(true);
      setMatchesError(null);

      try {
        const result = await updateMatchSettings({
          matchId: currentMatch.id,
          userId,
          difficulty: nextDifficulty,
          questionLimit: nextQuestionLimit,
        });

        if (!result.ok) {
          throw result.error ?? new Error('Einstellungen konnten nicht gespeichert werden.');
        }

        setCurrentMatch(result.match);
        setQuestionLimit(result.match.question_limit ?? nextQuestionLimit);
        setSelectedDifficulty(result.match.difficulty ?? nextDifficulty);
      } catch (err) {
        console.error('Fehler beim Aktualisieren der Lobby-Einstellungen:', err);
        setMatchesError(err);
      } finally {
        setUpdatingSettings(false);
      }
    },
    [currentMatch, isHostWaiting, updateMatchSettings, updatingSettings, userId]
  );

  const handleLeaveLobby = useCallback(async () => {
    if (closingRef.current) {
      return;
    }

    setShowLeaveConfirm(true);
  }, []);

  const handleConfirmLeave = useCallback(async () => {
    if (closingRef.current) {
      return;
    }
    closingRef.current = true;
    setClosingLobby(true);
    setShowLeaveConfirm(false);

    await cancelLobbyAsHost();

    setClosingLobby(false);
    skipAutoCloseRef.current = true;
    closingRef.current = false;
    navigation.goBack();
  }, [cancelLobbyAsHost, navigation]);

  const handleCancelLeave = useCallback(() => {
    setShowLeaveConfirm(false);
  }, []);

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
        avatarUrl: hostState.avatar_url ?? hostState.avatarUrl ?? null,
        avatarSource:
          hostState.avatar_source ??
          hostState.avatarSource ??
          (currentMatch.host_id === userId ? activeAvatarSource : null),
        ready: Boolean(hostState.ready),
        isPlaceholder: false,
      },
    ];

    if (guestState?.username || currentMatch.guest_id) {
      items.push({
        key: 'guest',
        role: 'Gast',
        name: guestState.username ?? 'Gast',
        avatarUrl: guestState.avatar_url ?? guestState.avatarUrl ?? null,
        avatarSource:
          guestState.avatar_source ??
          guestState.avatarSource ??
          (currentMatch.guest_id === userId ? activeAvatarSource : null),
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
        showHostBadge: false,
      });
    }

    return items;
  }, [activeAvatarSource, currentMatch, userId]);

  const isHostWaiting = useMemo(() => {
    if (!currentMatch || !userId) {
      return false;
    }

    return (
      deriveMatchRole(currentMatch, userId) === 'host' &&
      currentMatch.status === 'waiting'
    );
  }, [currentMatch, userId]);

  const hasGuestInLobby = useMemo(() => {
    if (!currentMatch) {
      return false;
    }
    return Boolean(currentMatch.guest_id || currentMatch.state?.guest?.userId);
  }, [currentMatch]);

  const showConfigCard = false;

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
    if (!isCreateOnly || currentMatch || creating || loadingUser || !userId || existingMatch) {
      return;
    }
    handleCreateMatch();
  }, [creating, currentMatch, existingMatch, handleCreateMatch, isCreateOnly, loadingUser, userId]);

  useEffect(() => {
    if (currentMatch || !existingMatch) {
      return;
    }
    setCurrentMatch(existingMatch);
    if (existingMatch.id) {
      attachMatchSubscription(existingMatch.id);
    }
  }, [attachMatchSubscription, currentMatch, existingMatch]);

  const handleCopyCode = useCallback(async () => {
    if (!currentJoinCode) {
      return;
    }
    try {
      await Clipboard.setStringAsync(currentJoinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch (err) {
      console.warn('Code konnte nicht kopiert werden:', err);
    }
  }, [currentJoinCode]);

  const handleShareCode = useCallback(async () => {
    if (!currentJoinCode) {
      return;
    }
    const deepLink = `medbattle://lobby/${currentJoinCode}`;
    const message = `Join meine MedBattle-Lobby mit dem Code ${currentJoinCode}\n${deepLink}`;
    try {
      await Share.share({ message });
    } catch (err) {
      console.warn('Teilen fehlgeschlagen:', err);
    }
  }, [currentJoinCode]);

  const handleNavigateHome = useCallback(async () => {
    if (closingLobby) {
      return;
    }

    setClosingLobby(true);
    setMatchesError(null);

    try {
      if (isHostWaiting && currentMatch) {
        await cancelLobbyAsHost();
      }
      skipAutoCloseRef.current = true;
      navigation.navigate('Home');
    } catch (err) {
      console.error('Fehler beim Verlassen der Lobby:', err);
      setMatchesError(err);
    } finally {
      setClosingLobby(false);
    }
  }, [cancelLobbyAsHost, closingLobby, currentMatch, isHostWaiting, navigation]);

  const handleStartMatch = useCallback(async () => {
    if (!isHostWaiting || !currentMatch || startingMatch || !hasGuestInLobby) {
      return;
    }

    setStartingMatch(true);
    setMatchesError(null);

    try {
      const result = await startMatch({
        matchId: currentMatch.id,
        userId,
      });

      if (!result.ok) {
        throw result.error ?? new Error('Match konnte nicht gestartet werden.');
      }

      setCurrentMatch(result.match);
    } catch (err) {
      console.error('Fehler beim Starten des Matches:', err);
      setMatchesError(err);
    } finally {
      setStartingMatch(false);
    }
  }, [currentMatch, hasGuestInLobby, isHostWaiting, startingMatch, userId]);

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

  const showCreateSetup = false;
  const participantCount = participants.filter((item) => !item.isPlaceholder).length;

  if (showCreateSetup) {
    return (
      <View style={styles.container}>
        <View style={styles.createHeader}>
          <Text style={styles.createTitle}>Lobby erstellen</Text>
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

        {matchesError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Oops!</Text>
            <Text style={styles.errorMessage}>
              {matchesError.message ?? 'Es ist ein Fehler aufgetreten.'}
            </Text>
          </View>
        ) : null}

        {loadingUser ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#60A5FA" />
            <Text style={styles.loadingText}>Profil wird geladen ...</Text>
          </View>
        ) : null}

        <View style={styles.createContent}>
          <Text style={styles.createSubtitle}>W�hle Schwierigkeit</Text>
          <View style={styles.createDifficultyColumn}>
            {DIFFICULTY_OPTIONS.map((item, index) => {
              const active = item.key === selectedDifficulty;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => setSelectedDifficulty(item.key)}
                  style={[
                    styles.createDifficultyCard,
                    {
                      borderColor: active
                        ? item.accent
                        : 'rgba(148, 163, 184, 0.35)',
                      backgroundColor: active
                        ? 'rgba(15, 23, 42, 0.95)'
                        : 'rgba(15, 23, 42, 0.8)',
                      shadowColor: item.accent,
                      shadowOpacity: active ? 0.35 : 0,
                      shadowRadius: active ? 18 : 0,
                      shadowOffset: { width: 0, height: active ? 10 : 0 },
                      elevation: active ? 8 : 0,
                    },
                    index < DIFFICULTY_OPTIONS.length - 1
                      ? styles.createDifficultySpacing
                      : null,
                  ]}
                    >
                      <Text
                        style={[
                          styles.createDifficultyLabel,
                          { color: item.accent },
                        ]}
                      >
                        {item.label}
                      </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.createQuestionBlock}>
            <Text style={styles.createQuestionLabel}>Fragenanzahl</Text>
            <View style={styles.createStepper}>
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

          <View style={styles.createSeparator}>
            <Pressable
              onPress={handleCreateMatch}
              disabled={creating || !userId}
              style={[
                styles.createPlayButton,
                creating ? styles.actionDisabled : null,
              ]}
            >
              <Text style={styles.createPlayButtonText}>
                {creating ? 'Erstelle ...' : 'Los!'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.subtitle}>Multiplayer Arena</Text>
          <Text style={styles.title}>Online Battle</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            style={[
              styles.homeButton,
              closingLobby ? styles.actionDisabled : null,
            ]}
            onPress={handleNavigateHome}
            disabled={closingLobby}
          >
            <Ionicons name="home" size={18} color="#E2E8F0" />
          </Pressable>
          {isCreateOnly ? (
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
          ) : null}
        </View>
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

  {isCreateOnly && !currentMatch ? (
    <View style={styles.loadingBox}>
      <ActivityIndicator size="small" color="#60A5FA" />
      <Text style={styles.loadingText}>
        {creating ? 'Lobby wird erstellt ...' : 'Starte Lobby ...'}
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

          <View style={styles.participantsHeader}>
            <Text style={styles.participantsTitle}>Spieler</Text>
            <Text style={styles.participantsCount}>
              {participantCount}/2
            </Text>
          </View>

          <View style={styles.participantGrid}>
            {participants.map((participant) => (
              <View key={participant.key} style={styles.participantAvatarCard}>
                <View
                  style={[
                    styles.participantAvatar,
                    participant.isPlaceholder ? styles.participantAvatarGhost : null,
                  ]}
                >
                  {participant.role === 'Host' && !participant.isPlaceholder ? (
                    <Image source={hostBadgeIcon} style={styles.hostBadge} />
                  ) : null}
                  {participant.avatarSource && !participant.isPlaceholder ? (
                    <Image source={participant.avatarSource} style={styles.participantAvatarImage} />
                  ) : participant.avatarUrl && !participant.isPlaceholder ? (
                    <Image source={{ uri: participant.avatarUrl }} style={styles.participantAvatarImage} />
                  ) : (
                    <Text style={styles.participantAvatarText}>
                      {participant.isPlaceholder ? '?' : getInitials(participant.name)}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.participantName,
                    participant.isPlaceholder ? styles.participantPlaceholder : null,
                  ]}
                  numberOfLines={1}
                >
                  {participant.name}
                </Text>
              </View>
            ))}
          </View>

          {isHostWaiting ? (
            <View style={styles.startRow}>
              <Pressable
                onPress={handleStartMatch}
                style={[
                  styles.primaryAction,
                  styles.startButton,
                  !hasGuestInLobby || startingMatch ? styles.actionDisabled : null,
                ]}
                disabled={!hasGuestInLobby || startingMatch}
              >
                <Text style={styles.primaryActionText}>
                  {startingMatch ? 'Starte ...' : 'Loslegen'}
                </Text>
              </Pressable>
              <Text style={styles.startHint}>
                {hasGuestInLobby
                  ? 'Host startet das Spiel fuer beide.'
                  : 'Warte auf einen Gast vor dem Start.'}
              </Text>
            </View>
          ) : null}

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
                        onPress={() => {
                          setSelectedDifficulty(key);
                          if (isHostWaiting && currentMatch) {
                            pushHostSettings(key, questionLimit);
                          }
                        }}
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

            </View>
          ) : null}
          <View style={styles.codeActionsRow}>
            <Pressable
              onPress={handleCopyCode}
              style={[
                styles.codeBadge,
                copied ? styles.codeBadgeSuccess : null,
              ]}
            >
              <Text style={styles.codeBadgeText}>{currentJoinCode}</Text>
              <Text style={copied ? styles.codeHintSuccess : styles.codeHint}>
                {copied ? 'Kopiert!' : 'Tippen zum Kopieren'}
              </Text>
            </Pressable>
            <Pressable onPress={handleShareCode} style={styles.shareButton}>
              <Image source={SHARE_ANIM} style={styles.shareIconAnim} />
            </Pressable>
          </View>
        </View>
      ) : null}

      {showLeaveConfirm ? (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Lobby verlassen?</Text>
            <Text style={styles.modalMessage}>
              Deine Lobby wird geschlossen und du kehrst zum Home-Screen zurueck.
            </Text>
            <View style={styles.modalActions}>
              <Pressable onPress={handleCancelLeave} style={[styles.modalButton, styles.modalButtonContinue]}>
                <Text style={styles.modalButtonContinueText}>Bleiben</Text>
              </Pressable>
              <Pressable onPress={handleConfirmLeave} style={[styles.modalButton, styles.modalButtonExit]}>
                <Text style={styles.modalButtonExitText}>X</Text>
              </Pressable>
            </View>
              </View>
            </View>
          ) : null}
    </View>
  );
}





