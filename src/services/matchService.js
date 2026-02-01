import { supabase } from '../lib/supabaseClient';
import { runSupabaseRequest } from './supabaseRequest';
import {
  LOBBY_IDLE_TIMEOUT_MINUTES,
  MATCH_CACHE_TTL,
  MATCH_STATUS,
  normalizeDifficulty,
  normalizeMatchRow,
  sanitizeAnswer,
} from './match/matchHelpers';

const openMatchesCache = {
  key: null,
  fetchedAt: 0,
  data: null,
};

const DEFAULT_LANGUAGE = 'de';

function normalizeLanguage(value) {
  if (typeof value !== 'string') {
    return DEFAULT_LANGUAGE;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === 'en' ? 'en' : DEFAULT_LANGUAGE;
}

function normalizeLanguageOrNull(value) {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  return normalized ? normalized : null;
}

let initialLobbyCleanupPromise = null;
let lastIdleCleanupAt = 0;

async function closeWaitingMatches({ includeAllOpen = false } = {}) {
  try {
    const { data, error } = await runSupabaseRequest(
      () =>
        supabase.rpc('close_waiting_matches', {
          p_include_all: includeAllOpen,
        }),
      { label: 'matchService.closeWaitingMatches' }
    );

    if (error) {
      throw error;
    }

    const count = Number.isFinite(data) ? data : 0;

    if (count > 0) {
      invalidateOpenMatchesCache();
    }

    return count;
  } catch (err) {
    console.warn('Konnte inaktive Lobbys nicht schließen:', err?.message ?? err);
    return 0;
  }
}

async function ensureInitialLobbyCleanup() {
  if (!initialLobbyCleanupPromise) {
    initialLobbyCleanupPromise = closeWaitingMatches({ includeAllOpen: true }).catch(
      (err) => {
        console.warn('Initiales Lobby-Cleanup fehlgeschlagen:', err?.message ?? err);
        return 0;
      }
    );
  }
  return initialLobbyCleanupPromise;
}

async function ensureLobbyCleanup({ force = false } = {}) {
  await ensureInitialLobbyCleanup();

  const now = Date.now();
  if (!force && now - lastIdleCleanupAt < LOBBY_IDLE_TIMEOUT_MINUTES * 60 * 1000) {
    return;
  }

  await closeWaitingMatches();
  lastIdleCleanupAt = now;
}

function invalidateOpenMatchesCache() {
  openMatchesCache.key = null;
  openMatchesCache.fetchedAt = 0;
  openMatchesCache.data = null;
}

function maybeInvalidateOpenMatchesCache(previousMatch, updatedMatch) {
  if (
    previousMatch?.status === MATCH_STATUS.WAITING ||
    updatedMatch?.status === MATCH_STATUS.WAITING
  ) {
    invalidateOpenMatchesCache();
  }
}


export function deriveMatchRole(match, userId) {
  if (!match || !userId) {
    return null;
  }

  if (match.host_id === userId) {
    return 'host';
  }

  if (match.guest_id === userId) {
    return 'guest';
  }

  return null;
}

export async function createMatch({
  difficulty = 'mittel',
  questionLimit = 5,
  category = null,
  language,
  fallbackLanguage,
  userId,
} = {}) {
  const hostId = typeof userId === 'string' ? userId : null;

  if (!hostId) {
    return { ok: false, error: new Error('Kein Nutzer angemeldet.') };
  }

  const normalizedDifficulty = normalizeDifficulty(difficulty);
  const normalizedCategory =
    typeof category === 'string' && category.trim() ? category.trim() : null;
  const normalizedLanguage = normalizeLanguage(language);
  const normalizedFallbackLanguage =
    fallbackLanguage === undefined
      ? normalizedLanguage === DEFAULT_LANGUAGE
        ? DEFAULT_LANGUAGE
        : null
      : normalizeLanguageOrNull(fallbackLanguage);
  const limit = Number.isFinite(questionLimit)
    ? Math.max(1, Math.min(questionLimit, 50))
    : 5;

  try {
    await ensureLobbyCleanup({ force: true });

    const basePayload = {
      p_difficulty: normalizedDifficulty,
      p_question_limit: limit,
    };
    const payload = { ...basePayload };
    if (normalizedCategory) {
      payload.p_category = normalizedCategory;
    }
    if (normalizedLanguage) {
      payload.p_language = normalizedLanguage;
    }
    if (normalizedFallbackLanguage !== null) {
      payload.p_fallback_language = normalizedFallbackLanguage;
    }

    let { data, error } = await runSupabaseRequest(
      () => supabase.rpc('create_match', payload),
      { label: 'matchService.createMatch' }
    );

    if (
      error &&
      (error.code === 'PGRST202' ||
        String(error.message).includes('schema cache'))
    ) {
      if (payload.p_language || payload.p_fallback_language !== undefined) {
        const legacyPayload = { ...basePayload };
        if (normalizedCategory) {
          legacyPayload.p_category = normalizedCategory;
        }
        const legacy = await runSupabaseRequest(
          () => supabase.rpc('create_match', legacyPayload),
          { label: 'matchService.createMatch.legacy' }
        );
        if (!legacy.error) {
          data = legacy.data;
          error = null;
        } else {
          error = legacy.error;
        }
      }

      if (error && normalizedCategory) {
        const legacy = await runSupabaseRequest(
          () => supabase.rpc('create_match', basePayload),
          { label: 'matchService.createMatch.legacyMinimal' }
        );
        if (!legacy.error) {
          data = legacy.data;
          error = null;
        } else {
          error = legacy.error;
        }
      }
    }

    if (error) {
      console.error('Fehler beim Erstellen des Matches:', error.message);
      return { ok: false, error };
    }

    invalidateOpenMatchesCache();

    return { ok: true, match: normalizeMatchRow(data) };
  } catch (err) {
    console.error('Unerwarteter Fehler beim Erstellen des Matches:', err);
    return { ok: false, error: err };
  }
}

export async function joinMatch({ code, userId } = {}) {
  const sanitizedCode =
    typeof code === 'string' ? code.trim().toUpperCase() : null;
  const guestId = typeof userId === 'string' ? userId : null;

  if (!sanitizedCode) {
    return { ok: false, error: new Error('Match-Code fehlt.') };
  }

  if (!guestId) {
    return { ok: false, error: new Error('Kein Nutzer angemeldet.') };
  }

  try {
    await ensureLobbyCleanup({ force: true });

    const { data, error } = await runSupabaseRequest(
      () =>
        supabase.rpc('join_match', {
          p_code: sanitizedCode,
        }),
      { label: 'matchService.joinMatch' }
    );

    if (error) {
      return { ok: false, error };
    }

    invalidateOpenMatchesCache();

    return { ok: true, match: normalizeMatchRow(data) };
  } catch (err) {
    console.error('Unerwarteter Fehler beim Beitreten des Matches:', err);
    return { ok: false, error: err };
  }
}

export async function startMatch({ matchId, userId } = {}) {
  if (!matchId) {
    return { ok: false, error: new Error('Match-ID fehlt.') };
  }

  if (!userId) {
    return { ok: false, error: new Error('Kein Nutzer angemeldet.') };
  }

  try {
    const { data, error } = await runSupabaseRequest(
      () =>
        supabase.rpc('start_match', {
          p_match_id: matchId,
        }),
      { label: 'matchService.startMatch' }
    );

    if (error) {
      return { ok: false, error };
    }

    invalidateOpenMatchesCache();

    return { ok: true, match: normalizeMatchRow(data) };
  } catch (err) {
    console.error('Unerwarteter Fehler beim Starten des Matches:', err);
    return { ok: false, error: err };
  }
}

export async function getMatchById(matchId) {
  if (!matchId) {
    return { ok: false, error: new Error('Match-ID fehlt.') };
  }

  try {
    const { data, error } = await runSupabaseRequest(
      () =>
        supabase.rpc('get_match_by_id', {
          p_match_id: matchId,
        }),
      { label: 'matchService.getMatchById' }
    );

    if (error) {
      return { ok: false, error };
    }

    if (!data) {
      return { ok: false, error: new Error('Match nicht gefunden.') };
    }

    return { ok: true, match: normalizeMatchRow(data) };
  } catch (err) {
    console.error('Unerwarteter Fehler beim Laden des Matches:', err);
    return { ok: false, error: err };
  }
}

export async function updateMatchSettings({
  matchId,
  userId,
  difficulty = 'mittel',
  questionLimit = 5,
  language,
  fallbackLanguage,
} = {}) {
  const hostId = typeof userId === 'string' ? userId : null;

  if (!matchId) {
    return { ok: false, error: new Error('Match-ID fehlt.') };
  }

  if (!hostId) {
    return { ok: false, error: new Error('Kein Nutzer angemeldet.') };
  }

  const normalizedDifficulty = normalizeDifficulty(difficulty);
  const normalizedLanguage = normalizeLanguage(language);
  const normalizedFallbackLanguage =
    fallbackLanguage === undefined
      ? normalizedLanguage === DEFAULT_LANGUAGE
        ? DEFAULT_LANGUAGE
        : null
      : normalizeLanguageOrNull(fallbackLanguage);
  const limit = Number.isFinite(questionLimit)
    ? Math.max(1, Math.min(questionLimit, 50))
    : 5;

  try {
    const basePayload = {
      p_match_id: matchId,
      p_difficulty: normalizedDifficulty,
      p_question_limit: limit,
    };
    const payload = { ...basePayload };
    if (normalizedLanguage) {
      payload.p_language = normalizedLanguage;
    }
    if (normalizedFallbackLanguage !== null) {
      payload.p_fallback_language = normalizedFallbackLanguage;
    }

    let { data, error } = await runSupabaseRequest(
      () => supabase.rpc('update_match_settings', payload),
      { label: 'matchService.updateMatchSettings' }
    );

    if (
      error &&
      (error.code === 'PGRST202' || String(error.message).includes('schema cache'))
    ) {
      if (payload.p_language || payload.p_fallback_language !== undefined) {
        const legacy = await runSupabaseRequest(
          () => supabase.rpc('update_match_settings', basePayload),
          { label: 'matchService.updateMatchSettings.legacy' }
        );
        if (!legacy.error) {
          data = legacy.data;
          error = null;
        } else {
          error = legacy.error;
        }
      }
    }

    if (error) {
      return { ok: false, error };
    }

    invalidateOpenMatchesCache();

    return { ok: true, match: normalizeMatchRow(data) };
  } catch (err) {
    console.error('Unerwarteter Fehler beim Aktualisieren des Matches:', err);
    return { ok: false, error: err };
  }
}

export async function fetchOpenMatches({
  difficulty = null,
  force = false,
} = {}) {
  await ensureLobbyCleanup({ force });

  const normalizedDifficulty = difficulty
    ? normalizeDifficulty(difficulty)
    : null;
  const cacheKey = normalizedDifficulty ? `waiting:${normalizedDifficulty}` : 'waiting:all';
  const now = Date.now();

  if (
    !force &&
    openMatchesCache.key === cacheKey &&
    openMatchesCache.data &&
    now - openMatchesCache.fetchedAt < MATCH_CACHE_TTL
  ) {
    return openMatchesCache.data;
  }

  try {
    const { data, error } = await runSupabaseRequest(
      () =>
        supabase.rpc('get_open_matches', {
          p_difficulty: normalizedDifficulty,
        }),
      { label: 'matchService.getOpenMatches' }
    );

    if (error) {
      console.warn('Konnte offene Matches nicht laden:', error.message);
      return [];
    }

    const sanitized =
      Array.isArray(data) && data.length
        ? data
            .map((row) => {
              if (!row || !row.id || !row.code) {
                return null;
              }
              return {
                id: row.id,
                code: row.code,
                difficulty: row.difficulty ?? null,
                createdAt: row.created_at ?? null,
                questionLimit: Number.isFinite(row.question_limit)
                  ? Math.max(1, row.question_limit)
                  : 5,
                hostUsername: row.host_username ?? null,
              };
            })
            .filter(Boolean)
        : [];

    openMatchesCache.key = cacheKey;
    openMatchesCache.data = sanitized;
    openMatchesCache.fetchedAt = now;

    return sanitized;
  } catch (err) {
    console.error('Unerwarteter Fehler beim Laden offener Matches:', err);
    return [];
  }
}

export function subscribeToMatch(matchId, handler) {
  if (!matchId) {
    return () => {};
  }

  const channel = supabase.channel(`match:${matchId}`);

  channel.on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'matches',
      filter: `id=eq.${matchId}`,
    },
    (payload) => {
      if (payload?.new) {
        handler(normalizeMatchRow(payload.new));
      }
    }
  );

  try {
    channel.subscribe((status) => {
      if (status === 'CHANNEL_ERROR') {
        console.warn(
          `Match-Realtime konnte nicht abonniert werden (Status: ${status}).`
        );
      }
    });
  } catch (err) {
    console.warn('Match-Realtime konnte nicht abonniert werden:', err);
  }

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function updateMatchProgress({
  match,
  role,
  nextIndex,
  nextScore,
  answer,
  finished = false,
} = {}) {
  if (!match || !match.id) {
    return { ok: false, error: new Error('Match fehlt.') };
  }

  const playerRole = role === 'host' || role === 'guest' ? role : null;

  if (!playerRole) {
    return { ok: false, error: new Error('Ungültige Spielerrolle.') };
  }

  const nextAnswer = sanitizeAnswer(answer);
  const nextIndexValue = Number.isFinite(nextIndex) ? Math.max(nextIndex, 0) : null;
  const nextScoreValue = Number.isFinite(nextScore) ? Math.max(nextScore, 0) : null;

  try {
    const { data, error } = await runSupabaseRequest(
      () =>
        supabase.rpc('update_match_progress', {
          p_match_id: match.id,
          p_next_index: nextIndexValue,
          p_next_score: nextScoreValue,
          p_answer: nextAnswer,
          p_finished: finished ? true : false,
          p_expected_updated_at: match.updated_at ?? null,
        }),
      { label: 'matchService.updateMatchProgress' }
    );

    if (error) {
      return { ok: false, error };
    }

    if (!data) {
      return {
        ok: false,
        error: new Error('Match konnte nicht aktualisiert werden. Bitte neu laden.'),
      };
    }

    const updatedMatch = normalizeMatchRow(data);
    maybeInvalidateOpenMatchesCache(match, updatedMatch);

    return { ok: true, match: updatedMatch };
  } catch (err) {
    console.error('Unerwarteter Fehler beim Aktualisieren des Matches:', err);
    return { ok: false, error: err };
  }
}

