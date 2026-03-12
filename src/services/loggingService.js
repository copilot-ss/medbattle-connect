import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabaseClient';
import { runSupabaseRequest } from './supabaseRequest';
import { redactSensitiveText, sanitizeForTelemetry } from '../utils/privacySanitizer';

const LOG_DEDUPE_TTL_MS = 4000;
const MAX_MESSAGE_LENGTH = 800;
const MAX_STACK_LENGTH = 2000;
const recentLogs = new Map();

function sanitizeText(value, maxLength) {
  return redactSensitiveText(value, { maxLength });
}

function buildContext(extra) {
  const expoConfig = Constants?.expoConfig ?? Constants?.manifest ?? {};
  const appVersion = expoConfig?.version ?? null;
  const runtimeVersion = expoConfig?.runtimeVersion ?? null;
  const buildNumber = expoConfig?.ios?.buildNumber ?? null;
  const versionCode = expoConfig?.android?.versionCode ?? null;

  return {
    appVersion,
    runtimeVersion,
    buildNumber,
    versionCode,
    platform: Platform.OS,
    platformVersion: Platform.Version,
    isDevice: Constants?.isDevice ?? null,
    appOwnership: Constants?.appOwnership ?? null,
    ...sanitizeForTelemetry(extra, {
      maxDepth: 3,
      maxKeys: 30,
      maxItems: 12,
      maxStringLength: 600,
    }),
  };
}

export async function logClientError({ level = 'error', message, stack, context } = {}) {
  const safeMessage = sanitizeText(message, MAX_MESSAGE_LENGTH);
  const safeStack = sanitizeText(stack, MAX_STACK_LENGTH);
  const safeLevel = sanitizeText(level, 24) ?? 'error';

  if (!safeMessage) {
    return { ok: false, reason: 'empty' };
  }

  const dedupeKey = `${safeLevel}:${safeMessage}:${safeStack ?? ''}`;
  const now = Date.now();
  const lastHit = recentLogs.get(dedupeKey);
  if (lastHit && now - lastHit < LOG_DEDUPE_TTL_MS) {
    return { ok: true, deduped: true };
  }
  recentLogs.set(dedupeKey, now);

  try {
    const payload = {
      level: safeLevel,
      message: safeMessage,
      stack: safeStack,
      context: buildContext(context),
    };
    const { error } = await runSupabaseRequest(
      () => supabase.from('client_logs').insert([payload]),
      { label: 'loggingService.insertClientLog' }
    );
    if (error) {
      console.warn(
        'Konnte Client-Log nicht speichern:',
        sanitizeText(error?.message ?? error, 200)
      );
      return { ok: false, error };
    }
    return { ok: true };
  } catch (err) {
    console.warn('Konnte Client-Log nicht senden:', sanitizeText(err?.message ?? err, 200));
    return { ok: false, error: err };
  }
}
