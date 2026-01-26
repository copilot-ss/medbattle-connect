import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabaseClient';
import OFFLINE_SEED_QUESTIONS from '../data/offlineSeedQuestions';
import { runSupabaseRequest } from './supabaseRequest';

const LEADERBOARD_CACHE_TTL = 30 * 1000;
const leaderboardCache = {
  data: null,
  fetchedAt: 0,
};
const QUESTIONS_CACHE_TTL = 20 * 1000;
const questionsCache = new Map();
const QUESTIONS_STORAGE_PREFIX = 'medbattle_questions_cache';
const MAX_CACHED_QUESTIONS = 200;
const QUESTION_CACHE_SYNC_TTL = 6 * 60 * 60 * 1000;
let lastQuestionCacheSyncAt = 0;
const BASE_MATCH_POINTS = 12;
const PENDING_SCORES_KEY = 'medbattle_pending_scores';
const MAX_PENDING_SCORES = 50;
const DIFFICULTY_MULTIPLIERS = {
  leicht: 0.8,
  mittel: 1,
  schwer: 1.25,
};

function normalizeDifficulty(value) {
  return ['leicht', 'mittel', 'schwer'].includes(value)
    ? value
    : 'mittel';
}

function sanitizePoints(value) {
  return Number.isFinite(value) ? Math.max(value, 0) : 0;
}

