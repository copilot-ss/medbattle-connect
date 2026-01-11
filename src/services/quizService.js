import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabaseClient';
import CAMPAIGN_QUESTIONS from '../data/campaignQuestions';

const LEADERBOARD_CACHE_TTL = 30 * 1000;
const leaderboardCache = {
  data: null,
  fetchedAt: 0,
};
const QUESTIONS_CACHE_TTL = 20 * 1000;
const questionsCache = new Map();
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

function buildOfflineQuestions(difficulty, limit) {
  const pool = CAMPAIGN_QUESTIONS.filter(
    (question) => question?.difficulty === difficulty
  );
  const source = pool.length ? pool : CAMPAIGN_QUESTIONS;
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
      const { error } = await supabase.rpc('submit_score', {
        p_user_id: userId,
        p_points: sanitizePoints(entry?.points),
        p_difficulty: normalizeDifficulty(entry?.difficulty),
      });
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
  const now = Date.now();

  if (!force && !offline) {
    const cached = questionsCache.get(cacheKey);
    if (cached && now - cached.fetchedAt < QUESTIONS_CACHE_TTL) {
      return cloneQuestions(cached.data);
    }
  }

  if (offline) {
    const offlineQuestions = buildOfflineQuestions(
      normalizedDifficulty,
      normalizedLimit
    ).map((question) => ({
      ...question,
      difficulty: question.difficulty ?? normalizedDifficulty,
      options: normalizeOptions(question.options, question.correct_answer),
    }));
    return cloneQuestions(offlineQuestions);
  }

  try {
    const { data, error } = await supabase.rpc('get_questions', {
      p_difficulty: normalizedDifficulty,
      p_limit: normalizedLimit,
      p_category: normalizedCategory,
    });

    if (error) {
      console.warn('Fehler beim Laden der Fragen:', error.message);
      return [];
    }

    const rows = Array.isArray(data) ? data : [];

    if (!rows.length) {
      console.warn('Keine Fragen in Supabase gefunden fuer Schwierigkeitsgrad:', normalizedDifficulty);
      return [];
    }

    const normalized = rows
      .map((question) => {
        return {
          ...question,
          difficulty: question.difficulty ?? normalizedDifficulty,
          options: normalizeOptions(question.options, question.correct_answer),
        };
      })
      .filter(
        (question) =>
          question.question &&
          question.correct_answer &&
          Array.isArray(question.options) &&
          question.options.length >= 2
      );

    if (!normalized.length) {
      console.warn('Fragen ohne gueltige Antwortoptionen gefunden.');
      return [];
    }

    questionsCache.set(cacheKey, { data: normalized, fetchedAt: now });
    return cloneQuestions(normalized);
  } catch (err) {
    console.error('Unerwarteter Fehler beim Laden der Fragen:', err);
    return [];
  }
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
    const { data, error } = await supabase.rpc('get_leaderboard', {
      p_limit: limit,
    });

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
    const { data, error } = await supabase.rpc('submit_score', {
      p_user_id: safeUserId,
      p_points: sanitizedPoints,
      p_difficulty: sanitizedDifficulty,
    });

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
