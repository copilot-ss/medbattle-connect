import { Alert } from 'react-native';
import { logClientError } from '../services/loggingService';
import { formatUserError } from './formatUserError';

const SUPABASE_URL_HINT = process.env.EXPO_PUBLIC_SUPABASE_URL;

export default function registerGlobalErrorLogging() {
  const originalHandler = global.ErrorUtils?.getGlobalHandler?.();

  const handler = (error, isFatal) => {
    try {
      if (__DEV__) {
        console.error('Global JS error', error);
      }
      logClientError({
        level: isFatal ? 'fatal' : 'error',
        message: error?.message ?? String(error),
        stack: error?.stack,
        context: { isFatal },
      });
      const displayMessage = formatUserError(error, {
        supabaseUrl: SUPABASE_URL_HINT,
        fallback: 'Unerwarteter Fehler.',
      });
      Alert.alert(
        'Unerwarteter Fehler',
        `${isFatal ? 'Fatal: ' : ''}${displayMessage}`.slice(0, 400)
      );
    } catch (alertErr) {
      console.warn('Konnte Fehler nicht anzeigen:', alertErr?.message ?? alertErr);
    }

    if (typeof originalHandler === 'function') {
      originalHandler(error, isFatal);
    }
  };

  if (global.ErrorUtils && typeof global.ErrorUtils.setGlobalHandler === 'function') {
    global.ErrorUtils.setGlobalHandler(handler);
  }
}
