import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';

import {
  deriveMatchRole,
  getMatchById,
} from '../services/matchService';
import { usePreferences } from '../context/PreferencesContext';
import useCurrentAvatar from '../hooks/useCurrentAvatar';
import { getTitleProgress } from '../services/titleService';
import styles from './styles/MultiplayerLobbyScreen.styles';
import LobbyHeader from './multiplayer/LobbyHeader';
import LobbyLeaveConfirmModal from './multiplayer/LobbyLeaveConfirmModal';
import LobbyContent from './multiplayer/LobbyContent';
import LobbySettingsModal from './multiplayer/LobbySettingsModal';
import {
  DIFFICULTY_ACCENTS,
  DIFFICULTY_LABELS,
  MAX_PLAYERS,
  MAX_QUESTION_LIMIT,
  MIN_QUESTION_LIMIT,
} from './multiplayer/lobbyConstants';
import useLobbyFriends from './multiplayer/hooks/useLobbyFriends';
import useLobbyMatchState from './multiplayer/hooks/useLobbyMatchState';
import useLobbyOpenMatches from './multiplayer/hooks/useLobbyOpenMatches';
import useLobbyParticipants from './multiplayer/hooks/useLobbyParticipants';
import useLobbyUser from './multiplayer/hooks/useLobbyUser';
import useLobbyActionAnimations from './multiplayer/hooks/useLobbyActionAnimations';
import useLobbyAutoCreate from './multiplayer/hooks/useLobbyAutoCreate';
import useLobbyBackHandler from './multiplayer/hooks/useLobbyBackHandler';
import useLobbyHostSettings from './multiplayer/hooks/useLobbyHostSettings';
import useLobbyKickGuest from './multiplayer/hooks/useLobbyKickGuest';
import useLobbyMatchActions from './multiplayer/hooks/useLobbyMatchActions';
import useLobbyProfileActions from './multiplayer/hooks/useLobbyProfileActions';
import useLobbyShareActions from './multiplayer/hooks/useLobbyShareActions';
import useLobbyVisibleOpenMatches from './multiplayer/hooks/useLobbyVisibleOpenMatches';
import { parseLobbyRouteConfig } from './multiplayer/lobbyUtils';
import { useTranslation } from '../i18n/useTranslation';
import PublicProfileSheet from '../components/PublicProfileSheet';
import usePublicProfileSheet from '../hooks/usePublicProfileSheet';
import LobbyStartCountdownOverlay from './multiplayer/LobbyStartCountdownOverlay';

const START_COUNTDOWN_STEP_MS = 700;
const START_COUNTDOWN_NAVIGATE_DELAY_MS = 2850;

