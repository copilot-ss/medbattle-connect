import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabaseClient';
import OFFLINE_SEED_QUESTIONS from '../data/offlineSeedQuestions';
import { runSupabaseRequest } from './supabaseRequest';

const LEADERBOARD_CACHE_TTL = 30 * 1000;
const leaderboardCache = {
  data: null,
  fetchedAt: 0,
};
const CATEGORY_CACHE_TTL = 5 * 60 * 1000;
const CATEGORY_STORAGE_TTL = 7 * 24 * 60 * 60 * 1000;
const CATEGORIES_STORAGE_KEY = 'medbattle_categories_cache';
const categoriesCache = {
  data: null,
  fetchedAt: 0,
};
const QUESTIONS_CACHE_TTL = 20 * 1000;
const questionsCache = new Map();
const QUESTIONS_STORAGE_PREFIX = 'medbattle_questions_cache';
const MAX_CACHED_QUESTIONS = 200;
const QUESTION_CACHE_SYNC_TTL = 6 * 60 * 60 * 1000;
const DEFAULT_LANGUAGE = 'de';
const questionCacheSyncTimes = new Map();
const BASE_MATCH_POINTS = 12;
const COIN_COMPLETION_BONUS = 1;
const COIN_PERFECT_BONUS = 2;
const COIN_MULTIPLAYER_BONUS = 1;
const PENDING_SCORES_KEY = 'medbattle_pending_scores';
const MAX_PENDING_SCORES = 50;
const DIFFICULTY_MULTIPLIERS = {
  leicht: 0.8,
  mittel: 1,
  schwer: 1.25,
};

function normalizeCategoryList(source) {
  const entries = Array.isArray(source) ? source : [];
  const deduped = new Map();

  entries.forEach((entry) => {
    const raw =
      typeof entry === 'string'
        ? entry
        : typeof entry?.category === 'string'
        ? entry.category
        : typeof entry?.name === 'string'
        ? entry.name
        : null;
    const value = typeof raw === 'string' ? raw.trim() : '';
    if (!value) {
      return;
    }
    const key = value.toLowerCase();
    if (!deduped.has(key)) {
      deduped.set(key, value);
    }
  });

  return Array.from(deduped.values()).sort((a, b) => a.localeCompare(b));
}

async function loadCachedCategories() {
  try {
    const raw = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    const categories = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.categories)
      ? parsed.categories
      : [];
    const savedAt = Date.parse(parsed?.savedAt ?? '');
    if (
      Number.isFinite(savedAt) &&
      Date.now() - savedAt > CATEGORY_STORAGE_TTL
    ) {
      return [];
    }
    return normalizeCategoryList(categories);
  } catch (err) {
    console.warn('Konnte Kategorien-Cache nicht lesen:', err);
    return [];
  }
}

async function saveCachedCategories(categories) {
  try {
    const payload = {
      savedAt: new Date().toISOString(),
      categories: normalizeCategoryList(categories),
    };
    await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('Konnte Kategorien-Cache nicht speichern:', err);
  }
}

function normalizeDifficulty(value) {
  return ['leicht', 'mittel', 'schwer'].includes(value)
    ? value
    : 'mittel';
}

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

