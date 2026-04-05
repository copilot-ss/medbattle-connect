import { useCallback, useEffect, useState } from 'react';
import { abandonMatch, deriveMatchRole } from '../../../services/matchService';
import { clearActiveLobby } from '../../../utils/activeLobbyStorage';
import { buildActiveLobbyPayload } from '../lobbyUtils';

export default function useLobbyLeaveActions({
  currentMatch,
  userId,
  navigation,
  setCurrentMatch,
  setMatchesError,
  closingRef,
  skipAutoCloseRef,
}) {
  const [closingLobby, setClosingLobby] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const handleLeaveLobby = useCallback(() => {
    if (closingRef.current) {
      return;
    }

    setShowLeaveConfirm(true);
  }, [closingRef]);

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
  }, [currentMatch, navigation, setCurrentMatch, userId, closingRef, skipAutoCloseRef]);

  const handleCancelLeave = useCallback(() => {
    setShowLeaveConfirm(false);
  }, []);

  const handleNavigateHome = useCallback(async () => {
    if (closingLobby) {
      return;
    }
    setClosingLobby(true);
    setMatchesError(null);

    const activeLobby = buildActiveLobbyPayload(currentMatch);

    if (!activeLobby) {
      clearActiveLobby();
    }

    skipAutoCloseRef.current = true;
    navigation.navigate('MainTabs', {
      screen: 'Home',
      params: { activeLobby },
    });
    setClosingLobby(false);
  }, [closingLobby, currentMatch, navigation, setMatchesError, skipAutoCloseRef]);

  useEffect(() => {
    return navigation.addListener('beforeRemove', () => {
      skipAutoCloseRef.current = false;
    });
  }, [navigation, skipAutoCloseRef]);

  return {
    closingLobby,
    showLeaveConfirm,
    handleLeaveLobby,
    handleConfirmLeave,
    handleCancelLeave,
    handleNavigateHome,
  };
}
