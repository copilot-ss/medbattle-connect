import { AppState } from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePreferences } from '../context/PreferencesContext';
import { useTranslation } from '../i18n/useTranslation';
import { supabase } from '../lib/supabaseClient';
import { fetchFriendRequests } from '../services/friendsService';
import {
  isGameplayNotificationSuppressed,
  scheduleFriendRequestNotification,
} from '../services/notificationsService';

const POLL_INTERVAL_MS = 15000;

export default function useFriendRequestMonitor() {
  const { pushEnabled } = usePreferences();
  const { t } = useTranslation();
  const [authUserId, setAuthUserId] = useState(null);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);
  const initializedRef = useRef(false);
  const seenRequestIdsRef = useRef(new Set());
  const refreshInFlightRef = useRef(false);
  const refreshRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  const refreshPendingRequests = useCallback(async ({ notify = true } = {}) => {
    if (!authUserId) {
      initializedRef.current = false;
      seenRequestIdsRef.current = new Set();
      setPendingRequestCount(0);
      return;
    }

    if (refreshInFlightRef.current) {
      return;
    }

    refreshInFlightRef.current = true;
    try {
      const requests = await fetchFriendRequests(authUserId, {
        suppressTimeoutWarning: true,
      });
      const requestList = Array.isArray(requests) ? requests : [];
      const nextIds = new Set(
        requestList
          .map((entry) => entry?.id)
          .filter(Boolean)
      );
      setPendingRequestCount(nextIds.size);

      if (!initializedRef.current) {
        initializedRef.current = true;
        seenRequestIdsRef.current = nextIds;
        return;
      }

      const newRequests = requestList.filter(
        (entry) => entry?.id && !seenRequestIdsRef.current.has(entry.id)
      );
      seenRequestIdsRef.current = nextIds;

      if (!notify || !newRequests.length || !pushEnabled) {
        return;
      }
      if (appStateRef.current === 'active') {
        return;
      }
      if (isGameplayNotificationSuppressed()) {
        return;
      }

      const first = newRequests[0];
      const requesterName = first?.username ?? first?.code ?? t('Freund');
      const title =
        newRequests.length > 1
          ? t('Neue Freundesanfragen')
          : t('Neue Freundesanfrage');
      const body =
        newRequests.length > 1
          ? t('{count} neue Anfragen warten auf dich.', { count: newRequests.length })
          : t('{name} hat dir eine Freundesanfrage gesendet.', { name: requesterName });

      await scheduleFriendRequestNotification({
        title,
        body,
        requestId: first?.id ?? null,
      });
    } finally {
      refreshInFlightRef.current = false;
    }
  }, [authUserId, pushEnabled, t]);

  useEffect(() => {
    refreshRef.current = refreshPendingRequests;
  }, [refreshPendingRequests]);

  useEffect(() => {
    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      appStateRef.current = nextState;
      if (nextState === 'active') {
        refreshRef.current?.({ notify: false });
      }
    });

    return () => {
      appStateSubscription.remove();
    };
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
        initializedRef.current = false;
        seenRequestIdsRef.current = new Set();
        setPendingRequestCount(0);
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
    if (!authUserId) {
      return undefined;
    }

    refreshPendingRequests({ notify: false });
    const intervalId = setInterval(() => {
      refreshPendingRequests({ notify: true });
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [authUserId, refreshPendingRequests]);

  return {
    pendingRequestCount,
    refreshPendingRequests,
  };
}
