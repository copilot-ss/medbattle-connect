import { useCallback, useEffect, useRef, useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { sendLobbyInvite } from '../../../services/lobbyInviteService';

function normalizeFriendCode(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const cleaned = value.trim().toUpperCase();
  return cleaned || null;
}

export default function useLobbyShareActions({ currentJoinCode, currentMatchId, t }) {
  const [copied, setCopied] = useState(false);
  const [invitingFriendCodes, setInvitingFriendCodes] = useState({});
  const copiedTimeoutRef = useRef(null);
  const invitingFriendCodesRef = useRef({});

  const setInvitingState = useCallback((recipientCode, isInviting) => {
    setInvitingFriendCodes((prev) => {
      const next = { ...prev };
      if (isInviting) {
        next[recipientCode] = true;
      } else {
        delete next[recipientCode];
      }
      invitingFriendCodesRef.current = next;
      return next;
    });
  }, []);

  const clearCopiedTimeout = useCallback(() => {
    if (copiedTimeoutRef.current) {
      clearTimeout(copiedTimeoutRef.current);
      copiedTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => clearCopiedTimeout, [clearCopiedTimeout]);

  const handleCopyCode = useCallback(async () => {
    if (!currentJoinCode) {
      return;
    }

    try {
      await Clipboard.setStringAsync(currentJoinCode);
      setCopied(true);
      clearCopiedTimeout();
      copiedTimeoutRef.current = setTimeout(() => {
        copiedTimeoutRef.current = null;
        setCopied(false);
      }, 1400);
    } catch (err) {
      console.warn('Code konnte nicht kopiert werden:', err);
    }
  }, [clearCopiedTimeout, currentJoinCode]);

  const handleInviteFriend = useCallback(
    async (friend) => {
      if (!currentJoinCode || !currentMatchId) {
        return false;
      }

      const recipientCode = normalizeFriendCode(friend?.code);
      if (!recipientCode) {
        return false;
      }

      if (invitingFriendCodesRef.current[recipientCode]) {
        return false;
      }

      setInvitingState(recipientCode, true);

      try {
        const result = await sendLobbyInvite({
          matchId: currentMatchId,
          recipientCode,
        });

        if (!result.ok) {
          throw result.error ?? new Error(t('Einladung konnte nicht gesendet werden.'));
        }
        return true;
      } catch (err) {
        console.warn('Lobby-Einladung konnte nicht gesendet werden:', err?.message ?? err);
        return false;
      } finally {
        setInvitingState(recipientCode, false);
      }
    },
    [currentJoinCode, currentMatchId, setInvitingState, t]
  );

  return {
    copied,
    invitingFriendCodes,
    handleCopyCode,
    handleInviteFriend,
  };
}
