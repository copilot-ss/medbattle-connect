import { supabase } from '../lib/supabaseClient';
import { fetchQuestions } from './quizService';

const MATCH_CACHE_TTL = 15 * 1000;
const MATCH_STATUS = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

const openMatchesCache = {
  key: null,
  fetchedAt: 0,
  data: null,
};

function nowIso() {
  return new Date().toISOString();
}

function normalizeDifficulty(value) {
  const normalized = typeof value === 'string' ? value.toLowerCase() : '';
  if (normalized === 'leicht' || normalized === 'mittel' || normalized === 'schwer') {
    return normalized;
  }
  return 'mittel';
}

function sanitizeQuestionsForMatch(questions) {
  if (!Array.isArray(questions)) {
    return [];
  }

  return questions
    .map((question) => {
      if (!question || typeof question !== 'object') {
        return null;
      }

      const baseOptions = Array.isArray(question.options)
        ? question.options.filter(Boolean)
        : [];
      const uniqueOptions = Array.from(new Set(baseOptions));

      if (
        question.correct_answer &&
        !uniqueOptions.includes(question.correct_answer)
      ) {
        uniqueOptions.push(question.correct_answer);
      }

      return {
        id: question.id ?? null,
        question: question.question ?? '',
        correct_answer: question.correct_answer ?? null,
        options: uniqueOptions,
      };
    })
    .filter(
      (item) =>
        item &&
        item.question &&
        item.correct_answer &&
        Array.isArray(item.options) &&
        item.options.length >= 2
    );
}

function sanitizeAnswer(answer) {
  if (!answer || typeof answer !== 'object') {
    return null;
  }

  return {
    questionId: answer.questionId ?? null,
    selectedOption:
      typeof answer.selectedOption === 'string' ? answer.selectedOption : null,
    correct: Boolean(answer.correct),
    durationMs: Number.isFinite(answer.durationMs)
      ? Math.max(answer.durationMs, 0)
      : null,
    timedOut: Boolean(answer.timedOut),
    answeredAt: answer.answeredAt ?? nowIso(),
  };
}

function normalizeMatchState(state) {
  const base = {
    host: {
      userId: null,
      username: null,
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
  };

  if (!state || typeof state !== 'object') {
    return base;
  }

  const next = { ...base };

  for (const roleKey of ['host', 'guest']) {
    const roleState = state[roleKey] ?? {};
    next[roleKey] = {
      userId: roleState.userId ?? base[roleKey].userId,
      username: roleState.username ?? base[roleKey].username,
      index: Number.isFinite(roleState.index) ? Math.max(roleState.index, 0) : 0,
      score: Number.isFinite(roleState.score) ? Math.max(roleState.score, 0) : 0,
      finished: Boolean(roleState.finished),
      answers: Array.isArray(roleState.answers)
        ? roleState.answers
            .map(sanitizeAnswer)
            .filter(Boolean)
            .slice(-50)
        : [],
    };
  }

  next.history = Array.isArray(state.history)
    ? state.history
        .map((entry) => {
          if (!entry || typeof entry !== 'object') {
            return null;
          }
          const answer = sanitizeAnswer(entry);
          if (!answer) {
            return null;
          }
          const player =
            entry.player === 'host' || entry.player === 'guest'
              ? entry.player
              : null;
          if (!player) {
            return null;
          }
          return { ...answer, player };
        })
        .filter(Boolean)
        .slice(-100)
    : [];

  return next;
}

function normalizeMatchRow(row) {
  if (!row || typeof row !== 'object') {
    return null;
  }

  return {
    ...row,
    status: typeof row.status === 'string' ? row.status : MATCH_STATUS.WAITING,
    question_limit: Number.isFinite(row.question_limit)
      ? Math.max(1, row.question_limit)
      : 5,
    questions: sanitizeQuestionsForMatch(row.questions),
    state: normalizeMatchState(row.state),
  };
}

function generateJoinCode() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '23456789';
  let code = '';

  for (let i = 0; i < 3; i += 1) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  for (let i = 0; i < 2; i += 1) {
    code += digits.charAt(Math.floor(Math.random() * digits.length));
  }

  return code;
}

async function fetchUserProfile(userId) {
  if (!userId) {
    return { username: null };
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      return { username: null };
    }

    return {
      username: data?.username ?? null,
    };
  } catch (err) {
    console.warn('Konnte Nutzerprofil fuer Match nicht abrufen:', err);
    return { username: null };
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
  userId,
} = {}) {
  const hostId = typeof userId === 'string' ? userId : null;

  if (!hostId) {
    return { ok: false, error: new Error('Kein Nutzer angemeldet.') };
  }

  const normalizedDifficulty = normalizeDifficulty(difficulty);
  const limit = Number.isFinite(questionLimit) ? Math.max(1, questionLimit) : 5;

  try {
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

    const joinCode = generateJoinCode();
    const hostProfile = await fetchUserProfile(hostId);
    const state = normalizeMatchState({
      host: {
        userId: hostId,
        username: hostProfile.username,
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

    if (match.guest_id && match.guest_id !== guestId) {
      return { ok: false, error: new Error('Dieses Match ist bereits voll.') };
    }

    const guestProfile = await fetchUserProfile(guestId);
    const nextState = normalizeMatchState({
      ...match.state,
      guest: {
        ...match.state.guest,
        userId: guestId,
        username: guestProfile.username,
      },
    });

    const updatePayload = {
      guest_id: guestId,
      status: MATCH_STATUS.ACTIVE,
      started_at: match.started_at ?? nowIso(),
      state: nextState,
      updated_at: nowIso(),
    };

    const { data: updated, error: updateError } = await supabase
      .from('matches')
      .update(updatePayload)
      .eq('id', match.id)
      .select('*')
      .single();

    if (updateError) {
      return { ok: false, error: updateError };
    }

    return { ok: true, match: normalizeMatchRow(updated) };
  } catch (err) {
    console.error('Unerwarteter Fehler beim Beitreten des Matches:', err);
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

export async function fetchOpenMatches({
  difficulty = null,
  force = false,
} = {}) {
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
      .select('id, code, difficulty, question_limit, state, created_at')
      .eq('status', MATCH_STATUS.WAITING)
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

  channel.subscribe().catch((err) => {
    console.warn('Match-Realtime konnte nicht abonniert werden:', err);
  });

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
    const { data, error } = await supabase
      .from('matches')
      .update(payload)
      .eq('id', match.id)
      .select('*')
      .single();

    if (error) {
      return { ok: false, error };
    }

    return { ok: true, match: normalizeMatchRow(data) };
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
    const { data, error } = await supabase
      .from('matches')
      .update(payload)
      .eq('id', match.id)
      .select('*')
      .single();

    if (error) {
      return { ok: false, error };
    }

    return { ok: true, match: normalizeMatchRow(data) };
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
    const { data, error } = await supabase
      .from('matches')
      .update(payload)
      .eq('id', match.id)
      .select('*')
      .single();

    if (error) {
      return { ok: false, error };
    }

    return { ok: true, match: normalizeMatchRow(data) };
  } catch (err) {
    console.error('Unerwarteter Fehler beim Abbrechen des Matches:', err);
    return { ok: false, error: err };
  }
}

