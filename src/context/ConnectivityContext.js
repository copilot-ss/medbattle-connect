import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

const CHECK_TIMEOUT_MS = 6000;
const CHECK_COOLDOWN_MS = 12000;
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;

const ConnectivityContext = createContext({
  isOnline: null,
  isChecking: false,
  checkOnline: async () => false,
});

function buildPingUrl() {
  if (!SUPABASE_URL) {
    return null;
  }
  return `${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/`;
}

function withTimeout(promise, ms) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('timeout')), ms);
  });
  return Promise.race([promise.finally(() => clearTimeout(timeoutId)), timeout]);
}

async function pingSupabase() {
  const url = buildPingUrl();
  if (!url) {
    return false;
  }

  try {
    await withTimeout(fetch(url, { method: 'HEAD' }), CHECK_TIMEOUT_MS);
    return true;
  } catch {
    return false;
  }
}

export function ConnectivityProvider({ children }) {
  const [isOnline, setIsOnline] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const lastCheckedRef = useRef(0);
  const appStateRef = useRef(AppState.currentState);

  const checkOnline = useCallback(
    async ({ force = false } = {}) => {
      const now = Date.now();
      if (!force && now - lastCheckedRef.current < CHECK_COOLDOWN_MS) {
        return isOnline;
      }

      lastCheckedRef.current = now;
      setIsChecking(true);
      const reachable = await pingSupabase();
      setIsOnline(reachable);
      setIsChecking(false);
      return reachable;
    },
    [isOnline]
  );

  useEffect(() => {
    checkOnline({ force: true });
    const subscription = AppState.addEventListener('change', (nextState) => {
      const prevState = appStateRef.current;
      appStateRef.current = nextState;
      if (prevState.match(/inactive|background/) && nextState === 'active') {
        checkOnline({ force: true });
      }
    });

    return () => subscription.remove();
  }, [checkOnline]);

  const value = useMemo(
    () => ({
      isOnline,
      isChecking,
      checkOnline,
    }),
    [isOnline, isChecking, checkOnline]
  );

  return (
    <ConnectivityContext.Provider value={value}>
      {children}
    </ConnectivityContext.Provider>
  );
}

export function useConnectivity() {
  return useContext(ConnectivityContext);
}
