import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../../lib/supabaseClient';
import { formatUserError } from '../../utils/formatUserError';
import {
  AUTH_TIMEOUT_MS,
  OAUTH_REDIRECT,
  SUPABASE_URL_HINT,
} from './authConfig';
import {
  parseSupabaseParams,
  validateSupabaseConfig,
  withTimeout,
} from './authUtils';

export async function loginOAuth(provider, setMessage, setLoading) {
  try {
    setMessage(null);

    const validation = validateSupabaseConfig();
    if (!validation.ok) {
      setMessage(validation.message);
      return;
    }

    setLoading(true);

    await supabase.auth.signOut({ scope: 'local' }).catch(() => {});

    const { data, error } = await withTimeout(
      supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: OAUTH_REDIRECT, skipBrowserRedirect: true },
      }),
      AUTH_TIMEOUT_MS,
      'Supabase nicht erreichbar (OAuth). Bitte Verbindung oder Supabase-URL pruefen.'
    );
    if (error) throw error;
    if (!data?.url) throw new Error('Kein OAuth-URL erhalten.');

    let authUrl = data.url;
    try {
      const modified = new URL(authUrl);
      modified.searchParams.set('redirect_to', OAUTH_REDIRECT);
      authUrl = modified.toString();
    } catch (parseErr) {
      console.warn('Konnte OAuth-URL nicht anpassen:', parseErr);
    }

    const result = await WebBrowser.openAuthSessionAsync(authUrl, OAUTH_REDIRECT);
    if (result.type !== 'success' || !result.url) {
      let debugHost = null;
      try {
        debugHost = new URL(authUrl).host;
      } catch {
        debugHost = null;
      }

      const detail = debugHost ? ` (Weiterleitung auf ${debugHost})` : '';
      throw new Error(`OAuth nicht abgeschlossen${detail}.`);
    }

    const params = parseSupabaseParams(result.url);
    const callbackError = params.error_description ?? params.error;
    if (callbackError) {
      throw new Error(callbackError);
    }

    const code = params.code ?? params.auth_code ?? params.authCode;
    const accessToken = params.access_token;
    const refreshToken = params.refresh_token;

    if (code) {
      const { error: exchangeError } = await withTimeout(
        supabase.auth.exchangeCodeForSession({
          authCode: code,
        }),
        AUTH_TIMEOUT_MS,
        'Supabase nicht erreichbar (Code-Austausch).'
      );
      if (exchangeError) throw exchangeError;
      return;
    }

    if (accessToken && refreshToken) {
      const { error: sessionError } = await withTimeout(
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        }),
        AUTH_TIMEOUT_MS,
        'Supabase nicht erreichbar (Token setzen).'
      );
      if (sessionError) throw sessionError;
      return;
    }

    throw new Error('Nach OAuth wurde kein Code oder Token geliefert.');
  } catch (err) {
    const hint =
      SUPABASE_URL_HINT && SUPABASE_URL_HINT.includes('127.0.0.1')
        ? ' (Hinweis: Supabase-URL zeigt auf localhost und ist vom Geraet nicht erreichbar)'
        : '';
    const formatted = formatUserError(err, {
      supabaseUrl: SUPABASE_URL_HINT,
      fallback: 'OAuth fehlgeschlagen.',
    });
    setMessage(formatted + hint);
  } finally {
    setLoading(false);
  }
}