export async function kickMatchGuest({ matchId, userId } = {}) {
  const hostId = typeof userId === 'string' ? userId : null;

  if (!matchId) {
    return { ok: false, error: new Error('Match-ID fehlt.') };
  }

  if (!hostId) {
    return { ok: false, error: new Error('Kein Nutzer angemeldet.') };
  }

  try {
    const { data, error } = await runSupabaseRequest(
      () =>
        supabase.rpc('kick_match_guest', {
          p_match_id: matchId,
        }),
      { label: 'matchService.kickMatchGuest' }
    );

    if (error) {
      return { ok: false, error };
    }

    invalidateOpenMatchesCache();

    return { ok: true, match: normalizeMatchRow(data) };
  } catch (err) {
    console.error('Unerwarteter Fehler beim Entfernen des Spielers:', err);
    return { ok: false, error: err };
  }
}

export async function markPlayerFinished({ match, role } = {}) {
  if (!match || !match.id) {
    return { ok: false, error: new Error('Match fehlt.') };
  }

  const playerRole = role === 'host' || role === 'guest' ? role : null;

  if (!playerRole) {
    return { ok: false, error: new Error('Ungültige Spielerrolle.') };
  }

  try {
    const { data, error } = await runSupabaseRequest(
      () =>
        supabase.rpc('mark_player_finished', {
          p_match_id: match.id,
          p_expected_updated_at: match.updated_at ?? null,
        }),
      { label: 'matchService.markPlayerFinished' }
    );

    if (error) {
      return { ok: false, error };
    }

    const updatedMatch = normalizeMatchRow(data);
    maybeInvalidateOpenMatchesCache(match, updatedMatch);
    return { ok: true, match: updatedMatch };
  } catch (err) {
    console.error('Unerwarteter Fehler beim Abschließen des Matches:', err);
    return { ok: false, error: err };
  }
}

export async function abandonMatch({ match, role } = {}) {
  if (!match || !match.id) {
    return { ok: false, error: new Error('Match fehlt.') };
  }

  const playerRole = role === 'host' || role === 'guest' ? role : null;

  if (!playerRole) {
    return { ok: false, error: new Error('Ungültige Spielerrolle.') };
  }

  try {
    const { data, error } = await runSupabaseRequest(
      () =>
        supabase.rpc('abandon_match', {
          p_match_id: match.id,
        }),
      { label: 'matchService.abandonMatch' }
    );

    if (error) {
      return { ok: false, error };
    }

    const updatedMatch = normalizeMatchRow(data);
    maybeInvalidateOpenMatchesCache(match, updatedMatch);
    return { ok: true, match: updatedMatch };
  } catch (err) {
    console.error('Unerwarteter Fehler beim Abbrechen des Matches:', err);
    return { ok: false, error: err };
  }
}
