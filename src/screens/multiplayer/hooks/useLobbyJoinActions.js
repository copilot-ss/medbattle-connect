import { Alert } from 'react-native';
import { useCallback, useState } from 'react';
import { joinMatch } from '../../../services/matchService';

function isLobbyNotFoundError(error) {
  const message =
    typeof error?.message === 'string'
      ? error.message.trim().toLowerCase()
      : '';

  if (!message) {
    return false;
  }

  return (
    message.includes('match nicht gefunden')
    || message.includes('lobby nicht gefunden')
    || message.includes('match not found')
    || message.includes('lobby not found')
  );
}

export default function useLobbyJoinActions({
  userId,
  t,
  isCreateOnly,
  attachMatchSubscription,
  refreshMatches,
  setCurrentMatch,
  setMatchesError,
}) {
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);

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
      if (isLobbyNotFoundError(err)) {
        Alert.alert(t('Oops!'), t('Lobby nicht gefunden.'));
        setMatchesError(null);
      } else {
        console.error('Fehler beim Beitritt über Code:', err);
        setMatchesError(err);
      }
    } finally {
      setJoining(false);
      if (!isCreateOnly) {
        refreshMatches({ force: true });
      }
    }
  }, [
    attachMatchSubscription,
    isCreateOnly,
    joinCode,
    joining,
    refreshMatches,
    setCurrentMatch,
    setMatchesError,
    t,
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
        if (isLobbyNotFoundError(err)) {
          Alert.alert(t('Oops!'), t('Lobby nicht gefunden.'));
          setMatchesError(null);
        } else {
          console.error('Fehler beim Schnellbeitritt:', err);
          setMatchesError(err);
        }
      } finally {
        setJoining(false);
        if (!isCreateOnly) {
          refreshMatches({ force: true });
        }
      }
    },
    [
      attachMatchSubscription,
      isCreateOnly,
      joining,
      refreshMatches,
      setCurrentMatch,
      setMatchesError,
      t,
      userId,
    ]
  );

  return {
    joinCode,
    setJoinCode,
    joining,
    handleJoinByCode,
    handleJoinQuick,
  };
}
