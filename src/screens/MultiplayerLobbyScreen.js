import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, BackHandler, Easing, Pressable, ScrollView, Text, View, Share } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';

import {
  createMatch,
  deriveMatchRole,
  joinMatch,
  updateMatchSettings,
  kickMatchGuest,
  abandonMatch,
  startMatch,
} from '../services/matchService';
import AVATARS from './settings/avatars';
import { usePreferences } from '../context/PreferencesContext';
import { getTitleProgress } from '../services/titleService';
import styles from './styles/MultiplayerLobbyScreen.styles';
import DifficultyChips from './multiplayer/DifficultyChips';
import LobbyHeader from './multiplayer/LobbyHeader';
import LobbyJoinSection from './multiplayer/LobbyJoinSection';
import LobbyLeaveConfirmModal from './multiplayer/LobbyLeaveConfirmModal';
import LobbyParticipantsCard from './multiplayer/LobbyParticipantsCard';
import LobbySettingsModal from './multiplayer/LobbySettingsModal';
import QuestionLimitStepper from './multiplayer/QuestionLimitStepper';
import {
  DEFAULT_QUESTION_LIMIT,
  DIFFICULTY_ACCENTS,
  DIFFICULTY_LABELS,
  MAX_PLAYERS,
  MAX_QUESTION_LIMIT,
  MIN_QUESTION_LIMIT,
} from './multiplayer/lobbyConstants';
import useLobbyFriends from './multiplayer/hooks/useLobbyFriends';
import useLobbyMatchState from './multiplayer/hooks/useLobbyMatchState';
import useLobbyOpenMatches from './multiplayer/hooks/useLobbyOpenMatches';
import useLobbyPresence from './multiplayer/hooks/useLobbyPresence';
import useLobbyUser from './multiplayer/hooks/useLobbyUser';
import { clearActiveLobby } from '../utils/activeLobbyStorage';
import { useTranslation } from '../i18n/useTranslation';

