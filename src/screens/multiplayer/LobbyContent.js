import { ScrollView } from 'react-native';
import styles from '../styles/MultiplayerLobbyScreen.styles';
import { MAX_PLAYERS } from './lobbyConstants';
import LobbyCreateAction from './LobbyCreateAction';
import LobbyJoinSection from './LobbyJoinSection';
import LobbyParticipantsCard from './LobbyParticipantsCard';
import LobbyStatusCards from './LobbyStatusCards';

export default function LobbyContent({
  loadingUser,
  matchesError,
  creating,
  isCreateOnly,
  isJoinOnly,
  currentMatch,
  joinCode,
  onChangeJoinCode,
  onJoinByCode,
  onJoinPressIn,
  onJoinPressOut,
  joinPressStyle,
  joining,
  matchesLoading,
  openMatches,
  onRefreshMatches,
  onJoinQuick,
  difficultyLabel,
  onCreateMatch,
  userId,
  currentJoinCode,
  participants,
  participantCount,
  isHostWaiting,
  onSelectParticipant,
  onOpenParticipantProfile,
  kickCandidateKey,
  onKickGuest,
  kickingPlayer,
  onStartMatch,
  hasEnoughPlayers,
  startingMatch,
  startPulseStyle,
  onOpenSettings,
  copied,
  onCopyCode,
  settingsDifficultyLabel,
  settingsQuestionLimit,
  settingsCategoryLabel,
  friendsLoading,
  onlineFriends,
  invitingFriendCodes,
  onInviteFriend,
}) {
  const showJoinSection = !currentMatch;
  const showCreateAction = Boolean(!isJoinOnly && !isCreateOnly && !currentMatch);
  const showParticipantsCard = Boolean(currentJoinCode);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <LobbyStatusCards
        loadingUser={loadingUser}
        matchesError={matchesError}
        creating={creating}
        isCreateOnly={isCreateOnly}
        currentMatch={currentMatch}
      />

      {showJoinSection ? (
        <LobbyJoinSection
          isCreateOnly={isCreateOnly}
          isJoinOnly={isJoinOnly}
          joinCode={joinCode}
          onChangeJoinCode={onChangeJoinCode}
          onJoinByCode={onJoinByCode}
          onJoinPressIn={onJoinPressIn}
          onJoinPressOut={onJoinPressOut}
          joinPressStyle={joinPressStyle}
          joining={joining}
          matchesLoading={matchesLoading}
          openMatches={openMatches}
          onRefreshMatches={onRefreshMatches}
          onJoinQuick={onJoinQuick}
          difficultyLabel={difficultyLabel}
        />
      ) : null}

      {showCreateAction ? (
        <LobbyCreateAction
          creating={creating}
          userId={userId}
          onCreateMatch={onCreateMatch}
        />
      ) : null}

      {showParticipantsCard ? (
        <LobbyParticipantsCard
          participants={participants}
          participantCount={participantCount}
          maxPlayers={MAX_PLAYERS}
          isHostWaiting={isHostWaiting}
          onSelectParticipant={onSelectParticipant}
          onOpenParticipantProfile={onOpenParticipantProfile}
          kickCandidateKey={kickCandidateKey}
          onKickGuest={onKickGuest}
          kickingPlayer={kickingPlayer}
          onStartMatch={onStartMatch}
          hasEnoughPlayers={hasEnoughPlayers}
          startingMatch={startingMatch}
          startPulseStyle={startPulseStyle}
          onOpenSettings={onOpenSettings}
          currentJoinCode={currentJoinCode}
          copied={copied}
          onCopyCode={onCopyCode}
          difficultyLabel={settingsDifficultyLabel}
          questionLimit={settingsQuestionLimit}
          categoryLabel={settingsCategoryLabel}
          friendsLoading={friendsLoading}
          onlineFriends={onlineFriends}
          invitingFriendCodes={invitingFriendCodes}
          onInviteFriend={onInviteFriend}
        />
      ) : null}
    </ScrollView>
  );
}