export default function MultiplayerLobbyScreen({ navigation, route }) {
  const { t } = useTranslation();
  const { avatarId, avatarUri, userStats, language } = usePreferences();
  const {
    avatarEntry: activeAvatar,
    avatarSource: activeAvatarSourceBase,
    avatarIcon: activeAvatarIconBase,
  } = useCurrentAvatar(avatarId);
  const activeAvatarSource = useMemo(
    () => (avatarUri ? { uri: avatarUri } : activeAvatarSourceBase),
    [avatarUri, activeAvatarSourceBase]
  );
  const activeAvatarIcon = useMemo(
    () => (!avatarUri ? activeAvatarIconBase : null),
    [avatarUri, activeAvatarIconBase]
  );
  const userTitle = useMemo(
    () => t(getTitleProgress(userStats?.xp).current?.label ?? 'Med Rookie'),
    [userStats?.xp, t]
  );
  const {
    existingMatch,
    allowCompletedLobby,
    suppressActiveNavigation,
    initialDifficulty,
    initialCategory,
    difficulty,
    isCreateOnly,
    isJoinOnly,
  } = parseLobbyRouteConfig(route);
  const [matchesError, setMatchesError] = useState(null);
  const {
    openProfile,
    closeProfile,
    selectedProfile,
    sheetProps,
  } = usePublicProfileSheet();
  const autoCreateAttemptedRef = useRef(false);
  const closingRef = useRef(false);
  const skipAutoCloseRef = useRef(false);
  const countdownTimeoutsRef = useRef([]);
  const activeStartMatchIdRef = useRef(null);
  const prefetchedMatchRef = useRef(null);
  const [showStartCountdown, setShowStartCountdown] = useState(false);
  const [startCountdownValue, setStartCountdownValue] = useState(3);

  const clearStartCountdownTimers = useCallback(() => {
    countdownTimeoutsRef.current.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    countdownTimeoutsRef.current = [];
  }, []);

  useEffect(
    () => () => {
      clearStartCountdownTimers();
    },
    [clearStartCountdownTimers]
  );

  const handleMatchActive = useCallback(
    ({ match, role }) => {
      if (!match?.id || !role) {
        return;
      }

      if (activeStartMatchIdRef.current === match.id) {
        return;
      }

      activeStartMatchIdRef.current = match.id;
      prefetchedMatchRef.current = match;
      clearStartCountdownTimers();
      setStartCountdownValue(3);
      setShowStartCountdown(true);

      getMatchById(match.id)
        .then((result) => {
          if (activeStartMatchIdRef.current !== match.id) {
            return;
          }
          if (result?.ok && result.match) {
            prefetchedMatchRef.current = result.match;
          }
        })
        .catch((err) => {
          console.warn('Konnte Match fuer Quiz-Start nicht vorladen:', err);
        });

      const scheduleStep = (value, delayMs) => {
        const timeoutId = setTimeout(() => {
          if (activeStartMatchIdRef.current !== match.id) {
            return;
          }
          setStartCountdownValue(value);
        }, delayMs);
        countdownTimeoutsRef.current.push(timeoutId);
      };

      scheduleStep(2, START_COUNTDOWN_STEP_MS);
      scheduleStep(1, START_COUNTDOWN_STEP_MS * 2);
      scheduleStep('go', START_COUNTDOWN_STEP_MS * 3);

      const navigateTimeoutId = setTimeout(() => {
        if (activeStartMatchIdRef.current !== match.id) {
          return;
        }

        const preloadedMatch =
          prefetchedMatchRef.current?.id === match.id
            ? prefetchedMatchRef.current
            : match;

        setShowStartCountdown(false);
        clearStartCountdownTimers();

        navigation.replace('Quiz', {
          difficulty: match.difficulty ?? difficulty,
          mode: 'multiplayer',
          matchId: match.id,
          joinCode: match.code,
          role,
          preloadedMatch,
        });
      }, START_COUNTDOWN_NAVIGATE_DELAY_MS);
      countdownTimeoutsRef.current.push(navigateTimeoutId);
    },
    [clearStartCountdownTimers, difficulty, navigation]
  );

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
  const visibleOpenMatches = useLobbyVisibleOpenMatches({
    openMatches,
    isJoinOnly,
    friends,
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
    allowCompletedLobby,
    suppressActiveNavigation,
    onMatchActive: handleMatchActive,
    refreshMatches,
    setMatchesError,
    closingRef,
  });

  useEffect(() => {
    if (currentMatch?.status === 'active') {
      return;
    }

    activeStartMatchIdRef.current = null;
    prefetchedMatchRef.current = null;
    setShowStartCountdown(false);
    setStartCountdownValue(3);
    clearStartCountdownTimers();
  }, [clearStartCountdownTimers, currentMatch?.status]);

  const isHostWaiting = useMemo(() => {
    if (!currentMatch || !userId) {
      return false;
    }

    return (
      deriveMatchRole(currentMatch, userId) === 'host' &&
      currentMatch.status === 'waiting'
    );
  }, [currentMatch, userId]);
  const {
    selectedDifficulty,
    setSelectedDifficulty,
    selectedCategory,
    setSelectedCategory,
    questionLimit,
    setQuestionLimit,
    updatingSettings,
    showSettingsModal,
    draftDifficulty,
    draftQuestionLimit,
    setDraftDifficulty,
    adjustDraftQuestionLimit,
    handleOpenSettings,
    handleApplySettings,
  } = useLobbyHostSettings({
    initialDifficulty,
    initialCategory,
    currentMatch,
    isHostWaiting,
    language,
    userId,
    setCurrentMatch,
    setMatchesError,
    t,
  });
  const settingsDifficultyLabel = useMemo(
    () => t(DIFFICULTY_LABELS[selectedDifficulty] ?? DIFFICULTY_LABELS.mittel),
    [selectedDifficulty, t]
  );
  const settingsQuestionLimit = useMemo(
    () =>
      Number.isFinite(questionLimit) && questionLimit > 0
        ? questionLimit
        : 5,
    [questionLimit]
  );
  const settingsCategoryLabel = useMemo(
    () =>
      typeof selectedCategory === 'string' && selectedCategory.trim()
        ? selectedCategory.trim()
        : null,
    [selectedCategory]
  );
  const {
    startPulseStyle,
    handleJoinPressIn,
    handleJoinPressOut,
    joinPressStyle,
  } = useLobbyActionAnimations({ isHostWaiting });

  const {
    currentJoinCode,
    onlineFriends,
    participants,
    participantCount,
    hasEnoughPlayers,
  } = useLobbyParticipants({
    currentMatch,
    userId,
    userCode,
    username,
    userTitle,
    avatarId,
    avatarUri,
    activeAvatar,
    activeAvatarSource,
    activeAvatarIcon,
    maxPlayers: MAX_PLAYERS,
    friends,
    t,
  });
  const {
    joinCode,
    setJoinCode,
    creating,
    joining,
    closingLobby,
    startingMatch,
    showLeaveConfirm,
    handleCreateMatch,
    handleJoinByCode,
    handleJoinQuick,
    handleLeaveLobby,
    handleConfirmLeave,
    handleCancelLeave,
    handleNavigateHome,
    handleStartMatch,
  } = useLobbyMatchActions({
    userId,
    t,
    language,
    navigation,
    isCreateOnly,
    currentMatch,
    setCurrentMatch,
    existingMatch,
    attachMatchSubscription,
    refreshMatches,
    selectedDifficulty,
    selectedCategory,
    questionLimit,
    setSelectedDifficulty,
    setSelectedCategory,
    setQuestionLimit,
    setMatchesError,
    closingRef,
    skipAutoCloseRef,
    isHostWaiting,
    hasEnoughPlayers,
  });
  useLobbyBackHandler({
    currentMatch,
    onLeaveLobby: handleLeaveLobby,
  });
  const {
    copied,
    invitingFriendCodes,
    handleCopyCode,
    handleInviteFriend,
  } = useLobbyShareActions({
    currentJoinCode,
    currentMatchId: currentMatch?.id ?? null,
    t,
  });
  const {
    kickCandidateKey,
    kickingPlayer,
    handleSelectParticipant,
    handleKickGuest,
  } = useLobbyKickGuest({
    currentMatch,
    isHostWaiting,
    userId,
    participants,
    setCurrentMatch,
    setMatchesError,
    t,
  });
  const {
    canRemoveProfileParticipant,
    handleOpenParticipantProfile,
    handleRemoveParticipantFromProfile,
  } = useLobbyProfileActions({
    isHostWaiting,
    kickingPlayer,
    participants,
    selectedProfile,
    closeProfile,
    handleKickGuest,
    openProfile,
    t,
    userId,
  });

  const hasActiveLobby = Boolean(currentMatch || existingMatch);
  const handleRefreshOpenMatches = useCallback(
    () => refreshMatches({ force: true }),
    [refreshMatches]
  );
  useLobbyAutoCreate({
    autoCreateAttemptedRef,
    isCreateOnly,
    currentMatch,
    creating,
    loadingUser,
    userId,
    existingMatch,
    onCreateMatch: handleCreateMatch,
  });

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGlowTop} pointerEvents="none" />
      <View style={styles.backgroundGlowBottom} pointerEvents="none" />
      <LobbyHeader
        isCreateOnly={isCreateOnly}
        hasActiveLobby={hasActiveLobby}
        closingLobby={closingLobby}
        onNavigateHome={handleNavigateHome}
        onLeaveLobby={handleLeaveLobby}
      />
      <View style={styles.headerStreak} />

      <LobbyContent
        loadingUser={loadingUser}
        matchesError={matchesError}
        creating={creating}
        isCreateOnly={isCreateOnly}
        isJoinOnly={isJoinOnly}
        currentMatch={currentMatch}
        joinCode={joinCode}
        onChangeJoinCode={setJoinCode}
        onJoinByCode={handleJoinByCode}
        onJoinPressIn={handleJoinPressIn}
        onJoinPressOut={handleJoinPressOut}
        joinPressStyle={joinPressStyle}
        joining={joining}
        matchesLoading={matchesLoading}
        openMatches={visibleOpenMatches}
        onRefreshMatches={handleRefreshOpenMatches}
        onJoinQuick={handleJoinQuick}
        difficultyLabel={difficultyLabel}
        onCreateMatch={handleCreateMatch}
        userId={userId}
        currentJoinCode={currentJoinCode}
        participants={participants}
        participantCount={participantCount}
        isHostWaiting={isHostWaiting}
        onSelectParticipant={handleSelectParticipant}
        onOpenParticipantProfile={handleOpenParticipantProfile}
        kickCandidateKey={kickCandidateKey}
        onKickGuest={handleKickGuest}
        kickingPlayer={kickingPlayer}
        onStartMatch={handleStartMatch}
        hasEnoughPlayers={hasEnoughPlayers}
        startingMatch={startingMatch}
        startPulseStyle={startPulseStyle}
        onOpenSettings={handleOpenSettings}
        copied={copied}
        onCopyCode={handleCopyCode}
        settingsDifficultyLabel={settingsDifficultyLabel}
        settingsQuestionLimit={settingsQuestionLimit}
        settingsCategoryLabel={settingsCategoryLabel}
        friendsLoading={friendsLoading}
        onlineFriends={onlineFriends}
        invitingFriendCodes={invitingFriendCodes}
        onInviteFriend={handleInviteFriend}
      />

      <PublicProfileSheet
        {...sheetProps}
        footerActionLabel={canRemoveProfileParticipant ? t('Entfernen') : null}
        onFooterAction={canRemoveProfileParticipant ? handleRemoveParticipantFromProfile : null}
        footerActionLoading={canRemoveProfileParticipant && kickingPlayer}
        footerActionDisabled={canRemoveProfileParticipant && kickingPlayer}
      />

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
      <LobbyStartCountdownOverlay
        visible={showStartCountdown}
        countdownValue={startCountdownValue}
      />
    </View>
  );
}