export default function MultiplayerLobbyScreen({ navigation, route }) {
  const { t } = useTranslation();
  const { avatarId, avatarUri, userStats, language } = usePreferences();
  const activeAvatarSource = useMemo(() => {
    if (avatarUri) {
      return { uri: avatarUri };
    }
    const entry = AVATARS.find((item) => item.id === avatarId);
    return entry?.source ?? null;
  }, [avatarId, avatarUri]);
  const userTitle = useMemo(
    () => t(getTitleProgress(userStats?.xp).current?.label ?? 'Med Rookie'),
    [userStats?.xp, t]
  );
  const existingMatch = route?.params?.existingMatch ?? null;

  const initialDifficulty =
    typeof route?.params?.difficulty === 'string'
      ? route.params.difficulty
      : 'mittel';
  const initialCategory =
    typeof route?.params?.category === 'string'
      ? route.params.category
      : existingMatch?.category ?? null;
  const initialMode =
    typeof route?.params?.mode === 'string' ? route.params.mode.toLowerCase() : 'hub';
  const normalizedMode =
    initialMode === 'create' || initialMode === 'join' ? initialMode : 'hub';
  const isCreateOnly = normalizedMode === 'create';
  const isJoinOnly = normalizedMode === 'join';

  const difficulty = initialDifficulty;
  const [selectedDifficulty, setSelectedDifficulty] = useState(initialDifficulty);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [questionLimit, setQuestionLimit] = useState(DEFAULT_QUESTION_LIMIT);
  const [matchesError, setMatchesError] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [closingLobby, setClosingLobby] = useState(false);
  const [startingMatch, setStartingMatch] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [draftDifficulty, setDraftDifficulty] = useState(initialDifficulty);
  const [draftQuestionLimit, setDraftQuestionLimit] = useState(DEFAULT_QUESTION_LIMIT);
  const [kickCandidateKey, setKickCandidateKey] = useState(null);
  const [kickingPlayer, setKickingPlayer] = useState(false);
  const autoCreateAttemptedRef = useRef(false);
  const closingRef = useRef(false);
  const skipAutoCloseRef = useRef(false);
  const hostSettingsVersionRef = useRef(0);
  const startPulseValue = useRef(new Animated.Value(0)).current;
  const startPulseLoopRef = useRef(null);
  const joinPressValue = useRef(new Animated.Value(0)).current;

  const { userId, userCode, username, loadingUser } = useLobbyUser();
  const { friends, friendsLoading } = useLobbyFriends(userId);

  const difficultyLabel = useMemo(
    () => DIFFICULTY_LABELS[difficulty] ?? DIFFICULTY_LABELS.mittel,
    [difficulty]
  );
  const {
    openMatches,
    matchesLoading,
    refreshMatches,
  } = useLobbyOpenMatches({
    difficulty,
    isCreateOnly,
    userId,
    setMatchesError,
  });
  const {
    currentMatch,
    setCurrentMatch,
    attachMatchSubscription,
  } = useLobbyMatchState({
    navigation,
    userId,
    difficulty,
    existingMatch,
    isCreateOnly,
    refreshMatches,
    setMatchesError,
    closingRef,
  });

  useEffect(() => {
    if (currentMatch?.category && currentMatch.category !== selectedCategory) {
      setSelectedCategory(currentMatch.category);
    }
  }, [currentMatch?.category, selectedCategory]);

  const isHostWaiting = useMemo(() => {
    if (!currentMatch || !userId) {
      return false;
    }

    return (
      deriveMatchRole(currentMatch, userId) === 'host' &&
      currentMatch.status === 'waiting'
    );
  }, [currentMatch, userId]);

  useEffect(() => {
    if (!isHostWaiting) {
      if (startPulseLoopRef.current) {
        startPulseLoopRef.current.stop();
        startPulseLoopRef.current = null;
      }
      startPulseValue.setValue(0);
      return;
    }

    startPulseValue.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(startPulseValue, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(startPulseValue, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    startPulseLoopRef.current = loop;
    loop.start();

    return () => {
      loop.stop();
    };
  }, [isHostWaiting, startPulseValue]);

  const startPulseStyle = useMemo(
    () => ({
      transform: [
        { scale: 0.9 },
        {
          scale: startPulseValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.96, 1.1],
          }),
        },
      ],
    }),
    [startPulseValue]
  );

  const handleJoinPressIn = useCallback(() => {
    Animated.timing(joinPressValue, {
      toValue: 1,
      duration: 140,
      useNativeDriver: false,
    }).start();
  }, [joinPressValue]);

  const handleJoinPressOut = useCallback(() => {
    Animated.timing(joinPressValue, {
      toValue: 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [joinPressValue]);

  const joinPressStyle = useMemo(
    () => ({
      transform: [
        {
          scale: joinPressValue.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.06],
          }),
        },
      ],
      backgroundColor: joinPressValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['#38BDF8', '#7DD3FC'],
      }),
    }),
    [joinPressValue]
  );

  const pushHostSettings = useCallback(
    async (nextDifficulty, nextQuestionLimit) => {
      if (!isHostWaiting || !currentMatch || updatingSettings) {
        return;
      }

      const requestVersion = hostSettingsVersionRef.current + 1;
      hostSettingsVersionRef.current = requestVersion;
      setUpdatingSettings(true);
      setMatchesError(null);

      try {
        const result = await updateMatchSettings({
          matchId: currentMatch.id,
          userId,
          difficulty: nextDifficulty,
          questionLimit: nextQuestionLimit,
          language,
          fallbackLanguage: language === 'de' ? 'de' : null,
        });

        if (!result.ok) {
          throw result.error ?? new Error(t('Einstellungen konnten nicht gespeichert werden.'));
        }

        if (requestVersion === hostSettingsVersionRef.current) {
          setCurrentMatch(result.match);
          setQuestionLimit(result.match.question_limit ?? nextQuestionLimit);
          setSelectedDifficulty(result.match.difficulty ?? nextDifficulty);
          setSelectedCategory(result.match.category ?? selectedCategory);
        }
      } catch (err) {
        console.error('Fehler beim Aktualisieren der Lobby-Einstellungen:', err);
        setMatchesError(err);
      } finally {
        if (requestVersion === hostSettingsVersionRef.current) {
          setUpdatingSettings(false);
        }
      }
    },
    [
      currentMatch,
      isHostWaiting,
      language,
      selectedCategory,
      updateMatchSettings,
      updatingSettings,
      userId,
    ]
  );

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
        category: selectedCategory,
        language,
        fallbackLanguage: language === 'de' ? 'de' : null,
        userId,
      });

      if (!result.ok) {
        throw result.error ?? new Error(t('Match konnte nicht erstellt werden.'));
      }

      setCurrentMatch(result.match);
      setQuestionLimit(result.match.question_limit ?? questionLimit);
      setSelectedDifficulty(result.match.difficulty ?? selectedDifficulty);
      setSelectedCategory(result.match.category ?? selectedCategory);
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
    language,
    questionLimit,
    refreshMatches,
    selectedCategory,
    selectedDifficulty,
    userId,
  ]);

  const handleJoinByCode = useCallback(async () => {
    if (!userId || joining) {
      return;
    }

    const normalized = joinCode.trim().toUpperCase();

    if (!normalized) {
      setMatchesError(new Error(t('Bitte gib einen Match-Code ein.')));
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
        throw result.error ?? new Error(t('Match konnte nicht beigetreten werden.'));
      }

      setCurrentMatch(result.match);
      attachMatchSubscription(result.match.id);
      setJoinCode('');
    } catch (err) {
      console.error('Fehler beim Beitritt \u00fcber Code:', err);
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
          throw result.error ?? new Error(t('Match konnte nicht beigetreten werden.'));
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

    try {
      if (currentMatch && currentMatch.status === 'waiting') {
        const role = deriveMatchRole(currentMatch, userId);
        if (role === 'host' || role === 'guest') {
          await abandonMatch({ match: currentMatch, role });
        }
      }
    } catch (err) {
      console.warn('Konnte Lobby nicht verlassen:', err);
    }

    setClosingLobby(false);
    setCurrentMatch(null);
    clearActiveLobby();
    skipAutoCloseRef.current = true;
    closingRef.current = false;
    navigation.navigate('MainTabs', {
      screen: 'Home',
      params: { activeLobby: null, lobbyClosed: true },
    });
  }, [abandonMatch, currentMatch, navigation, userId]);

  const handleCancelLeave = useCallback(() => {
    setShowLeaveConfirm(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (currentMatch) {
          handleLeaveLobby();
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        subscription.remove();
      };
    }, [currentMatch, handleLeaveLobby])
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
            <Text style={{ color: DIFFICULTY_ACCENTS[item.difficulty] ?? '#94A3B8' }}>
              {t(DIFFICULTY_LABELS[item.difficulty] ?? difficultyLabel)}
            </Text>
            {' - '}
            {item.questionLimit} {t('Fragen')}
          </Text>
          {item.hostUsername ? (
            <Text style={styles.matchHost}>{t('Host')}: {item.hostUsername}</Text>
          ) : null}
        </View>
        <View style={styles.matchAction}>
          <Text style={styles.matchActionText}>{t('Beitreten')}</Text>
        </View>
      </Pressable>
    ),
    [difficultyLabel, handleJoinQuick, t]
  );

  const currentJoinCode = currentMatch?.code ?? null;
  const participants = useMemo(() => {
    if (!currentMatch?.state) {
      return [];
    }
    const hostState = currentMatch.state.host ?? {};
    const guestState = currentMatch.state.guest ?? {};
    const hostIsSelf =
      currentMatch.host_id === userId ||
      hostState.userId === userId;
    const guestIsSelf =
      currentMatch.guest_id === userId ||
      guestState.userId === userId;

    const items = [
      {
        key: 'host',
        role: t('Host'),
        name: hostState.username ?? t('Host'),
        avatarUrl: hostState.avatar_url ?? hostState.avatarUrl ?? null,
        avatarSource: hostState.avatar_source
          ?? hostState.avatarSource
          ?? (hostIsSelf ? activeAvatarSource : null),
        ready: Boolean(hostState.ready),
        isPlaceholder: false,
      },
    ];

    if (guestState?.username || currentMatch.guest_id) {
      items.push({
        key: 'guest',
        role: t('Gast'),
        name: guestState.username ?? t('Gast'),
        avatarUrl: guestState.avatar_url ?? guestState.avatarUrl ?? null,
        avatarSource: guestState.avatar_source
          ?? guestState.avatarSource
          ?? (guestIsSelf ? activeAvatarSource : null),
        ready: Boolean(guestState.ready),
        isPlaceholder: false,
      });
    }

    return items;
  }, [activeAvatarSource, currentMatch, t, userId]);
  const participantCount = participants.filter((item) => !item.isPlaceholder).length;
  const hasEnoughPlayers = participantCount >= 2;

  const handleOpenSettings = useCallback(() => {
    if (!isHostWaiting) {
      return;
    }
    setDraftDifficulty(selectedDifficulty);
    setDraftQuestionLimit(questionLimit);
    setShowSettingsModal(true);
  }, [isHostWaiting, questionLimit, selectedDifficulty]);

  const handleApplySettings = useCallback(() => {
    setShowSettingsModal(false);

    if (!isHostWaiting || !currentMatch) {
      return;
    }

    if (
      draftDifficulty === selectedDifficulty &&
      draftQuestionLimit === questionLimit
    ) {
      return;
    }

    pushHostSettings(draftDifficulty, draftQuestionLimit);
  }, [
    currentMatch,
    draftDifficulty,
    draftQuestionLimit,
    isHostWaiting,
    pushHostSettings,
    questionLimit,
    selectedDifficulty,
  ]);

  const adjustDraftQuestionLimit = useCallback((delta) => {
    setDraftQuestionLimit((prev) => {
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

  const handleSelectParticipant = useCallback(
    (participantKey) => {
      if (!isHostWaiting || participantKey !== 'guest') {
        return;
      }
      setKickCandidateKey((prev) =>
        prev === participantKey ? null : participantKey
      );
    },
    [isHostWaiting]
  );

  const handleKickGuest = useCallback(async () => {
    if (!currentMatch || !isHostWaiting || kickingPlayer) {
      return;
    }

    setKickingPlayer(true);
    setMatchesError(null);

    try {
      const result = await kickMatchGuest({
        matchId: currentMatch.id,
        userId,
      });

      if (!result.ok) {
        throw result.error ?? new Error(t('Spieler konnte nicht entfernt werden.'));
      }

      setCurrentMatch(result.match);
      setKickCandidateKey(null);
    } catch (err) {
      console.error('Fehler beim Entfernen des Spielers:', err);
      setMatchesError(err);
    } finally {
      setKickingPlayer(false);
    }
  }, [currentMatch, isHostWaiting, kickingPlayer, kickMatchGuest, userId]);

  useEffect(() => {
    if (!kickCandidateKey) {
      return;
    }
    if (!isHostWaiting) {
      setKickCandidateKey(null);
      return;
    }
    const exists = participants.some((participant) => participant.key === kickCandidateKey);
    if (!exists) {
      setKickCandidateKey(null);
    }
  }, [isHostWaiting, kickCandidateKey, participants]);

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
    if (!isCreateOnly || currentMatch || creating || loadingUser || !userId || existingMatch) {
      return;
    }
    if (autoCreateAttemptedRef.current) {
      return;
    }
    autoCreateAttemptedRef.current = true;
    handleCreateMatch();
  }, [creating, currentMatch, existingMatch, handleCreateMatch, isCreateOnly, loadingUser, userId]);

  useEffect(() => {
    if (!isCreateOnly) {
      autoCreateAttemptedRef.current = false;
    }
  }, [isCreateOnly]);

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
  }, [currentJoinCode, t]);

  const handleShareCode = useCallback(async () => {
    if (!currentJoinCode) {
      return;
    }
    const deepLink = `medbattle://lobby/${currentJoinCode}`;
    const message = t('Join meine MedBattle-Lobby mit dem Code {code}\n{link}', {
      code: currentJoinCode,
      link: deepLink,
    });
    try {
      await Share.share({ message });
    } catch (err) {
      console.warn('Teilen fehlgeschlagen:', err);
    }
  }, [currentJoinCode]);

  const handleInviteFriend = useCallback(
    async (friend) => {
      if (!currentJoinCode) {
        return;
      }
      const friendName = friend?.username ?? t('Freund:in');
      const deepLink = `medbattle://lobby/${currentJoinCode}`;
      const message = t('Hey {name}, join meine MedBattle-Lobby mit dem Code {code}\n{link}', {
        name: friendName,
        code: currentJoinCode,
        link: deepLink,
      });
      try {
        await Share.share({ message });
      } catch (err) {
        console.warn('Freund konnte nicht eingeladen werden:', err);
      }
    },
    [currentJoinCode, t]
  );

  const handleNavigateHome = useCallback(async () => {
    if (closingLobby) {
      return;
    }
    setClosingLobby(true);
    setMatchesError(null);

    const activeLobby = currentMatch
      ? {
          code: currentMatch.code ?? null,
          players: currentMatch.state
            ? [currentMatch.state.host, currentMatch.state.guest].filter(
                (p) => p?.userId
              ).length
            : 1,
          capacity: MAX_PLAYERS,
          existingMatch: currentMatch,
        }
      : null;

    skipAutoCloseRef.current = true;
    navigation.navigate('MainTabs', {
      screen: 'Home',
      params: { activeLobby },
    });
    setClosingLobby(false);
  }, [closingLobby, currentMatch, navigation]);

  const handleStartMatch = useCallback(async () => {
    if (!isHostWaiting || !currentMatch || startingMatch || !hasEnoughPlayers) {
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
        throw result.error ?? new Error(t('Match konnte nicht gestartet werden.'));
      }

      setCurrentMatch(result.match);
    } catch (err) {
      console.error('Fehler beim Starten des Matches:', err);
      setMatchesError(err);
    } finally {
      setStartingMatch(false);
    }
  }, [currentMatch, hasEnoughPlayers, isHostWaiting, startingMatch, userId]);

  useEffect(() => {
    return navigation.addListener('beforeRemove', () => {
      skipAutoCloseRef.current = false;
    });
  }, [navigation]);

  const showCreateSetup = false;
  const { onlineFriends } = useLobbyPresence({
    userId,
    userCode,
    username,
    userTitle,
    currentJoinCode,
    participantCount,
    maxPlayers: MAX_PLAYERS,
    friends,
  });

  if (showCreateSetup) {
    return (
      <View style={styles.container}>
        <View style={styles.createHeader}>
          <Text style={styles.createTitle}>{t('Lobby erstellen')}</Text>
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
            <Text style={styles.errorTitle}>{t('Oops!')}</Text>
            <Text style={styles.errorMessage}>
              {t(matchesError.message ?? 'Es ist ein Fehler aufgetreten.')}
            </Text>
          </View>
        ) : null}

        {loadingUser ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#60A5FA" />
            <Text style={styles.loadingText}>{t('Profil wird geladen ...')}</Text>
          </View>
        ) : null}

        <View style={styles.createContent}>
          <Text style={styles.createSubtitle}>
            {t('Einstellungen später im Lobby-Menü anpassen.')}
          </Text>

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
                {creating ? t('Erstelle ...') : t('Los!')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGlowTop} pointerEvents="none" />
      <View style={styles.backgroundGlowBottom} pointerEvents="none" />
      <LobbyHeader
        isCreateOnly={isCreateOnly}
        closingLobby={closingLobby}
        onNavigateHome={handleNavigateHome}
        onLeaveLobby={handleLeaveLobby}
      />
      <View style={styles.headerStreak} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loadingUser ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#60A5FA" />
            <Text style={styles.loadingText}>{t('Profil wird geladen ...')}</Text>
          </View>
        ) : null}

        {matchesError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>{t('Oops!')}</Text>
            <Text style={styles.errorMessage}>
              {t(matchesError.message ?? 'Es ist ein Fehler aufgetreten.')}
            </Text>
          </View>
        ) : null}

        {isCreateOnly && !currentMatch ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#60A5FA" />
            <Text style={styles.loadingText}>
              {creating ? t('Lobby wird erstellt ...') : t('Starte Lobby ...')}
            </Text>
          </View>
        ) : null}

        {showConfigCard ? (
          <View style={styles.configCard}>
            <Text style={styles.configTitle}>{t('Lobby konfigurieren')}</Text>

            <View style={styles.configSection}>
              <Text style={styles.configLabel}>{t('Kategorie')}</Text>
              <Text style={styles.configValue}>
                {t(selectedCategory ?? 'Alle Themen')}
              </Text>
            </View>

            <View style={styles.configSection}>
              <Text style={styles.configLabel}>{t('Schwierigkeit')}</Text>
              <DifficultyChips
                labels={DIFFICULTY_LABELS}
                accents={DIFFICULTY_ACCENTS}
                selectedKey={selectedDifficulty}
                onSelect={(key) => setSelectedDifficulty(key)}
              />
            </View>

            <View style={styles.configSection}>
              <Text style={styles.configLabel}>{t('Fragenanzahl')}</Text>
              <QuestionLimitStepper
                value={questionLimit}
                min={MIN_QUESTION_LIMIT}
                max={MAX_QUESTION_LIMIT}
                onDecrement={() => adjustQuestionLimit(-1)}
                onIncrement={() => adjustQuestionLimit(1)}
              />
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
                {creating ? t('Erstelle Lobby ...') : t('Lobby starten')}
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
                {creating ? t('Erstelle Lobby ...') : t('Start')}
              </Text>
            </Pressable>
          </View>
        ) : null}

        <LobbyJoinSection
          isCreateOnly={isCreateOnly}
          isJoinOnly={isJoinOnly}
          joinCode={joinCode}
          onChangeJoinCode={setJoinCode}
          onJoinByCode={handleJoinByCode}
          onJoinPressIn={handleJoinPressIn}
          onJoinPressOut={handleJoinPressOut}
          joinPressStyle={joinPressStyle}
          joining={joining}
          matchesLoading={matchesLoading}
          openMatches={openMatches}
          onRefreshMatches={() => refreshMatches({ force: true })}
          renderMatch={renderMatch}
        />

        {currentJoinCode ? (
          <LobbyParticipantsCard
            participants={participants}
            participantCount={participantCount}
            maxPlayers={MAX_PLAYERS}
            isHostWaiting={isHostWaiting}
            onSelectParticipant={handleSelectParticipant}
            kickCandidateKey={kickCandidateKey}
            onKickGuest={handleKickGuest}
            kickingPlayer={kickingPlayer}
            onStartMatch={handleStartMatch}
            hasEnoughPlayers={hasEnoughPlayers}
            startingMatch={startingMatch}
            startPulseStyle={startPulseStyle}
            onOpenSettings={handleOpenSettings}
            currentJoinCode={currentJoinCode}
            copied={copied}
            onCopyCode={handleCopyCode}
            onShareCode={handleShareCode}
            friendsLoading={friendsLoading}
            onlineFriends={onlineFriends}
            onInviteFriend={handleInviteFriend}
          />
        ) : null}

      </ScrollView>

      <LobbyLeaveConfirmModal
        visible={showLeaveConfirm}
        onCancel={handleCancelLeave}
        onConfirm={handleConfirmLeave}
      />
      <LobbySettingsModal
        visible={showSettingsModal}
        labels={DIFFICULTY_LABELS}
        accents={DIFFICULTY_ACCENTS}
        difficulty={draftDifficulty}
        questionLimit={draftQuestionLimit}
        min={MIN_QUESTION_LIMIT}
        max={MAX_QUESTION_LIMIT}
        onChangeDifficulty={setDraftDifficulty}
        onDecrement={() => adjustDraftQuestionLimit(-1)}
        onIncrement={() => adjustDraftQuestionLimit(1)}
        onApply={handleApplySettings}
        isLoading={updatingSettings}
      />
    </View>
  );
}