function parseOptions(rawOptions) {
  if (Array.isArray(rawOptions)) {
    return rawOptions.filter(Boolean);
  }

  if (typeof rawOptions === 'string' && rawOptions.trim()) {
    try {
      const parsed = JSON.parse(rawOptions);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch (err) {
      console.warn('Konnte Antwortoptionen nicht parsen:', err);
      return [];
    }
  }

  return [];
}

function normalizeOptions(rawOptions, correctAnswer) {
  const options = parseOptions(rawOptions);
  const unique = Array.from(new Set(options.filter(Boolean)));
  if (correctAnswer && !unique.includes(correctAnswer)) {
    unique.push(correctAnswer);
  }
  return shuffleList(unique);
}

function shuffleList(list) {
  const copy = Array.isArray(list) ? [...list] : [];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalizeQuestionList(rows, fallbackDifficulty) {
  const source = Array.isArray(rows) ? rows : [];
  return source
    .map((question) => {
      if (!question) {
        return null;
      }
      return {
        ...question,
        difficulty: question.difficulty ?? fallbackDifficulty,
        options: normalizeOptions(question.options, question.correct_answer),
      };
    })
    .filter(
      (question) =>
        question &&
        question.question &&
        question.correct_answer &&
        Array.isArray(question.options) &&
        question.options.length >= 2
    );
}

function buildQuestionsStorageKey({ difficulty, category }) {
  return `${QUESTIONS_STORAGE_PREFIX}:${difficulty}:${category ?? 'all'}`;
}

async function loadCachedQuestions(storageKey) {
  try {
    const raw = await AsyncStorage.getItem(storageKey);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    if (Array.isArray(parsed?.questions)) {
      return parsed.questions;
    }
    return [];
  } catch (err) {
    console.warn('Konnte lokale Fragen nicht lesen:', err);
    return [];
  }
}

async function saveCachedQuestions(storageKey, questions) {
  try {
    const trimmed = Array.isArray(questions)
      ? questions.slice(-MAX_CACHED_QUESTIONS)
      : [];
    const payload = {
      savedAt: new Date().toISOString(),
      questions: trimmed,
    };
    await AsyncStorage.setItem(storageKey, JSON.stringify(payload));
  } catch (err) {
    console.warn('Konnte lokale Fragen nicht speichern:', err);
  }
}

function mergeCachedQuestions(existing, incoming) {
  const merged = new Map();
  const order = [];

  const pushQuestion = (question) => {
    if (!question?.id) {
      return;
    }
    if (!merged.has(question.id)) {
      order.push(question.id);
      merged.set(question.id, question);
      return;
    }

    const previous = merged.get(question.id);
    const previousUpdated = Date.parse(previous?.updated_at ?? '');
    const nextUpdated = Date.parse(question?.updated_at ?? '');

    if (
      Number.isFinite(nextUpdated) &&
      (!Number.isFinite(previousUpdated) || nextUpdated >= previousUpdated)
    ) {
      merged.set(question.id, { ...previous, ...question });
    } else {
      merged.set(question.id, { ...question, ...previous });
    }
  };

  (Array.isArray(existing) ? existing : []).forEach(pushQuestion);
  (Array.isArray(incoming) ? incoming : []).forEach(pushQuestion);

  const list = order.map((id) => merged.get(id)).filter(Boolean);
  if (list.length <= MAX_CACHED_QUESTIONS) {
    return list;
  }
  return list.slice(-MAX_CACHED_QUESTIONS);
}

async function syncCachedQuestions(storageKey, incoming) {
  const existing = await loadCachedQuestions(storageKey);
  const merged = mergeCachedQuestions(existing, incoming);
  await saveCachedQuestions(storageKey, merged);
  return merged;
}

function buildOfflineSeedQuestions(difficulty, limit) {
  const pool = OFFLINE_SEED_QUESTIONS.filter(
    (question) => question?.difficulty === difficulty
  );
  const source = pool.length ? pool : OFFLINE_SEED_QUESTIONS;
  const shuffled = shuffleList(source);
  return shuffled.slice(0, limit);
}

async function readPendingScores() {
  try {
    const raw = await AsyncStorage.getItem(PENDING_SCORES_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Konnte Offline-Scores nicht lesen:', err);
    return [];
  }
}

async function writePendingScores(entries) {
  try {
    const trimmed = Array.isArray(entries)
      ? entries.slice(-MAX_PENDING_SCORES)
      : [];
    await AsyncStorage.setItem(PENDING_SCORES_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.warn('Konnte Offline-Scores nicht speichern:', err);
  }
}

export async function queueScore(userId, points, difficulty) {
  if (!userId || userId === 'guest') {
    return { ok: false, reason: 'guest' };
  }

  const pending = await readPendingScores();
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId,
    points: sanitizePoints(points),
    difficulty: normalizeDifficulty(difficulty),
    createdAt: new Date().toISOString(),
  };
  pending.push(entry);
  await writePendingScores(pending);
  return { ok: true, queued: true };
}

export async function flushQueuedScores(userId) {
  if (!userId || userId === 'guest') {
    return { ok: false, reason: 'guest' };
  }

  const pending = await readPendingScores();
  if (!pending.length) {
    return { ok: true, flushed: 0 };
  }

  const remaining = [];
  let flushed = 0;

  for (const entry of pending) {
    if (entry?.userId !== userId) {
      remaining.push(entry);
      continue;
    }

    try {
      const { error } = await runSupabaseRequest(
        () =>
          supabase.rpc('submit_score', {
            p_user_id: userId,
            p_points: sanitizePoints(entry?.points),
            p_difficulty: normalizeDifficulty(entry?.difficulty),
          }),
        { label: 'quizService.submitScore.flush' }
      );
      if (error) {
        throw error;
      }
      flushed += 1;
    } catch (err) {
      remaining.push(entry);
    }
  }

  await writePendingScores(remaining);
  return { ok: true, flushed, remaining: remaining.length };
}

function buildQuestionsCacheKey({ difficulty, limit, category }) {
  return `${difficulty}:${limit}:${category ?? 'all'}`;
}

function cloneQuestions(list) {
  if (!Array.isArray(list)) {
    return [];
  }
  return list.map((question) => ({
    ...question,
    options: Array.isArray(question.options) ? [...question.options] : [],
  }));
}

export async function fetchQuestions(
  difficulty = 'mittel',
  limit = 6,
  category = null,
  { force = false, offline = false } = {}
) {
  const normalizedDifficulty = normalizeDifficulty(difficulty);
  const normalizedLimit =
    Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 6;
  const normalizedCategory =
    typeof category === 'string' && category.trim() ? category.trim() : null;
  const cacheKey = buildQuestionsCacheKey({
    difficulty: normalizedDifficulty,
    limit: normalizedLimit,
    category: normalizedCategory,
  });
  const storageKey = buildQuestionsStorageKey({
    difficulty: normalizedDifficulty,
    category: normalizedCategory,
  });
  const now = Date.now();

  if (!force && !offline) {
    const cached = questionsCache.get(cacheKey);
    if (cached && now - cached.fetchedAt < QUESTIONS_CACHE_TTL) {
      return cloneQuestions(cached.data);
    }
  }

  const resolveCachedQuestions = async () => {
    const cached = await loadCachedQuestions(storageKey);
    const normalized = normalizeQuestionList(cached, normalizedDifficulty);
    if (!normalized.length) {
      return [];
    }
    const shuffled = shuffleList(normalized).slice(0, normalizedLimit);
    questionsCache.set(cacheKey, { data: shuffled, fetchedAt: Date.now() });
    return cloneQuestions(shuffled);
  };

  if (offline) {
    const cached = await resolveCachedQuestions();
    if (cached.length) {
      return cached;
    }
    const offlineQuestions = normalizeQuestionList(
      buildOfflineSeedQuestions(normalizedDifficulty, normalizedLimit),
      normalizedDifficulty
    );
    return cloneQuestions(offlineQuestions);
  }

  try {
    const { data, error } = await runSupabaseRequest(
      () =>
        supabase.rpc('get_questions', {
          p_difficulty: normalizedDifficulty,
          p_limit: normalizedLimit,
          p_category: normalizedCategory,
        }),
      { label: 'quizService.getQuestions' }
    );

    if (error) {
      console.warn('Fehler beim Laden der Fragen:', error.message);
      const cached = await resolveCachedQuestions();
      if (cached.length) {
        return cached;
      }
      return [];
    }

    const rows = Array.isArray(data) ? data : [];

    if (!rows.length) {
      console.warn('Keine Fragen in Supabase gefunden fuer Schwierigkeitsgrad:', normalizedDifficulty);
      const cached = await resolveCachedQuestions();
      if (cached.length) {
        return cached;
      }
      return [];
    }

    const normalized = normalizeQuestionList(rows, normalizedDifficulty);

    if (!normalized.length) {
      console.warn('Fragen ohne gueltige Antwortoptionen gefunden.');
      const cached = await resolveCachedQuestions();
      if (cached.length) {
        return cached;
      }
      return [];
    }

    questionsCache.set(cacheKey, { data: normalized, fetchedAt: now });
    syncCachedQuestions(storageKey, normalized).catch((err) => {
      console.warn('Konnte Fragen-Cache nicht synchronisieren:', err);
    });
    return cloneQuestions(normalized);
  } catch (err) {
    console.error('Unerwarteter Fehler beim Laden der Fragen:', err);
    const cached = await resolveCachedQuestions();
    if (cached.length) {
      return cached;
    }
    return [];
  }
}

export async function syncQuestionCache({ force = false, limit = 16 } = {}) {
  const now = Date.now();
  if (
    !force &&
    lastQuestionCacheSyncAt &&
    now - lastQuestionCacheSyncAt < QUESTION_CACHE_SYNC_TTL
  ) {
    return { ok: true, skipped: true };
  }

  const normalizedLimit =
    Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 16;
  const difficulties = ['leicht', 'mittel', 'schwer'];
  const results = [];

  for (const difficulty of difficulties) {
    const questions = await fetchQuestions(difficulty, normalizedLimit, null, {
      force: true,
    });
    results.push({
      difficulty,
      count: Array.isArray(questions) ? questions.length : 0,
    });
  }

  if (results.some((result) => result.count > 0)) {
    lastQuestionCacheSyncAt = now;
  }

  return { ok: true, results };
}

export function calculateMatchPoints({ correct = 0, total = 0, difficulty = 'mittel' } = {}) {
  const safeTotal = Math.max(1, Number.isFinite(total) ? total : 0);
  const normalizedDifficulty =
    typeof difficulty === 'string' && difficulty.trim()
      ? difficulty.trim().toLowerCase()
      : 'mittel';
  const multiplier = DIFFICULTY_MULTIPLIERS[normalizedDifficulty] ?? 1;
  const accuracy = Math.max(0, Math.min(correct / safeTotal, 1));
  const rawPoints = BASE_MATCH_POINTS * multiplier * accuracy;

  return Math.max(0, Math.round(rawPoints));
}

export async function fetchLeaderboard(limit = 20, { force = false } = {}) {
  const now = Date.now();

  if (
    !force &&
    leaderboardCache.data &&
    now - leaderboardCache.fetchedAt < LEADERBOARD_CACHE_TTL
  ) {
    return leaderboardCache.data.slice(0, limit);
  }

  try {
    const { data, error } = await runSupabaseRequest(
      () =>
        supabase.rpc('get_leaderboard', {
          p_limit: limit,
        }),
      { label: 'quizService.getLeaderboard' }
    );

    if (error) {
      console.warn('Fehler beim Laden der Rangliste:', error.message);
      return [];
    }

    if (!Array.isArray(data) || !data.length) {
      return [];
    }

    const ranked = data.map((item) => ({
      id: item.id,
      userId: item.user_id,
      username: item.username ?? null,
      xp: Number.isFinite(item.xp) ? item.xp : null,
      points: Number.isFinite(item.points) ? item.points : 0,
      difficulty: item.difficulty ?? 'unbekannt',
      createdAt: item.created_at ?? null,
    }));

    leaderboardCache.data = ranked;
    leaderboardCache.fetchedAt = now;

    return ranked;
  } catch (err) {
    console.error('Unerwarteter Fehler beim Laden der Rangliste:', err);
    return [];
  }
}

export async function submitScore(userId, points, difficulty = 'mittel', { offline = false } = {}) {
  const safeUserId =
    typeof userId === 'string' ? userId.trim() : userId ? String(userId) : '';

  if (!safeUserId) {
    console.warn('Kein angemeldeter Nutzer fuer Score-Speicherung vorhanden.');
    return { ok: false, error: new Error('Kein Nutzer angemeldet.') };
  }

  if (safeUserId === 'guest') {
    return { ok: false, error: new Error('Gaeste koennen keine Scores speichern.') };
  }

  const sanitizedPoints = sanitizePoints(points);
  const sanitizedDifficulty =
    typeof difficulty === 'string' && difficulty.trim()
      ? difficulty.trim().toLowerCase()
      : 'mittel';

  if (offline) {
    return queueScore(safeUserId, sanitizedPoints, sanitizedDifficulty);
  }
  try {
    const { data, error } = await runSupabaseRequest(
      () =>
        supabase.rpc('submit_score', {
          p_user_id: safeUserId,
          p_points: sanitizedPoints,
          p_difficulty: sanitizedDifficulty,
        }),
      { label: 'quizService.submitScore' }
    );

    if (error) {
      console.warn('Fehler beim Speichern des Scores:', error.message);
      return { ok: false, error };
    }

    return { ok: true, data };
  } catch (err) {
    console.error('Unerwarteter Fehler beim Speichern des Scores:', err);
    return { ok: false, error: err };
  }
}
