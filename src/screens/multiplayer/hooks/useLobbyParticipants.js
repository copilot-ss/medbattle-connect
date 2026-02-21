import { useMemo } from 'react';
import useLobbyPresence from './useLobbyPresence';
import {
  buildLobbyParticipants,
  getPresenceParticipantCount,
} from '../lobbyParticipantUtils';

export default function useLobbyParticipants({
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
  maxPlayers,
  friends,
  t,
}) {
  const currentJoinCode = currentMatch?.code ?? null;
  const presenceParticipantCount = useMemo(
    () => getPresenceParticipantCount(currentMatch),
    [currentMatch]
  );

  const { onlineFriends, lobbyParticipants } = useLobbyPresence({
    userId,
    userCode,
    username,
    userTitle,
    avatarId: activeAvatar?.id ?? avatarId ?? null,
    avatarUri,
    avatarIcon: activeAvatarIcon,
    avatarColor: activeAvatar?.color ?? null,
    currentJoinCode,
    participantCount: presenceParticipantCount,
    maxPlayers,
    friends,
  });

  const participants = useMemo(() => {
    return buildLobbyParticipants({
      currentMatch,
      lobbyParticipants,
      userId,
      activeAvatarColor: activeAvatar?.color ?? null,
      activeAvatarSource,
      activeAvatarIcon,
      hostLabel: t('Host'),
      guestLabel: t('Gast'),
    });
  }, [
    activeAvatar?.color,
    activeAvatarIcon,
    activeAvatarSource,
    currentMatch,
    lobbyParticipants,
    t,
    userId,
  ]);

  const participantCount = participants.filter((item) => !item.isPlaceholder).length;
  const hasEnoughPlayers = participantCount >= 2;

  return {
    currentJoinCode,
    onlineFriends,
    participants,
    participantCount,
    hasEnoughPlayers,
  };
}
