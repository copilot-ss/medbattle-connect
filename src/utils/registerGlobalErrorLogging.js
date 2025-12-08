import { Alert } from 'react-native';

export default function registerGlobalErrorLogging() {
  const originalHandler = global.ErrorUtils?.getGlobalHandler?.();

  const handler = (error, isFatal) => {
    try {
      console.error('Global JS error', error);
      Alert.alert(
        'Unerwarteter Fehler',
        `${isFatal ? 'Fatal: ' : ''}${error?.message ?? String(error)}`.slice(0, 400)
      );
    } catch (alertErr) {
      console.warn('Konnte Fehler nicht anzeigen:', alertErr);
    }

    if (typeof originalHandler === 'function') {
      originalHandler(error, isFatal);
    }
  };

  if (global.ErrorUtils && typeof global.ErrorUtils.setGlobalHandler === 'function') {
    global.ErrorUtils.setGlobalHandler(handler);
  }
}
