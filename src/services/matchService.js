import { supabase } from '../lib/supabaseClient';
import { fetchQuestions } from './quizService';
import { fetchUserProfile } from './userService';
import {
  LOBBY_IDLE_TIMEOUT_MINUTES,
  MATCH_CACHE_TTL,
  MATCH_STATUS,
  generateJoinCode,
  normalizeDifficulty,
  normalizeMatchRow,
  normalizeMatchState,
  nowIso,
  sanitizeAnswer,
  sanitizeQuestionsForMatch,
} from './match/matchHelpers';

const openMatchesCache = {
  key: null,
  fetchedAt: 0,
  data: null,
};

let initialLobbyCleanupPromise = null;
let lastIdleCleanupAt = 0;

async function closeWaitingMatches({ includeAllOpen = false } = {}) {
  try {
    let query = supabase
      .from('matches')
      .update({
        status: MATCH_STATUS.CANCELLED,
        finished_at: nowIso(),
        updated_at: nowIso(),
      })
      .eq('status', MATCH_STATUS.WAITING);

    if (!includeAllOpen) {
      const cutoff = new Date(
        Date.now() - LOBBY_IDLE_TIMEOUT_MINUTES * 60 * 1000
      ).toISOString();
      query = query.lte('created_at', cutoff);
    }

    const { data, error } = await query.select('id');

    if (error) {
      throw error;
    }

    if (data?.length) {
      invalidateOpenMatchesCache();
    }

    return data?.length ?? 0;
  } catch (err) {
    console.warn('Konnte inaktive Lobbys nicht schliessen:', err?.message ?? err);
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
  userId,
} = {}) {
  const hostId = typeof userId === 'string' ? userId : null;

  if (!hostId) {
    return { ok: false, error: new Error('Kein Nutzer angemeldet.') };
  }

  const normalizedDifficulty = normalizeDifficulty(difficulty);
  const limit = Number.isFinite(questionLimit) ? Math.max(1, questionLimit) : 5;

  try {
    await ensureLobbyCleanup({ force: true });

    const questions = await fetchQuestions(normalizedDifficulty, limit);

    if (!questions.length) {
      return {
        ok: false,
        error: new Error('Keine Fragen fuer Multiplayer verfuegbar.'),
      };
    }

    const sanitizedQuestions = sanitizeQuestionsForMatch(questions);

    if (!sanitizedQuestions.length) {
      return {
        ok: false,
        error: new Error('Fragenliste konnte fuer Multiplayer nicht vorbereitet werden.'),
      };
    }

    const questionIds = sanitizedQuestions
      .map((item) => item.id)
      .filter((value) => typeof value === 'string');

    const joinCode = generateJoinCode();
    const hostProfile = await fetchUserProfile(hostId);
    const hostUsername = hostProfile.ok ? hostProfile.profile?.username ?? null : null;
    const state = normalizeMatchState({
      host: {
        userId: hostId,
        username: hostUsername,
        index: 0,
        score: 0,
        finished: false,
        answers: [],
      },
      guest: {
        userId: null,
        username: null,
        index: 0,
        score: 0,
        finished: false,
        answers: [],
      },
      history: [],
    });

    const payload = {
      code: joinCode,
      host_id: hostId,
      guest_id: null,
      difficulty: normalizedDifficulty,
      question_limit: sanitizedQuestions.length,
      question_ids: questionIds,
      questions: sanitizedQuestions,
      status: MATCH_STATUS.WAITING,
      state,
      started_at: null,
      finished_at: null,
      updated_at: nowIso(),
    };

    const { data, error } = await supabase
      .from('matches')
      .insert([payload])
      .select('*')
      .single();

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

    const { data: matchRow, error: fetchError } = await supabase
      .from('matches')
      .select('*')
      .eq('code', sanitizedCode)
      .maybeSingle();

    if (fetchError) {
      return { ok: false, error: fetchError };
    }

    if (!matchRow) {
      return { ok: false, error: new Error('Match nicht gefunden.') };
    }

    const match = normalizeMatchRow(matchRow);
    const role = deriveMatchRole(match, guestId);

    if (role === 'host' || role === 'guest') {
      return { ok: true, match };
    }

    if (match.status !== MATCH_STATUS.WAITING) {
      return { ok: false, error: new Error('Dieses Match laeuft bereits oder ist beendet.') };
    }

    if (match.guest_id && match.guest_id !== guestId) {
      return { ok: false, error: new Error('Dieses Match ist bereits voll.') };
    }

    const guestProfile = await fetchUserProfile(guestId);
    const guestUsername = guestProfile.ok ? guestProfile.profile?.username ?? null : null;
    const nextState = normalizeMatchState({
      ...match.state,
      guest: {
        ...match.state.guest,
        userId: guestId,
        username: guestUsername,
        ready: false,
      },
    });

    const updatePayload = {
      guest_id: guestId,
      state: nextState,
      updated_at: nowIso(),
    };

    let updateQuery = supabase
      .from('matches')
      .update(updatePayload)
      .eq('id', match.id);

    if (match.updated_at) {
      updateQuery = updateQuery.eq('updated_at', match.updated_at);
    }

    const { data: updated, error: updateError } = await updateQuery
      .select('*')
      .single();

    if (updateError) {
      return { ok: false, error: updateError };
    }

    invalidateOpenMatchesCache();

    return { ok: true, match: normalizeMatchRow(updated) };
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

  const matchResult = await getMatchById(matchId);
  if (!matchResult.ok) {
    return matchResult;
  }

  const match = matchResult.match;
  if (!match || match.host_id !== userId) {
    return { ok: false, error: new Error('Nur der Host kann das Match starten.') };
  }

  if (match.status !== MATCH_STATUS.WAITING) {
    return { ok: false, error: new Error('Match laeuft bereits oder ist beendet.') };
  }

  const nextState = normalizeMatchState(match.state);
  nextState.host = { ...nextState.host, ready: true };
  nextState.guest = { ...nextState.guest, ready: true };

  const payload = {
    status: MATCH_STATUS.ACTIVE,
    started_at: match.started_at ?? nowIso(),
    state: nextState,
    updated_at: nowIso(),
  };

  try {
    let updateQuery = supabase.from('matches').update(payload).eq('id', match.id);
    if (match.updated_at) {
      updateQuery = updateQuery.eq('updated_at', match.updated_at);
    }

    const { data, error } = await updateQuery.select('*').single();

    if (error) {
      return { ok: false, error };
    }

    const updatedMatch = normalizeMatchRow(data);
    if (match.status === MATCH_STATUS.WAITING || updatedMatch?.status === MATCH_STATUS.WAITING) {
      invalidateOpenMatchesCache();
    }

    return { ok: true, match: updatedMatch };
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
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .maybeSingle();

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
} = {}) {
  const hostId = typeof userId === 'string' ? userId : null;

  if (!matchId) {
    return { ok: false, error: new Error('Match-ID fehlt.') };
  }

  if (!hostId) {
    return { ok: false, error: new Error('Kein Nutzer angemeldet.') };
  }

  const matchResult = await getMatchById(matchId);

  if (!matchResult.ok) {
    return matchResult;
  }

  const match = matchResult.match;

  if (!match || match.host_id !== hostId) {
    return { ok: false, error: new Error('Nur der Host kann die Lobby anpassen.') };
  }

  if (match.status !== MATCH_STATUS.WAITING) {
    return { ok: false, error: new Error('Die Lobby laeuft bereits.') };
  }

  const normalizedDifficulty = normalizeDifficulty(difficulty);
  const limit = Number.isFinite(questionLimit)
    ? Math.max(1, Math.min(questionLimit, 50))
    : Math.max(match.question_limit ?? 5, 1);

  try {
    const questions = await fetchQuestions(normalizedDifficulty, limit);

    if (!questions.length) {
      return {
        ok: false,
        error: new Error('Keine Fragen fuer die gewaehlte Einstellung verfuegbar.'),
      };
    }

    const sanitizedQuestions = sanitizeQuestionsForMatch(questions);

    if (!sanitizedQuestions.length) {
      return {
        ok: false,
        error: new Error('Fragenliste konnte nicht vorbereitet werden.'),
      };
    }

    const questionIds = sanitizedQuestions
      .map((item) => item.id)
      .filter((value) => typeof value === 'string');

    const nextState = normalizeMatchState(match.state);
    nextState.host = {
      ...nextState.host,
      index: 0,
      score: 0,
      finished: false,
      answers: [],
    };
    nextState.guest = {
      userId: null,
      username: null,
      index: 0,
      score: 0,
      finished: false,
      answers: [],
    };
    nextState.history = [];

    const payload = {
      difficulty: normalizedDifficulty,
      question_limit: sanitizedQuestions.length,
      question_ids: questionIds,
      questions: sanitizedQuestions,
      state: nextState,
      status: MATCH_STATUS.WAITING,
      started_at: null,
      updated_at: nowIso(),
    };

    const { data, error } = await supabase
      .from('matches')
      .update(payload)
      .eq('id', match.id)
      .select('*')
      .single();

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
    let query = supabase
      .from('matches')
      .select('id, code, difficulty, question_limit, state, created_at, guest_id')
      .eq('status', MATCH_STATUS.WAITING)
      .is('guest_id', null)
      .order('created_at', { ascending: true })
      .limit(24);

    if (normalizedDifficulty) {
      query = query.eq('difficulty', normalizedDifficulty);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Konnte offene Matches nicht laden:', error.message);
      return [];
    }

    const sanitized =
      Array.isArray(data) && data.length
        ? data
            .map((row) => {
              const normalized = normalizeMatchRow(row);
              if (!normalized) {
                return null;
              }
              if (normalized.status !== MATCH_STATUS.WAITING) {
                return null;
              }
              return {
                id: normalized.id,
                code: normalized.code,
                difficulty: normalized.difficulty,
                createdAt: normalized.created_at ?? null,
                questionLimit: normalized.question_limit,
                hostUsername: normalized.state?.host?.username ?? null,
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
    return { ok: false, error: new Error('Ungueltige Spielerrolle.') };
  }

  const nextAnswer = sanitizeAnswer(answer);
  const state = normalizeMatchState(match.state);
  const roleState = state[playerRole];

  const updatedAnswers = nextAnswer
    ? [...roleState.answers, nextAnswer].slice(-50)
    : [...roleState.answers];

  const updatedRoleState = {
    ...roleState,
    index: Number.isFinite(nextIndex) ? Math.max(nextIndex, 0) : roleState.index,
    score: Number.isFinite(nextScore) ? Math.max(nextScore, 0) : roleState.score,
    finished: finished ? true : roleState.finished,
    answers: updatedAnswers,
    lastAnswerAt: nextAnswer?.answeredAt ?? nowIso(),
  };

  const otherRole = playerRole === 'host' ? 'guest' : 'host';
  const otherState = state[otherRole];

  const nextState = {
    ...state,
    [playerRole]: updatedRoleState,
  };

  if (nextAnswer) {
    nextState.history = [
      ...state.history,
      { ...nextAnswer, player: playerRole },
    ].slice(-100);
  } else {
    nextState.history = [...state.history];
  }

  const bothFinished =
    (finished || updatedRoleState.finished) && otherState.finished;

  const payload = {
    state: nextState,
    updated_at: nowIso(),
  };

  if (match.status === MATCH_STATUS.WAITING) {
    payload.status = MATCH_STATUS.ACTIVE;
    payload.started_at = match.started_at ?? nowIso();
  }

  if (bothFinished) {
    payload.status = MATCH_STATUS.COMPLETED;
    payload.finished_at = nowIso();
  }

  try {
    let updateQuery = supabase.from('matches').update(payload).eq('id', match.id);

    if (match.updated_at) {
      updateQuery = updateQuery.eq('updated_at', match.updated_at);
    }

    const { data, error } = await updateQuery.select('*').single();

    if (error) {
      if (error.code === 'PGRST116' || error.code === 'PGRST109') {
        return {
          ok: false,
          error: new Error('Match wurde bereits aktualisiert. Lade es neu und versuche es erneut.'),
        };
      }
      return { ok: false, error };
    }

    if (!data) {
      return {
        ok: false,
        error: new Error('Match wurde parallel aktualisiert. Bitte neu laden.'),
      };
    }

    const updatedMatch = normalizeMatchRow(data);
    if (
      match.status === MATCH_STATUS.WAITING ||
      updatedMatch?.status === MATCH_STATUS.WAITING
    ) {
      invalidateOpenMatchesCache();
    }

    return { ok: true, match: updatedMatch };
  } catch (err) {
    console.error('Unerwarteter Fehler beim Aktualisieren des Matches:', err);
    return { ok: false, error: err };
  }
}

export async function markPlayerFinished({ match, role } = {}) {
  if (!match || !match.id) {
    return { ok: false, error: new Error('Match fehlt.') };
  }

  const playerRole = role === 'host' || role === 'guest' ? role : null;

  if (!playerRole) {
    return { ok: false, error: new Error('Ungueltige Spielerrolle.') };
  }

  const state = normalizeMatchState(match.state);
  const nextState = {
    ...state,
    [playerRole]: {
      ...state[playerRole],
      finished: true,
    },
  };

  const payload = {
    state: nextState,
    updated_at: nowIso(),
  };

  if (
    nextState[playerRole].finished &&
    nextState[playerRole === 'host' ? 'guest' : 'host'].finished
  ) {
    payload.status = MATCH_STATUS.COMPLETED;
    payload.finished_at = nowIso();
  }

  try {
    let updateQuery = supabase.from('matches').update(payload).eq('id', match.id);

    if (match.updated_at) {
      updateQuery = updateQuery.eq('updated_at', match.updated_at);
    }

    const { data, error } = await updateQuery.select('*').single();

    if (error) {
      return { ok: false, error };
    }

    const updatedMatch = normalizeMatchRow(data);
    if (
      match.status === MATCH_STATUS.WAITING ||
      updatedMatch?.status === MATCH_STATUS.WAITING
    ) {
      invalidateOpenMatchesCache();
    }
    return { ok: true, match: updatedMatch };
  } catch (err) {
    console.error('Unerwarteter Fehler beim Abschliessen des Matches:', err);
    return { ok: false, error: err };
  }
}

export async function abandonMatch({ match, role } = {}) {
  if (!match || !match.id) {
    return { ok: false, error: new Error('Match fehlt.') };
  }

  const playerRole = role === 'host' || role === 'guest' ? role : null;

  if (!playerRole) {
    return { ok: false, error: new Error('Ungueltige Spielerrolle.') };
  }

  const state = normalizeMatchState(match.state);
  const nextState = {
    ...state,
    [playerRole]: {
      ...state[playerRole],
      finished: true,
      gaveUp: true,
    },
  };

  const payload = {
    state: nextState,
    status: MATCH_STATUS.CANCELLED,
    finished_at: nowIso(),
    updated_at: nowIso(),
  };

  try {
    let updateQuery = supabase.from('matches').update(payload).eq('id', match.id);

    if (match.updated_at) {
      updateQuery = updateQuery.eq('updated_at', match.updated_at);
    }

    const { data, error } = await updateQuery.select('*').single();

    if (error) {
      return { ok: false, error };
    }

    const updatedMatch = normalizeMatchRow(data);
    if (
      match.status === MATCH_STATUS.WAITING ||
      updatedMatch?.status === MATCH_STATUS.WAITING
    ) {
      invalidateOpenMatchesCache();
    }
    return { ok: true, match: updatedMatch };
  } catch (err) {
    console.error('Unerwarteter Fehler beim Abbrechen des Matches:', err);
    return { ok: false, error: err };
  }
}
