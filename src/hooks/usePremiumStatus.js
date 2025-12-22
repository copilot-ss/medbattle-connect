import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const PREMIUM_CACHE_TTL = 60 * 1000;
const premiumCache = {
  userId: null,
  value: false,
  fetchedAt: 0,
  inFlight: null,
};

function resetCache(nextUserId) {
  if (premiumCache.userId === nextUserId) {
    return;
  }
  premiumCache.userId = nextUserId;
  premiumCache.value = false;
  premiumCache.fetchedAt = 0;
  premiumCache.inFlight = null;
}

async function fetchPremiumForUser(user) {
  const userId = user?.id;

  if (!userId || userId === 'guest') {
    resetCache(null);
    return false;
  }

  resetCache(userId);

  const now = Date.now();
  if (premiumCache.fetchedAt && now - premiumCache.fetchedAt < PREMIUM_CACHE_TTL) {
    return premiumCache.value;
  }

  if (premiumCache.inFlight) {
    return premiumCache.inFlight;
  }

  premiumCache.inFlight = (async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('premium')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      premiumCache.value = Boolean(data?.premium);
    } catch (err) {
      premiumCache.value = false;
    } finally {
      premiumCache.fetchedAt = Date.now();
      premiumCache.inFlight = null;
    }

    return premiumCache.value;
  })();

  return premiumCache.inFlight;
}

export default function usePremiumStatus() {
  const [premium, setPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const refresh = useCallback(async (userOverride) => {
    setLoading(true);
    try {
      let user = userOverride;

      if (!user) {
        const { data } = await supabase.auth.getUser();
        user = data?.user ?? null;
      }

      const nextPremium = await fetchPremiumForUser(user);

      if (mountedRef.current) {
        setPremium(nextPremium);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    refresh();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await refresh(session?.user ?? null);
      }
    );

    return () => {
      mountedRef.current = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [refresh]);

  return { premium, loading, refresh };
}
