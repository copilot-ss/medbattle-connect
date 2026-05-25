import { useCallback, useEffect, useRef, useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { sendLobbyInvite } from '../../../services/lobbyInviteService';
import { sanitizeFriendCode } from '../../../utils/friendCode';

const SENT_INVITE_VISIBLE_MS = 60 * 1000;

function normalizeFriendCode(value) {
  return sanitizeFriendCode(value) || null;
}

export default function useLobbyShareActions({ currentJoinCode, currentMatchId, t }) {
  const [copied, setCopied] = useState(false);
  const [invitingFriendCodes, setInvitingFriendCodes] = useState({});
  const copiedTimeoutRef = useRef(null);
  const invitingFriendCodesRef = useRef({});
  const sentInviteTimeoutsRef = useRef({});

  const clearSentInviteTimeout = useCallback((recipientCode) => {
    const timeoutId = sentInviteTimeoutsRef.current[recipientCode];
    if (!timeoutId) {
      return;
    }

    clearTimeout(timeoutId);
    delete sentInviteTimeoutsRef.current[recipientCode];
  }, []);

  const setInviteState = useCallback((recipientCode, nextState) => {
    setInvitingFriendCodes((prev) => {
      const next = { ...prev };
      if (nextState) {
        next[recipientCode] = nextState;
      } else {
        delete next[recipientCode];
      }
      invitingFriendCodesRef.current = next;
      return next;
    });
  }, []);

  const markInviteSent = useCallback(
    (recipientCode) => {
      clearSentInviteTimeout(recipientCode);
      setInviteState(recipientCode, 'sent');
      sentInviteTimeoutsRef.current[recipientCode] = setTimeout(() => {
        delete sentInviteTimeoutsRef.current[recipientCode];
        setInviteState(recipientCode, null);
      }, SENT_INVITE_VISIBLE_MS);
    },
    [clearSentInviteTimeout, setInviteState]
  );

  const clearCopiedTimeout = useCallback(() => {
    if (copiedTimeoutRef.current) {
      clearTimeout(copiedTimeoutRef.current);
      copiedTimeoutRef.current = null;
    }
  }, []);

  useEffect(
    () => () => {
      clearCopiedTimeout();
      Object.values(sentInviteTimeoutsRef.current).forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      sentInviteTimeoutsRef.current = {};
    },
    [clearCopiedTimeout]
  );

  useEffect(() => {
    Object.values(sentInviteTimeoutsRef.current).forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    sentInviteTimeoutsRef.current = {};
    invitingFriendCodesRef.current = {};
    setInvitingFriendCodes({});
  }, [currentMatchId]);

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

      clearSentInviteTimeout(recipientCode);
      setInviteState(recipientCode, 'sending');

      try {
        const result = await sendLobbyInvite({
          matchId: currentMatchId,
          recipientCode,
        });

        if (!result.ok) {
          throw result.error ?? new Error(t('Einladung konnte nicht gesendet werden.'));
        }
        markInviteSent(recipientCode);
        return true;
      } catch (err) {
        console.warn('Lobby-Einladung konnte nicht gesendet werden:', err?.message ?? err);
        setInviteState(recipientCode, null);
        return false;
      }
    },
    [
      clearSentInviteTimeout,
      currentJoinCode,
      currentMatchId,
      markInviteSent,
      setInviteState,
      t,
    ]
  );

  return {
    copied,
    invitingFriendCodes,
    handleCopyCode,
    handleInviteFriend,
  };
}
