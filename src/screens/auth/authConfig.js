import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

const REDIRECT_PATH = 'auth/callback';
const APP_OWNERSHIP = Constants.appOwnership ?? 'standalone';
const expoOwner = Constants.expoConfig?.owner ?? 'sjigalin';
const expoSlug = Constants.expoConfig?.slug ?? 'medbattle';
const isExpoGo = APP_OWNERSHIP === 'expo';

const defaultProxyRedirect = AuthSession.makeRedirectUri({
  useProxy: isExpoGo,
  scheme: 'medbattle',
});

const EXPO_PROXY_REDIRECT = isExpoGo
  ? defaultProxyRedirect && defaultProxyRedirect.startsWith('https://')
    ? defaultProxyRedirect
    : `https://auth.expo.dev/@${expoOwner}/${expoSlug}`
  : null;

const NATIVE_SCHEME_REDIRECT = `medbattle://${REDIRECT_PATH}`;

export const IS_EXPO_GO = isExpoGo;
export const OAUTH_REDIRECT =
  isExpoGo && EXPO_PROXY_REDIRECT
    ? EXPO_PROXY_REDIRECT
    : NATIVE_SCHEME_REDIRECT;
export const AUTH_TIMEOUT_MS = 12000;
export const PASSWORD_POLICY = {
  minLength: 12,
  requireLower: true,
  requireUpper: true,
  requireNumber: true,
  requireSymbol: true,
};
export const PASSWORD_HINT =
  'Mindestens 12 Zeichen, Groß- und Kleinbuchstaben, Zahl und Sonderzeichen.';
export const SUPABASE_URL_HINT = process.env.EXPO_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_HINT = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const EMAIL_CONFIRM_REDIRECT =
  process.env.EXPO_PUBLIC_EMAIL_CONFIRM_REDIRECT ?? NATIVE_SCHEME_REDIRECT;
