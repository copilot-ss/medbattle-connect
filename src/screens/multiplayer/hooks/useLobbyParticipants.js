import { useEffect, useMemo, useState } from 'react';
import useLobbyPresence from './useLobbyPresence';
import { fetchPublicProfileByUserId } from '../../../services/userService';
import {
  getAvatarPresetSource,
  isRemoteAvatarUrl,
} from '../../../utils/avatarUtils';
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
  const currentMatchId = currentMatch?.id ?? null;
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
    currentMatchId,
    participantCount: presenceParticipantCount,
    maxPlayers,
    friends,
  });

  const baseParticipants = useMemo(() => {
    return buildLobbyParticipants({
      currentMatch,
      lobbyParticipants,
      userId,
      activeAvatarColor: activeAvatar?.color ?? null,
      activeAvatarSource,
      activeAvatarIcon,
      hostLabel: t('Host'),
      guestLabel: t('Gast'),
      pendingQuizLabel: t('Im Quiz'),
      pendingReturnLabel: t('Wartet auf Rückkehr'),
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
  const [participantProfiles, setParticipantProfiles] = useState({});

  useEffect(() => {
    const targetUserIds = baseParticipants
      .filter((participant) => {
        if (!participant?.userId || participant.userId === userId || participant.isPlaceholder) {
          return false;
        }
        return true;
      })
      .map((participant) => participant.userId);

    const missingUserIds = targetUserIds.filter(
      (participantUserId) =>
        !Object.prototype.hasOwnProperty.call(participantProfiles, participantUserId)
    );

    if (missingUserIds.length === 0) {
      return undefined;
    }

    let active = true;

    (async () => {
      const entries = await Promise.all(
        missingUserIds.map(async (participantUserId) => {
          const result = await fetchPublicProfileByUserId(participantUserId);
          if (!result.ok) {
            console.warn(
              'Konnte Lobby-Profil nicht laden:',
              participantUserId,
              result.error?.message ?? result.error
            );
            return [participantUserId, null];
          }
          return [participantUserId, result.profile ?? null];
        })
      );

      if (!active) {
        return;
      }

      setParticipantProfiles((prev) => {
        const next = { ...prev };
        entries.forEach(([participantUserId, profile]) => {
          next[participantUserId] = profile;
        });
        return next;
      });
    })();

    return () => {
      active = false;
    };
  }, [baseParticipants, participantProfiles, userId]);

  const participants = useMemo(() => {
    return baseParticipants.map((participant) => {
      if (!participant?.userId || participant.userId === userId || participant.isPlaceholder) {
        return participant;
      }

      const profile = participantProfiles[participant.userId];
      if (!profile) {
        return participant;
      }

      const participantAvatarUrl = isRemoteAvatarUrl(participant.avatarUrl)
        ? participant.avatarUrl.trim()
        : null;
      const profileAvatarUrl = isRemoteAvatarUrl(profile.avatarUrl)
        ? profile.avatarUrl.trim()
        : null;
      const resolvedAvatarUrl = profileAvatarUrl ?? participantAvatarUrl ?? null;
      const resolvedAvatarIcon =
        resolvedAvatarUrl
          ? null
          : participant.avatarIcon ?? profile.avatarIcon ?? null;

      return {
        ...participant,
        friendCode: participant.friendCode ?? profile.friendCode ?? null,
        avatarUrl: resolvedAvatarUrl,
        avatarSource:
          resolvedAvatarUrl
            ? null
            : participant.avatarSource
              ?? getAvatarPresetSource(resolvedAvatarIcon)
              ?? null,
        avatarIcon: resolvedAvatarIcon,
        avatarColor: participant.avatarColor ?? profile.avatarColor ?? null,
      };
    });
  }, [baseParticipants, participantProfiles, userId]);

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
