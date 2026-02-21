import { useCallback, useMemo } from 'react';
import { buildPublicProfilePayload } from '../../../utils/publicProfile';

export default function useLobbyProfileActions({
  isHostWaiting,
  kickingPlayer,
  participants,
  selectedProfile,
  closeProfile,
  handleKickGuest,
  openProfile,
  t,
  userId,
}) {
  const handleOpenParticipantProfile = useCallback((participant) => {
    if (!participant?.userId || participant.userId === userId) {
      return;
    }

    openProfile({
      ...buildPublicProfilePayload({
        userId: participant.userId,
        name: participant.name ?? t('Spieler'),
        username: participant.username ?? null,
        title: participant.title ?? null,
        avatarUrl: participant.avatarUrl ?? null,
        avatarIcon: participant.avatarIcon ?? null,
        avatarColor: participant.avatarColor ?? null,
        statusLabel: 'Lobby',
      }),
      lobbyParticipantKey: participant.key ?? null,
    });
  }, [openProfile, t, userId]);

  const canRemoveProfileParticipant = useMemo(() => {
    if (!isHostWaiting || kickingPlayer) {
      return false;
    }

    const selectedUserId =
      typeof selectedProfile?.userId === 'string' && selectedProfile.userId.trim()
        ? selectedProfile.userId
        : null;
    if (!selectedUserId) {
      return false;
    }

    return participants.some((participant) => (
      participant.key === 'guest'
      && participant.userId === selectedUserId
      && !participant.isPending
    ));
  }, [isHostWaiting, kickingPlayer, participants, selectedProfile?.userId]);

  const handleRemoveParticipantFromProfile = useCallback(async () => {
    const didKick = await handleKickGuest();
    if (didKick) {
      closeProfile();
    }
  }, [closeProfile, handleKickGuest]);

  return {
    canRemoveProfileParticipant,
    handleOpenParticipantProfile,
    handleRemoveParticipantFromProfile,
  };
}
