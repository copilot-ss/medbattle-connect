import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ImageBackground, View } from 'react-native';

import {
  deriveMatchRole,
  getMatchById,
} from '../services/matchService';
import { getMatchPlayerEntries } from '../services/match/matchHelpers';
import { usePreferences } from '../context/PreferencesContext';
import useCurrentAvatar from '../hooks/useCurrentAvatar';
import useMatchStartCountdown from '../hooks/useMatchStartCountdown';
import { getTitleProgress } from '../services/titleService';
import styles from './styles/MultiplayerLobbyScreen.styles';
import LobbyHeader from './multiplayer/LobbyHeader';
import LobbyLeaveConfirmModal from './multiplayer/LobbyLeaveConfirmModal';
import LobbyContent from './multiplayer/LobbyContent';
import LobbySettingsModal from './multiplayer/LobbySettingsModal';
import {
  DEFAULT_QUESTION_LIMIT,
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

const lobbyBackgroundImage = require('../../assets/images/multiplayer-lobby-bg-mobile.jpg');

function isEffectiveCompletedLobbyHost(match, userId) {
  if (!match || !userId || match.status !== 'completed') {
    return false;
  }

  const currentRole = deriveMatchRole(match, userId);
  if (!currentRole) {
    return false;
  }

  const activeEntries = getMatchPlayerEntries(match).filter(
    (entry) => !entry.state?.gaveUp
  );
  const firstActiveEntry = activeEntries[0];

  return (
    firstActiveEntry?.role === currentRole ||
    firstActiveEntry?.state?.userId === userId
  );
}

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
    () => t(getTitleProgress(userStats?.xp).current?.label ?? 'Praktikant'),
    [userStats?.xp, t]
  );
  const {
    existingMatch,
    allowCompletedLobby,
    suppressActiveNavigation,
    suppressActiveNavigationUntilWaiting,
    initialCategory,
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
  const [shouldSuppressActiveNavigation, setShouldSuppressActiveNavigation] = useState(
    suppressActiveNavigation
  );
  const [
    shouldSuppressActiveNavigationUntilWaiting,
    setShouldSuppressActiveNavigationUntilWaiting,
  ] = useState(suppressActiveNavigationUntilWaiting);
  const navigateToQuiz = useCallback(
    ({ match, role, preloadedMatch }) => {
      navigation.replace('Quiz', {
        mode: 'multiplayer',
        matchId: match.id,
        joinCode: match.code,
        role,
        preloadedMatch,
      });
    },
    [navigation]
  );
  const {
    showStartCountdown,
    startCountdownValue,
    beginMatchStartCountdown,
    resetStartCountdown,
  } = useMatchStartCountdown({
    canStart: !shouldSuppressActiveNavigation,
    fetchLatestMatchById: getMatchById,
    onNavigate: navigateToQuiz,
  });

  const handleMatchActive = useCallback(
    ({ match, role }) => {
      beginMatchStartCountdown({ match, role });
    },
    [beginMatchStartCountdown]
  );

  const { userId, userCode, username, loadingUser } = useLobbyUser();
  const { friends, friendsLoading } = useLobbyFriends(userId);

  const {
    openMatches,
    matchesLoading,
    refreshMatches,
  } = useLobbyOpenMatches({
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
    existingMatch,
    isCreateOnly,
    allowCompletedLobby,
    suppressActiveNavigation: shouldSuppressActiveNavigation,
    onMatchActive: handleMatchActive,
    refreshMatches,
    setMatchesError,
    closingRef,
  });
  const multiplayerAccessError = useMemo(() => {
    if (loadingUser || userId || currentMatch || existingMatch) {
      return null;
    }

    return new Error(t('Bitte melde dich an, um Multiplayer zu nutzen.'));
  }, [currentMatch, existingMatch, loadingUser, t, userId]);
  const resolvedMatchesError = matchesError ?? multiplayerAccessError;

  useEffect(() => {
    if (currentMatch?.status === 'active') {
      return;
    }

    resetStartCountdown();
  }, [currentMatch?.status, resetStartCountdown]);

  const isHostWaiting = useMemo(() => {
    if (!currentMatch || !userId) {
      return false;
    }

    return (
      deriveMatchRole(currentMatch, userId) === 'host' &&
      currentMatch.status === 'waiting'
    );
  }, [currentMatch, userId]);
  const isHostCompletedLobby = useMemo(() => {
    if (!currentMatch || !userId) {
      return false;
    }

    return (
      currentMatch.status === 'completed' &&
      isEffectiveCompletedLobbyHost(currentMatch, userId)
    );
  }, [currentMatch, userId]);
  const {
    selectedCategory,
    setSelectedCategory,
    questionLimit,
    setQuestionLimit,
    updatingSettings,
    showSettingsModal,
    draftQuestionLimit,
    adjustDraftQuestionLimit,
    handleOpenSettings,
    handleApplySettings,
  } = useLobbyHostSettings({
    initialCategory,
    currentMatch,
    isHostWaiting,
    language,
    userId,
    setCurrentMatch,
    setMatchesError,
    t,
  });
  const settingsQuestionLimit = useMemo(
    () =>
      Number.isFinite(questionLimit) && questionLimit > 0
        ? questionLimit
        : DEFAULT_QUESTION_LIMIT,
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
  const allParticipantsInLobby = useMemo(() => {
    const activeParticipants = (participants ?? []).filter((item) => !item.isPlaceholder);
    return (
      activeParticipants.length > 0 &&
      activeParticipants.every((item) => item.inCurrentLobby === true)
    );
  }, [participants]);
  const showHostStartControls = isHostWaiting || isHostCompletedLobby;
  const canStartFromLobby =
    hasEnoughPlayers &&
    (isHostWaiting || (isHostCompletedLobby && allParticipantsInLobby));
  const {
    startPulseStyle,
    handleJoinPressIn,
    handleJoinPressOut,
    joinPressStyle,
  } = useLobbyActionAnimations({ isHostWaiting: canStartFromLobby });
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
    selectedCategory,
    questionLimit,
    setSelectedCategory,
    setQuestionLimit,
    setMatchesError,
    closingRef,
    skipAutoCloseRef,
    canStartFromLobby,
  });
  useEffect(() => {
    const nextStatus = currentMatch?.status ?? null;

    if (!shouldSuppressActiveNavigation || !nextStatus) {
      return;
    }

    if (shouldSuppressActiveNavigationUntilWaiting) {
      if (nextStatus === 'waiting' || nextStatus === 'active') {
        setShouldSuppressActiveNavigationUntilWaiting(false);
        setShouldSuppressActiveNavigation(false);
      }
      return;
    }

    if (nextStatus !== 'completed') {
      setShouldSuppressActiveNavigation(false);
    }
  }, [
    currentMatch?.status,
    shouldSuppressActiveNavigation,
    shouldSuppressActiveNavigationUntilWaiting,
  ]);
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
    canAddProfileFriend,
    canRemoveProfileParticipant,
    handleAddFriendFromProfile,
    handleOpenParticipantProfile,
    handleRemoveParticipantFromProfile,
    profileActionDisabled,
    profileActionIcon,
    profileActionLabel,
    profileActionLoading,
  } = useLobbyProfileActions({
    friends,
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
    <ImageBackground
      source={lobbyBackgroundImage}
      defaultSource={lobbyBackgroundImage}
      style={styles.container}
      imageStyle={styles.backgroundImage}
      resizeMode="cover"
      resizeMethod="resize"
      progressiveRenderingEnabled
      fadeDuration={0}
    >
      <View style={styles.backgroundOverlay}>
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
          matchesError={resolvedMatchesError}
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
          onCreateMatch={handleCreateMatch}
          userId={userId}
          currentJoinCode={currentJoinCode}
          participants={participants}
          participantCount={participantCount}
          isHostWaiting={isHostWaiting}
          showHostStartControls={showHostStartControls}
          canStartMatch={canStartFromLobby}
          canOpenSettings={isHostWaiting}
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
          settingsQuestionLimit={settingsQuestionLimit}
          settingsCategoryLabel={settingsCategoryLabel}
          friendsLoading={friendsLoading}
          onlineFriends={onlineFriends}
          invitingFriendCodes={invitingFriendCodes}
          onInviteFriend={handleInviteFriend}
        />

        <PublicProfileSheet
          {...sheetProps}
          primaryActionLabel={canAddProfileFriend ? profileActionLabel : null}
          onPrimaryAction={canAddProfileFriend ? handleAddFriendFromProfile : null}
          primaryActionIcon={canAddProfileFriend ? profileActionIcon : 'person-add'}
          primaryActionLoading={canAddProfileFriend && profileActionLoading}
          primaryActionDisabled={canAddProfileFriend && profileActionDisabled}
          footerActionLabel={canRemoveProfileParticipant ? 'Remove from lobby' : null}
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
          categoryLabel={settingsCategoryLabel}
          questionLimit={draftQuestionLimit}
          min={MIN_QUESTION_LIMIT}
          max={MAX_QUESTION_LIMIT}
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
    </ImageBackground>
  );
}

