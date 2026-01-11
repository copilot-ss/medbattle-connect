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
  'Mindestens 12 Zeichen, Gross- und Kleinbuchstaben, Zahl und Sonderzeichen.';
export const SUPABASE_URL_HINT = process.env.EXPO_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_HINT = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const FALLBACK_EMAIL_CONFIRM_REDIRECT =
  'data:text/html;base64,PCFET0NUWVBFIGh0bWw+PGh0bWwgbGFuZz0nZGUnPjxtZXRhIGNoYXJzZXQ9J3V0Zi04Jz48dGl0bGU+TWVkQmF0dGxlPC90aXRsZT48Ym9keSBzdHlsZT0nZm9udC1mYW1pbHk6c3lzdGVtLXVpO2JhY2tncm91bmQ6IzBmMTcyYTtjb2xvcjojZjFmNWY5O2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtoZWlnaHQ6MTAwdmg7bWFyZ2luOjA7Jz48ZGl2IHN0eWxlPSd0ZXh0LWFsaWduOmNlbnRlcjttYXgtd2lkdGg6MzIwcHg7Jz48aDE+RGVpbmUgRS1NYWlsIHd1cmRlIGJlc3RhZXRpZ3QhPC9oMT48cD5EdSBrYW5uc3QgZGllc2VzIEZlbnN0ZXIgamV0enQgc2NobGllc3NlbiB1bmQgenVyIE1lZEJhdHRsZSBBcHAgenVydWVja2Voci48L3A+PC9kaXY+PC9ib2R5PjwvaHRtbD4=';

export const EMAIL_CONFIRM_REDIRECT =
  process.env.EXPO_PUBLIC_EMAIL_CONFIRM_REDIRECT ?? FALLBACK_EMAIL_CONFIRM_REDIRECT;
