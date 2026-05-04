import { Alert } from 'react-native';
import { useCallback, useMemo, useState } from 'react';
import { addFriend, deriveFriendCode } from '../../../services/friendsService';
import { sanitizeFriendCode } from '../../../utils/friendCode';
import { buildPublicProfilePayload } from '../../../utils/publicProfile';
import { formatUserError } from '../../../utils/formatUserError';

function normalizeFriendCode(value) {
  return sanitizeFriendCode(value) || null;
}

function resolveProfileUserId(profile) {
  return typeof profile?.userId === 'string' && profile.userId.trim()
    ? profile.userId.trim()
    : null;
}

function resolveProfileFriendCode(profile) {
  const profileUserId = resolveProfileUserId(profile);
  const derivedFriendCode = normalizeFriendCode(deriveFriendCode(profileUserId));
  return derivedFriendCode ?? normalizeFriendCode(profile?.friendCode);
}

export default function useLobbyProfileActions({
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
}) {
  const [addingFriendCode, setAddingFriendCode] = useState(null);
  const [profileFriendStates, setProfileFriendStates] = useState({});

  const friendCodes = useMemo(
    () =>
      new Set(
        (friends ?? [])
          .map((entry) => normalizeFriendCode(entry?.code))
          .filter(Boolean)
      ),
    [friends]
  );

  const handleOpenParticipantProfile = useCallback((participant) => {
    if (!participant?.userId || participant.userId === userId) {
      return;
    }

    openProfile({
      ...buildPublicProfilePayload({
        userId: participant.userId,
        friendCode: resolveProfileFriendCode(participant),
        name: participant.name ?? t('Spieler'),
        username: participant.username ?? null,
        title: participant.title ?? null,
        avatarUrl: participant.avatarUrl ?? null,
        avatarIcon: participant.avatarIcon ?? null,
        avatarColor: participant.avatarColor ?? null,
        activity: participant.activity ?? null,
        statusLabel:
          participant.statusLabel
          ?? (participant.inCurrentLobby ? t('Lobby') : null),
      }),
      lobbyParticipantKey: participant.key ?? null,
    });
  }, [openProfile, t, userId]);

  const selectedProfileUserId = resolveProfileUserId(selectedProfile);
  const effectiveSelectedProfileFriendCode = resolveProfileFriendCode(selectedProfile);
  const selectedProfileState =
    effectiveSelectedProfileFriendCode
      ? profileFriendStates[effectiveSelectedProfileFriendCode] ?? null
      : null;

  const selectedProfileAlreadyFriend =
    effectiveSelectedProfileFriendCode
      ? friendCodes.has(effectiveSelectedProfileFriendCode)
      : false;

  const canAddProfileFriend = useMemo(() => {
    if (!selectedProfileUserId || selectedProfileUserId === userId) {
      return false;
    }
    if (!effectiveSelectedProfileFriendCode || selectedProfileAlreadyFriend) {
      return selectedProfileState === 'pending' || selectedProfileState === 'added';
    }
    return true;
  }, [
    effectiveSelectedProfileFriendCode,
    selectedProfileAlreadyFriend,
    selectedProfileState,
    selectedProfileUserId,
    userId,
  ]);

  const profileActionLabel = useMemo(() => {
    if (!canAddProfileFriend) {
      return null;
    }
    if (selectedProfileState === 'pending') {
      return t('Freundesanfrage gesendet');
    }
    if (selectedProfileState === 'added') {
      return t('Freund wurde hinzugefügt.');
    }
    return t('Freund hinzufügen');
  }, [canAddProfileFriend, selectedProfileState, t]);

  const profileActionDisabled = useMemo(() => {
    if (selectedProfileAlreadyFriend) {
      return true;
    }
    if (selectedProfileState === 'pending' || selectedProfileState === 'added') {
      return true;
    }
    if (!effectiveSelectedProfileFriendCode) {
      return true;
    }
    return addingFriendCode === effectiveSelectedProfileFriendCode;
  }, [
    addingFriendCode,
    effectiveSelectedProfileFriendCode,
    selectedProfileAlreadyFriend,
    selectedProfileState,
  ]);

  const profileActionIcon = useMemo(() => {
    if (selectedProfileState === 'pending' || selectedProfileState === 'added') {
      return 'checkmark';
    }
    return 'person-add';
  }, [selectedProfileState]);

  const canRemoveProfileParticipant = useMemo(() => {
    if (!isHostWaiting || kickingPlayer) {
      return false;
    }

    if (!selectedProfileUserId) {
      return false;
    }

    return participants.some((participant) => (
      participant.key === selectedProfile?.lobbyParticipantKey
      && !participant.isHost
      && participant.userId === selectedProfileUserId
      && !participant.isPending
    ));
  }, [
    isHostWaiting,
    kickingPlayer,
    participants,
    selectedProfile?.lobbyParticipantKey,
    selectedProfileUserId,
  ]);

  const handleRemoveParticipantFromProfile = useCallback(async () => {
    const didKick = await handleKickGuest(selectedProfile?.lobbyParticipantKey);
    if (didKick) {
      closeProfile();
    }
  }, [closeProfile, handleKickGuest, selectedProfile?.lobbyParticipantKey]);

  const handleAddFriendFromProfile = useCallback(async (profileOverride = null) => {
    const resolvedProfile =
      profileOverride && typeof profileOverride === 'object'
        ? profileOverride
        : selectedProfile;
    const profileUserId = resolveProfileUserId(resolvedProfile);
    const friendCode = resolveProfileFriendCode(resolvedProfile);

    if (
      !userId ||
      !profileUserId ||
      profileUserId === userId ||
      !friendCode ||
      addingFriendCode === friendCode ||
      friendCodes.has(friendCode)
    ) {
      return;
    }

    setAddingFriendCode(friendCode);
    try {
      const result = await addFriend(userId, friendCode);
      if (!result?.ok) {
        throw result?.error ?? new Error(t('Freund konnte nicht hinzugefügt werden.'));
      }

      setProfileFriendStates((prev) => ({
        ...prev,
        [friendCode]:
          result.pending || result.alreadyPending ? 'pending' : 'added',
      }));
    } catch (err) {
      Alert.alert(
        t('Oops!'),
        formatUserError(err, {
          fallback: t('Freund konnte nicht hinzugefügt werden.'),
        })
      );
    } finally {
      setAddingFriendCode(null);
    }
  }, [addingFriendCode, friendCodes, selectedProfile, t, userId]);

  return {
    canAddProfileFriend,
    canRemoveProfileParticipant,
    handleAddFriendFromProfile,
    handleOpenParticipantProfile,
    handleRemoveParticipantFromProfile,
    profileActionDisabled,
    profileActionIcon,
    profileActionLabel,
    profileActionLoading:
      Boolean(effectiveSelectedProfileFriendCode)
      && addingFriendCode === effectiveSelectedProfileFriendCode,
  };
}
