import { useEffect } from 'react';
import { AppState, Linking } from 'react-native';

import { supabase } from '../lib/supabaseClient';
import { claimActiveSessionOrThrow } from '../services/activeSessionService';
import {
  AUTH_TIMEOUT_MS,
  SUPABASE_URL_HINT,
} from '../screens/auth/authConfig';
import {
  getCurrentAuthSession,
  parseSupabaseParams,
  waitForRecoveredAuthSession,
  withTimeout,
} from '../screens/auth/authUtils';
import { runSingleAuthCallback } from '../screens/auth/authCallbackCoordinator';
import { useTranslation } from '../i18n/useTranslation';
import { formatUserError } from '../utils/formatUserError';

function hasAuthParams(params) {
  if (!params) {
    return false;
  }

  return Boolean(
    params.code
    || params.auth_code
    || params.authCode
    || params.access_token
    || params.refresh_token
    || params.type
    || params.event
    || params.error
    || params.error_description
  );
}

function createNavigateWhenReady(navigationRef) {
  return function navigateWhenReady(name, params, attempt = 0) {
    const navigation = navigationRef?.current;
    if (navigation?.navigate) {
      navigation.navigate(name, params);
      return;
    }

    if (attempt >= 10) {
      return;
    }

    setTimeout(() => {
      navigateWhenReady(name, params, attempt + 1);
    }, 150);
  };
}

export default function useAuthCallbackLinking({ navigationRef }) {
  const { t } = useTranslation();

  useEffect(() => {
    let active = true;
    const navigateWhenReady = createNavigateWhenReady(navigationRef);

    async function syncSessionFromParams(params) {
      const code = params?.code ?? params?.auth_code ?? params?.authCode;
      const accessToken = params?.access_token;
      const refreshToken = params?.refresh_token;

      if (code) {
        const { error } = await withTimeout(
          supabase.auth.exchangeCodeForSession(code),
          AUTH_TIMEOUT_MS,
          t('Supabase nicht erreichbar (Code-Austausch).')
        );
        if (error) {
          throw error;
        }
        return;
      }

      if (!accessToken || !refreshToken) {
        return;
      }

      const { error } = await withTimeout(
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        }),
        AUTH_TIMEOUT_MS,
        t('Supabase nicht erreichbar (Session setzen).')
      );
      if (error) {
        throw error;
      }
    }

    async function ensureRecoveredSession(previousSession) {
      const recoveredSession = await waitForRecoveredAuthSession(previousSession);
      if (!recoveredSession?.user?.id) {
        throw new Error(t('Nach OAuth wurde keine Session wiederhergestellt.'));
      }
      return recoveredSession;
    }

    async function handleAuthUrl(url) {
      if (!active || !url) {
        return false;
      }

      return runSingleAuthCallback(url, async () => {
        const params = parseSupabaseParams(url);
        if (!hasAuthParams(params)) {
          return false;
        }

        const type = params?.type ?? params?.event;
        const callbackError = params?.error_description ?? params?.error;

        if (callbackError) {
          navigateWhenReady('Auth', {
            mode: 'signIn',
            authMessage: t(
              formatUserError(new Error(callbackError), {
                supabaseUrl: SUPABASE_URL_HINT,
                fallback: 'Link konnte nicht verarbeitet werden.',
              })
            ),
          });
          return true;
        }

        try {
          const previousSession = await getCurrentAuthSession();

          if (type === 'recovery') {
            const accessToken = params?.access_token ?? null;

            if (params?.refresh_token && accessToken) {
              try {
                await syncSessionFromParams(params);
              } catch (err) {
                const recoveredSession = await waitForRecoveredAuthSession(previousSession);
                if (!recoveredSession) {
                  throw err;
                }
              }
              await ensureRecoveredSession(previousSession);
            }

            navigateWhenReady('Auth', {
              mode: 'recovery',
              recoveryAccessToken: accessToken,
              authMessage: t('Bitte neues Passwort setzen.'),
            });
            return true;
          }

          try {
            await syncSessionFromParams(params);
          } catch (err) {
            const recoveredSession = await waitForRecoveredAuthSession(previousSession);
            if (!recoveredSession) {
              throw err;
            }
          }
          const recoveredSession = await ensureRecoveredSession(previousSession);

          await claimActiveSessionOrThrow({
            dedupeKey: 'auth-callback',
            session: recoveredSession,
          });
          return true;
        } catch (err) {
          navigateWhenReady('Auth', {
            mode: 'signIn',
            authMessage: t(
              formatUserError(err, {
                supabaseUrl: SUPABASE_URL_HINT,
                fallback: 'Link konnte nicht verarbeitet werden.',
              })
            ),
          });
          return true;
        }
      });
    }

    async function checkCurrentUrl() {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          await handleAuthUrl(initialUrl);
        }
      } catch (err) {
        console.warn('Konnte Initial-URL nicht verarbeiten:', err);
      }
    }

    const linkingSubscription = Linking.addEventListener('url', (event) => {
      if (!event?.url) {
        return;
      }

      handleAuthUrl(event.url).catch((err) => {
        console.warn('Konnte Auth-Link nicht verarbeiten:', err);
      });
    });
    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') {
        return;
      }

      checkCurrentUrl();
    });

    checkCurrentUrl();

    return () => {
      active = false;
      linkingSubscription?.remove?.();
      appStateSubscription.remove();
    };
  }, [navigationRef, t]);
}