function shouldFallbackToLegacyGetQuestions(error) {
  if (!error) {
    return false;
  }
  const message = String(error.message || '').toLowerCase();
  if (!message.includes('get_questions')) {
    return false;
  }
  return message.includes('schema cache') || message.includes('does not exist');
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

function buildQuestionsStorageKey({ difficulty, category, language }) {
  const normalizedLanguage = normalizeLanguage(language);
  return `${QUESTIONS_STORAGE_PREFIX}:${normalizedLanguage}:${difficulty}:${category ?? 'all'}`;
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

function buildOfflineSeedQuestions(difficulty, limit, category, language) {
  const normalizedLanguage = normalizeLanguage(language);
  const pool = OFFLINE_SEED_QUESTIONS.filter(
    (question) =>
      question?.difficulty === difficulty &&
      (!category || question?.category === category) &&
      normalizeLanguage(question?.language ?? DEFAULT_LANGUAGE) === normalizedLanguage
  );
  const fallbackByCategory =
    category
      ? OFFLINE_SEED_QUESTIONS.filter(
          (question) =>
            question?.category === category &&
            normalizeLanguage(question?.language ?? DEFAULT_LANGUAGE) === normalizedLanguage
        )
      : [];
  if (category) {
    if (pool.length) {
      const shuffled = shuffleList(pool);
      return shuffled.slice(0, limit);
    }
    if (fallbackByCategory.length) {
      const shuffled = shuffleList(fallbackByCategory);
      return shuffled.slice(0, limit);
    }
    return [];
  }
  const languagePool = OFFLINE_SEED_QUESTIONS.filter(
    (question) =>
      normalizeLanguage(question?.language ?? DEFAULT_LANGUAGE) === normalizedLanguage
  );
  const source = pool.length ? pool : languagePool;
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

function buildQuestionsCacheKey({ difficulty, limit, category, language }) {
  const normalizedLanguage = normalizeLanguage(language);
  return `${normalizedLanguage}:${difficulty}:${limit}:${category ?? 'all'}`;
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
  { force = false, offline = false, language, fallbackLanguage } = {}
) {
  const normalizedDifficulty = normalizeDifficulty(difficulty);
  const normalizedLanguage = normalizeLanguage(language);
  const normalizedFallbackLanguage =
    fallbackLanguage === undefined
      ? normalizedLanguage === DEFAULT_LANGUAGE
        ? DEFAULT_LANGUAGE
        : null
      : normalizeLanguageOrNull(fallbackLanguage);
  const normalizedLimit =
    Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 6;
  const normalizedCategory =
    typeof category === 'string' && category.trim() ? category.trim() : null;
  const cacheKey = buildQuestionsCacheKey({
    difficulty: normalizedDifficulty,
    limit: normalizedLimit,
    category: normalizedCategory,
    language: normalizedLanguage,
  });
  const storageKey = buildQuestionsStorageKey({
    difficulty: normalizedDifficulty,
    category: normalizedCategory,
    language: normalizedLanguage,
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
      buildOfflineSeedQuestions(
        normalizedDifficulty,
        normalizedLimit,
        normalizedCategory,
        normalizedLanguage
      ),
      normalizedDifficulty
    );
    return cloneQuestions(offlineQuestions);
  }

  try {
    const rpcPayload = {
      p_difficulty: normalizedDifficulty,
      p_limit: normalizedLimit,
      p_category: normalizedCategory,
      p_language: normalizedLanguage,
      p_fallback_language: normalizedFallbackLanguage,
    };
    let { data, error } = await runSupabaseRequest(
      () =>
        supabase.rpc('get_questions', rpcPayload),
      { label: 'quizService.getQuestions' }
    );

    if (error && shouldFallbackToLegacyGetQuestions(error)) {
      const legacyPayload = {
        p_difficulty: normalizedDifficulty,
        p_limit: normalizedLimit,
        p_category: normalizedCategory,
      };
      const legacyResponse = await runSupabaseRequest(
        () => supabase.rpc('get_questions', legacyPayload),
        { label: 'quizService.getQuestions.legacy' }
      );
      if (!legacyResponse.error) {
        data = legacyResponse.data;
        error = null;
      }
    }

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
      console.warn('Keine Fragen in Supabase gefunden für Schwierigkeitsgrad:', normalizedDifficulty);
      const cached = await resolveCachedQuestions();
      if (cached.length) {
        return cached;
      }
      return [];
    }

    const normalized = normalizeQuestionList(rows, normalizedDifficulty);

    if (!normalized.length) {
      console.warn('Fragen ohne gültige Antwortoptionen gefunden.');
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

export async function fetchCategories({
  force = false,
  offline = false,
  limit = 40,
} = {}) {
  const now = Date.now();
  const normalizedLimit =
    Number.isFinite(limit) && limit > 0 ? Math.min(limit, 200) : 40;

  if (!force && categoriesCache.data && now - categoriesCache.fetchedAt < CATEGORY_CACHE_TTL) {
    return { ok: true, categories: [...categoriesCache.data] };
  }

  const cachedCategories = await loadCachedCategories();
  if (offline) {
    return cachedCategories.length
      ? { ok: true, categories: cachedCategories, cached: true }
      : { ok: false, categories: [], error: new Error('Offline') };
  }

  const loadFallback = async () => {
    try {
      const { data, error } = await runSupabaseRequest(
        () =>
          supabase
            .from('questions')
            .select('category')
            .not('category', 'is', null)
            .order('category', { ascending: true })
            .limit(normalizedLimit),
        { label: 'quizService.getCategories.fallback' }
      );
      if (error) {
        throw error;
      }
      return normalizeCategoryList(data);
    } catch (err) {
      console.warn('Konnte Kategorien-Fallback nicht laden:', err?.message ?? err);
      return [];
    }
  };

  try {
    const { data, error } = await runSupabaseRequest(
      () =>
        supabase.rpc('get_categories', {
          p_limit: normalizedLimit,
        }),
      { label: 'quizService.getCategories' }
    );

    if (error) {
      throw error;
    }

    const normalized = normalizeCategoryList(data);
    if (!normalized.length) {
      const fallback = await loadFallback();
      if (fallback.length) {
        categoriesCache.data = fallback;
        categoriesCache.fetchedAt = now;
        saveCachedCategories(fallback).catch(() => {});
        return { ok: true, categories: [...fallback], fallback: true };
      }

      if (cachedCategories.length) {
        return { ok: true, categories: cachedCategories, cached: true };
      }

      return { ok: false, categories: [], error: new Error('Keine Kategorien gefunden.') };
    }

    categoriesCache.data = normalized;
    categoriesCache.fetchedAt = now;
    saveCachedCategories(normalized).catch(() => {});
    return { ok: true, categories: [...normalized] };
  } catch (err) {
    console.warn('Fehler beim Laden der Kategorien:', err?.message ?? err);
    const fallback = await loadFallback();
    if (fallback.length) {
      categoriesCache.data = fallback;
      categoriesCache.fetchedAt = now;
      saveCachedCategories(fallback).catch(() => {});
      return { ok: true, categories: [...fallback], fallback: true };
    }
    if (cachedCategories.length) {
      return { ok: true, categories: cachedCategories, cached: true };
    }
    return { ok: false, categories: [], error: err };
  }
}

export async function syncQuestionCache({ force = false, limit = 16, language } = {}) {
  const normalizedLanguage = normalizeLanguage(language);
  const now = Date.now();
  const lastSyncAt = questionCacheSyncTimes.get(normalizedLanguage) ?? 0;
  if (!force && lastSyncAt && now - lastSyncAt < QUESTION_CACHE_SYNC_TTL) {
    return { ok: true, skipped: true };
  }

  const normalizedLimit =
    Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 16;
  const difficulties = ['leicht', 'mittel', 'schwer'];
  const results = [];

  for (const difficulty of difficulties) {
    const questions = await fetchQuestions(difficulty, normalizedLimit, null, {
      force: true,
      language: normalizedLanguage,
    });
    results.push({
      difficulty,
      count: Array.isArray(questions) ? questions.length : 0,
    });
  }

  if (results.some((result) => result.count > 0)) {
    questionCacheSyncTimes.set(normalizedLanguage, now);
  }

  return { ok: true, results, language: normalizedLanguage };
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

export function calculateCoinReward({
  correct = 0,
  total = 0,
  difficulty = 'mittel',
  isMultiplayer = false,
} = {}) {
  const safeTotal = Math.max(0, Number.isFinite(total) ? total : 0);
  const safeCorrect = Math.max(0, Number.isFinite(correct) ? correct : 0);
  const normalizedDifficulty = normalizeDifficulty(difficulty);
  const multiplier = DIFFICULTY_MULTIPLIERS[normalizedDifficulty] ?? 1;
  const completionBonus = safeTotal > 0 ? COIN_COMPLETION_BONUS : 0;
  const perfectBonus =
    safeTotal > 0 && safeCorrect >= safeTotal ? COIN_PERFECT_BONUS : 0;
  const multiplayerBonus = isMultiplayer ? COIN_MULTIPLAYER_BONUS : 0;
  const rawCoins =
    (Math.min(safeCorrect, safeTotal) +
      completionBonus +
      perfectBonus +
      multiplayerBonus) *
    multiplier;

  return Math.max(1, Math.round(rawCoins));
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
      avatarUrl: item.avatar_url ?? item.avatarUrl ?? null,
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
    console.warn('Kein angemeldeter Nutzer für Score-Speicherung vorhanden.');
    return { ok: false, error: new Error('Kein Nutzer angemeldet.') };
  }

  if (safeUserId === 'guest') {
    return { ok: false, error: new Error('Gäste können keine Scores speichern.') };
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
