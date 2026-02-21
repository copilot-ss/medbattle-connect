import { AppState } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { supabase } from '../lib/supabaseClient';
import { joinMatch } from '../services/matchService';
import {
  fetchLobbyInvites,
  respondLobbyInvite,
  subscribeToLobbyInvites,
} from '../services/lobbyInviteService';

const INVITE_POLL_INTERVAL_MS = 12000;
const INVITE_TICK_INTERVAL_MS = 1000;

function pickMostRecentInvite(invites, nowMs = Date.now()) {
  if (!Array.isArray(invites) || !invites.length) {
    return null;
  }

  const activeInvites = invites.filter((invite) => {
    if (!invite) {
      return false;
    }
    if (!Number.isFinite(invite.expiresAtMs)) {
      return true;
    }
    return invite.expiresAtMs > nowMs;
  });

  if (!activeInvites.length) {
    return null;
  }

  return activeInvites.reduce((latest, invite) => {
    if (!latest) {
      return invite;
    }
    const latestCreated = Number.isFinite(latest.createdAtMs) ? latest.createdAtMs : 0;
    const inviteCreated = Number.isFinite(invite.createdAtMs) ? invite.createdAtMs : 0;
    return inviteCreated > latestCreated ? invite : latest;
  }, null);
}

export default function useLobbyInviteMonitor({ onInviteAccepted } = {}) {
  const { t } = useTranslation();
  const [authUserId, setAuthUserId] = useState(null);
  const [activeInvite, setActiveInvite] = useState(null);
  const [currentTimeMs, setCurrentTimeMs] = useState(() => Date.now());
  const [acceptingInvite, setAcceptingInvite] = useState(false);
  const [decliningInvite, setDecliningInvite] = useState(false);
  const [inviteError, setInviteError] = useState(null);
  const refreshInFlightRef = useRef(false);
  const expiringInviteIdRef = useRef(null);
  const activeInviteRef = useRef(null);
  const authUserIdRef = useRef(null);

  useEffect(() => {
    activeInviteRef.current = activeInvite;
  }, [activeInvite]);

  useEffect(() => {
    authUserIdRef.current = authUserId;
  }, [authUserId]);

  const refreshLobbyInvites = useCallback(async () => {
    const resolvedUserId = authUserIdRef.current;
    if (!resolvedUserId) {
      setActiveInvite(null);
      setInviteError(null);
      return;
    }

    if (refreshInFlightRef.current) {
      return;
    }

    refreshInFlightRef.current = true;
    try {
      const result = await fetchLobbyInvites();
      if (!result.ok) {
        return;
      }

      const nextInvite = pickMostRecentInvite(result.invites, Date.now());
      setActiveInvite(nextInvite);
      if (!nextInvite) {
        setInviteError(null);
      }
    } finally {
      refreshInFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    let active = true;

    const applySessionUser = (session) => {
      if (!active) {
        return;
      }
      const isGuestSession =
        Boolean(session?.user?.is_anonymous) ||
        session?.user?.id === 'guest' ||
        Boolean(session?.user?.user_metadata?.guest);
      const userId = isGuestSession ? null : session?.user?.id ?? null;
      setAuthUserId(userId);
      if (!userId) {
        setActiveInvite(null);
        setInviteError(null);
      }
    };

    async function resolveInitialUser() {
      const { data } = await supabase.auth.getSession();
      applySessionUser(data?.session ?? null);
    }

    resolveInitialUser();

    const { data: authSubscription } = supabase.auth.onAuthStateChange((_event, session) => {
      applySessionUser(session);
    });

    return () => {
      active = false;
      authSubscription?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void refreshLobbyInvites();
      }
    });

    return () => {
      appStateSubscription.remove();
    };
  }, [refreshLobbyInvites]);

  useEffect(() => {
    if (!authUserId) {
      return undefined;
    }

    void refreshLobbyInvites();

    const intervalId = setInterval(() => {
      void refreshLobbyInvites();
    }, INVITE_POLL_INTERVAL_MS);

    const unsubscribeRealtime = subscribeToLobbyInvites({
      userId: authUserId,
      onInviteEvent: () => {
        void refreshLobbyInvites();
      },
    });

    return () => {
      clearInterval(intervalId);
      unsubscribeRealtime();
    };
  }, [authUserId, refreshLobbyInvites]);

  useEffect(() => {
    if (!activeInvite) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, INVITE_TICK_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [activeInvite]);

  const remainingSeconds = useMemo(() => {
    if (!activeInvite || !Number.isFinite(activeInvite.expiresAtMs)) {
      return null;
    }
    const delta = activeInvite.expiresAtMs - currentTimeMs;
    if (delta <= 0) {
      return 0;
    }
    return Math.ceil(delta / 1000);
  }, [activeInvite, currentTimeMs]);

  useEffect(() => {
    if (!activeInvite || !Number.isFinite(activeInvite.expiresAtMs)) {
      expiringInviteIdRef.current = null;
      return;
    }
    if (acceptingInvite || decliningInvite) {
      return;
    }
    if (activeInvite.expiresAtMs > currentTimeMs) {
      return;
    }
    if (expiringInviteIdRef.current === activeInvite.id) {
      return;
    }

    expiringInviteIdRef.current = activeInvite.id;

    (async () => {
      await respondLobbyInvite({
        inviteId: activeInvite.id,
        action: 'decline',
      });
      setActiveInvite(null);
      setInviteError(null);
      await refreshLobbyInvites();
      expiringInviteIdRef.current = null;
    })();
  }, [
    acceptingInvite,
    activeInvite,
    currentTimeMs,
    decliningInvite,
    refreshLobbyInvites,
  ]);

  const declineInvite = useCallback(async () => {
    const invite = activeInviteRef.current;
    if (!invite || decliningInvite || acceptingInvite) {
      return { ok: false, error: new Error('Keine aktive Einladung.') };
    }

    setDecliningInvite(true);
    setInviteError(null);
    try {
      const result = await respondLobbyInvite({
        inviteId: invite.id,
        action: 'decline',
      });
      if (!result.ok) {
        throw result.error ?? new Error(t('Einladung konnte nicht abgelehnt werden.'));
      }
      setActiveInvite(null);
      await refreshLobbyInvites();
      return { ok: true };
    } catch (err) {
      setInviteError(t('Einladung konnte nicht abgelehnt werden.'));
      return { ok: false, error: err };
    } finally {
      setDecliningInvite(false);
    }
  }, [acceptingInvite, decliningInvite, refreshLobbyInvites, t]);

  const acceptInvite = useCallback(async () => {
    const invite = activeInviteRef.current;
    const userId = authUserIdRef.current;
    if (!invite || !userId || acceptingInvite || decliningInvite) {
      return { ok: false, error: new Error('Keine aktive Einladung.') };
    }
    if (!invite.matchCode) {
      setInviteError(t('Einladung konnte nicht angenommen werden.'));
      return { ok: false, error: new Error('Match-Code fehlt.') };
    }

    setAcceptingInvite(true);
    setInviteError(null);

    try {
      const joinResult = await joinMatch({
        code: invite.matchCode,
        userId,
      });
      if (!joinResult.ok || !joinResult.match) {
        throw joinResult.error ?? new Error(t('Match konnte nicht beigetreten werden.'));
      }

      await respondLobbyInvite({
        inviteId: invite.id,
        action: 'accept',
      });

      setActiveInvite(null);
      setInviteError(null);

      if (typeof onInviteAccepted === 'function') {
        onInviteAccepted(joinResult.match, invite);
      }

      await refreshLobbyInvites();
      return { ok: true, match: joinResult.match };
    } catch (err) {
      setInviteError(t('Einladung konnte nicht angenommen werden.'));
      return { ok: false, error: err };
    } finally {
      setAcceptingInvite(false);
    }
  }, [
    acceptingInvite,
    decliningInvite,
    onInviteAccepted,
    refreshLobbyInvites,
    t,
  ]);

  return {
    activeInvite,
    remainingSeconds,
    acceptingInvite,
    decliningInvite,
    inviteError,
    acceptInvite,
    declineInvite,
    refreshLobbyInvites,
  };
}
