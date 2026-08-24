import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabaseClient';
import OFFLINE_SEED_QUESTIONS from '../data/offlineSeedQuestions';
import { runSupabaseRequest } from './supabaseRequest';
import { getBoostPointPenalty, sanitizeBoostUsage } from '../utils/quizBoosts';
import {
  DEFAULT_LANGUAGE,
  normalizeLanguage,
  normalizeLanguageOrNull,
  resolveFallbackLanguage,
} from '../utils/language';

const LEADERBOARD_CACHE_TTL = 30 * 1000;
const leaderboardCache = {
  data: null,
  fetchedAt: 0,
};

function invalidateLeaderboardCache() {
  leaderboardCache.data = null;
  leaderboardCache.fetchedAt = 0;
}

const QUESTIONS_CACHE_TTL = 20 * 1000;
const questionsCache = new Map();
const inFlightQuestionPoolRequests = new Map();
const QUESTIONS_STORAGE_PREFIX = 'medbattle_questions_cache';
const cachedQuestionStorage = new Map();
const MAX_CACHED_QUESTIONS = 200;
const QUESTION_CACHE_SYNC_TTL = 6 * 60 * 60 * 1000;
const RECENT_QUESTION_IDS_STORAGE_PREFIX = 'medbattle_recent_question_ids';
const MAX_RECENT_QUESTION_IDS = 72;
const MIN_SERVER_QUESTION_POOL = 18;
const BLOCKED_CATEGORY_KEYS = new Set(['fussball', 'football']);
const MEDICAL_CATEGORY_KEYS = new Set([
  'anatomie',
  'physiologie',
  'pathologie',
  'pharmakologie',
  'mikrobiologie',
  'biochemie',
  'immunologie',
  'genetik',
  'radiologie',
  'chirurgie',
  'medizin',
  'medicine',
]);
const questionCacheSyncTimes = new Map();
const recentQuestionIdsCache = new Map();
const POINTS_PER_CORRECT_ANSWER = 3;
const COIN_COMPLETION_BONUS = 1;
const COIN_PERFECT_BONUS = 2;
const COIN_MULTIPLAYER_BONUS = 1;
const PENDING_SCORES_KEY = 'medbattle_pending_scores';
const MAX_PENDING_SCORES = 50;
const AUTOGEN_TEXT_PATTERNS = [
  'auto-generated',
  'autogen',
  'wissenscheck',
  'ausgleichsfrage',
  'to ensure at least',
  'to complete 50 questions',
];
const QUESTION_POOL_KEY = 'all-v6';

function normalizeCategoryKey(value) {
  if (typeof value !== 'string') {
    return '';
  }
  return value
    .trim()
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function isBlockedCategory(value) {
  return BLOCKED_CATEGORY_KEYS.has(normalizeCategoryKey(value));
}

function isMedicineCategory(value) {
  const normalized = normalizeCategoryKey(value);
  return normalized === 'medizin' || normalized === 'medicine';
}

function isMedicalQuestionCategory(value) {
  return MEDICAL_CATEGORY_KEYS.has(normalizeCategoryKey(value));
}

function sanitizeAvatarUrl(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : null;
}

function sanitizeAvatarIcon(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  return /^[a-z0-9-]+$/i.test(trimmed) ? trimmed : null;
}

function sanitizeAvatarColor(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (/^#[0-9a-f]{3,8}$/i.test(trimmed)) {
    return trimmed;
  }
  if (/^rgba?\([^)]+\)$/i.test(trimmed)) {
    return trimmed;
  }
  return null;
}

function sanitizeLeaderboardNumber(value, fallback = 0) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function fetchLeaderboardRowsFromUsers(requestedLimit) {
  const { data, error } = await runSupabaseRequest(
    () =>
      supabase
        .from('users')
        .select('id, username, xp, leaderboard_points, created_at')
        .gt('leaderboard_points', 0)
        .order('leaderboard_points', { ascending: false })
        .order('created_at', { ascending: true })
        .order('id', { ascending: true })
        .limit(requestedLimit),
    {
      label: 'quizService.getLeaderboardUsersFallback',
      profile: 'ui',
      dedupeKey: `users:${requestedLimit}`,
    }
  );

  if (error) {
    throw error;
  }

  return Array.isArray(data) ? data : [];
}

function inferExplanationLanguage(question) {
  const explicitLanguage = normalizeLanguageOrNull(
    question?.language ?? question?.translation_language
  );
  if (explicitLanguage === 'de' || explicitLanguage === 'en') {
    return explicitLanguage;
  }

  const prompt =
    typeof question?.question === 'string' ? question.question.trim().toLowerCase() : '';
  return /^(which|what|how|when|where|who)\b/.test(prompt) ? 'en' : 'de';
}

function buildFallbackQuestionExplanation(question) {
  const prompt =
    typeof question?.question === 'string' ? question.question.trim().toLowerCase() : '';
  const correctAnswer =
    typeof question?.correct_answer === 'string' ? question.correct_answer.trim() : '';
  const language = inferExplanationLanguage(question);
  const answer = correctAnswer || (language === 'en' ? 'this option' : 'diese Option');

  if (language === 'en') {
    if (!correctAnswer) {
      return 'Focus on the core medical association in the stem and note which organ, mechanism, pathogen, mutation, or test is actually being asked for.';
    }
    if (/^(which|what) nerve\b/.test(prompt)) {
      return `${answer} fits because this nerve classically supplies the structure, region, or reflex component named in the stem.`;
    }
    if (/^(which|what) artery\b/.test(prompt)) {
      return `${answer} fits because this artery classically supplies the region or organ asked about in the question.`;
    }
    if (/^(which|what) (pathogen|bacterium|fungus|virus|parasite)\b/.test(prompt)) {
      return `${answer} fits because it is the classic pathogen or parasite linked to the disease or finding named in the stem.`;
    }
    if (/^(which|what) (medicine|medication|active ingredient|antidote|anticoagulant)\b/.test(prompt)) {
      return `${answer} fits because it is the standard drug, active ingredient, or antidote for the clinical situation described here.`;
    }
    if (/^(which|what) (gene|mutation|genetic|translocation|karyotype|repeat)\b/.test(prompt)) {
      return `${answer} fits because it is the classic gene, mutation, or chromosomal change associated with the disease in the stem.`;
    }
    if (/^(which|what) (hormone|vitamin|mineral|ion|electrolyte|enzyme|receptor)\b/.test(prompt)) {
      return `${answer} fits because it is the key regulator or molecular factor for the biologic function being tested.`;
    }
    if (/^(which|what) (test|diagnostic|imaging|study|examination)\b/.test(prompt)) {
      return `${answer} fits because it is the standard test or imaging method for the problem named in the stem.`;
    }
    if (/^(which|what) (cells|cell|kind of cell)\b/.test(prompt)) {
      return `${answer} fits because these are the cells that carry out the immune, histologic, or pathophysiologic role asked about here.`;
    }
    if (/^(which|what) (organ|sense organ|structure|muscle|bone|vein|vessel)\b/.test(prompt)) {
      return `${answer} fits because it is the anatomic structure or organ with the function or location described in the stem.`;
    }
    return `The key fact is that ${answer} is the option most classically associated with the medical fact tested in the stem.`;
  }

  if (!correctAnswer) {
    return 'Achte auf die medizinische Kernassoziation im Fragetext und darauf, welches Organ, welcher Mechanismus, Erreger, Test oder welche Mutation wirklich abgefragt wird.';
  }
  if (/^welcher nerv\b/.test(prompt)) {
    return `${answer} passt, weil dieser Nerv die im Fragetext genannte Struktur, Region oder Reflexfunktion klassisch versorgt.`;
  }
  if (/^welche arterie\b/.test(prompt)) {
    return `${answer} passt, weil diese Arterie das in der Frage genannte Gebiet oder Organ klassisch versorgt.`;
  }
  if (/^(welcher erreger|welches bakterium|welcher pilz|welches virus|welcher parasit)\b/.test(prompt)) {
    return `${answer} passt, weil dieser Erreger oder Parasit klassisch mit dem genannten Krankheitsbild oder Befund verbunden ist.`;
  }
  if (/^(welches medikament|welcher wirkstoff|welches antidot|welches antikoagulans)\b/.test(prompt)) {
    return `${answer} passt, weil dieser Wirkstoff oder dieses Antidot für die beschriebene klinische Situation als Standard gilt.`;
  }
  if (/^(welches gen|welche mutation|welche genetische|welche translokation|welcher karyotyp|welche chromosomen|welche repeat)\b/.test(prompt)) {
    return `${answer} passt, weil dies die klassische genetische Veränderung hinter dem genannten Krankheitsbild ist.`;
  }
  if (/^(welches hormon|welches vitamin|welches mineral|welches ion|welcher elektrolyt|welches enzym|welcher rezeptor)\b/.test(prompt)) {
    return `${answer} passt, weil dieser Faktor die im Fragetext angesprochene biologische Funktion oder Regulation entscheidend bestimmt.`;
  }
  if (/^(welcher test|welche diagnostik|welche bildgebung|welche untersuchung)\b/.test(prompt)) {
    return `${answer} passt, weil dieses Verfahren das Standardvorgehen für das diagnostische Problem im Fragetext ist.`;
  }
  if (/^(welche zellen|welche zellart|welcher zelltyp)\b/.test(prompt)) {
    return `${answer} passt, weil diese Zellen die abgefragte immunologische, histologische oder pathophysiologische Rolle übernehmen.`;
  }
  if (/^(welches organ|welches sinnesorgan|welche struktur|welcher muskel|welcher knochen|welche vene|welches gefaess)\b/.test(prompt)) {
    return `${answer} passt, weil diese Struktur oder dieses Organ genau die im Fragetext beschriebene Lage oder Funktion hat.`;
  }
  return `Entscheidend ist, dass ${answer} die Antwort ist, die klassisch mit dem im Fragetext getesteten medizinischen Sachverhalt verbunden ist.`;
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

async function submitScoreRpc(userId, points, label = 'quizService.submitScore') {
  return runSupabaseRequest(
    () =>
      supabase.rpc('submit_score', {
        p_user_id: userId,
        p_points: sanitizePoints(points),
      }),
    { label }
  );
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
  return unique;
}

function ensureQuestionExplanation(question) {
  if (!question || typeof question !== 'object') {
    return '';
  }

  const explanation =
    typeof question.explanation === 'string' ? question.explanation.trim() : '';
  if (explanation) {
    return explanation;
  }
  return buildFallbackQuestionExplanation(question);
}

function shuffleList(list) {
  const copy = Array.isArray(list) ? [...list] : [];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalizeOptionLabel(value) {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
}

function questionHasOptionLengthBias(question) {
  if (!question || typeof question !== 'object') {
    return false;
  }

  const correctAnswer = normalizeOptionLabel(question.correct_answer);
  const options = Array.isArray(question.options)
    ? question.options.map(normalizeOptionLabel).filter(Boolean)
    : [];

  if (!correctAnswer || options.length < 2) {
    return false;
  }

  const optionLengths = options.map((option) => option.length);
  const maxLength = Math.max(...optionLengths, 0);
  const minLength = Math.min(...optionLengths, maxLength);
  const correctLength = correctAnswer.length;
  const maxLengthCount = optionLengths.filter((value) => value === maxLength).length;

  return (
    correctLength === maxLength &&
    maxLengthCount === 1 &&
    maxLength - minLength >= 8
  );
}

function questionKey(question) {
  if (!question) {
    return '';
  }
  const text =
    typeof question.question === 'string' ? question.question.trim().toLowerCase() : '';
  const category =
    typeof question.category === 'string' ? question.category.trim().toLowerCase() : '';
  return `${text}|${category}`;
}

function isAutogeneratedQuestion(question) {
  if (!question) {
    return false;
  }

  const textBlock = [
    question.slug,
    question.question,
    question.explanation,
  ]
    .filter((value) => typeof value === 'string' && value.trim())
    .join(' ')
    .toLowerCase();

  if (AUTOGEN_TEXT_PATTERNS.some((pattern) => textBlock.includes(pattern))) {
    return true;
  }

  const options = Array.isArray(question.options) ? question.options : [];
  const normalizedOptions = options.map((option) =>
    typeof option === 'string' ? option.trim().toLowerCase() : ''
  );
  const isPlaceholderOptionSet =
    normalizedOptions.length === 4 &&
    normalizedOptions.join('|') === 'a|b|c|d';
  const isPlaceholderAnswer =
    typeof question.correct_answer === 'string' &&
    question.correct_answer.trim().toLowerCase() === 'a';

  return isPlaceholderOptionSet && isPlaceholderAnswer;
}

function mergeQuestionPools(primary, fallback, limit) {
  const merged = [];
  const seen = new Set();
  const maxItems = Number.isFinite(limit) ? Math.max(1, limit) : 6;

  const push = (question) => {
    if (!question || merged.length >= maxItems) {
      return;
    }
    const key = questionKey(question);
    if (!key || seen.has(key)) {
      return;
    }
    seen.add(key);
    merged.push(question);
  };

  (Array.isArray(primary) ? primary : []).forEach(push);
  (Array.isArray(fallback) ? fallback : []).forEach(push);
  return merged.slice(0, maxItems);
}

function sanitizeCompletionAnswers(answers) {
  return (Array.isArray(answers) ? answers : []).map((answer) => ({
    questionId:
      typeof answer?.questionId === 'string' ? answer.questionId.trim() : '',
    selectedOption:
      typeof answer?.selectedOption === 'string' ? answer.selectedOption : null,
    timedOut: answer?.timedOut === true,
    boostsUsed: sanitizeBoostUsage(answer?.boostsUsed),
  }));
}

export async function completeQuiz({ completionKey, answers, matchId = null } = {}) {
  const normalizedKey =
    typeof completionKey === 'string' ? completionKey.trim() : '';
  if (!normalizedKey) {
    return { ok: false, error: new Error('Completion-ID fehlt.') };
  }

  try {
    const { data, error } = await runSupabaseRequest(
      () =>
        supabase.rpc('complete_quiz', {
          p_completion_key: normalizedKey,
          p_answers: matchId ? [] : sanitizeCompletionAnswers(answers),
          p_match_id: matchId || null,
        }),
      { label: 'quizService.completeQuiz' }
    );

    if (error) {
      throw error;
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      throw new Error('Quiz-Abschluss hat keine Serverantwort geliefert.');
    }

    invalidateLeaderboardCache();
    return {
      ok: true,
      alreadyProcessed: row.already_processed === true,
      correct: sanitizePoints(row.correct_count),
      total: sanitizePoints(row.question_count),
      points: sanitizePoints(row.points),
      xp: sanitizePoints(row.xp),
      coins: sanitizePoints(row.coins),
    };
  } catch (error) {
    return { ok: false, error };
  }
}

function normalizeQuestionImageUrl(question) {
  if (!question) {
    return null;
  }
  const rawUrl =
    typeof question.image_url === 'string'
      ? question.image_url
      : typeof question.imageUrl === 'string'
      ? question.imageUrl
      : '';
  const trimmed = rawUrl.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : null;
}

function normalizeQuestionImageAlt(question) {
  if (!question) {
    return null;
  }
  const rawAlt =
    typeof question.image_alt === 'string'
      ? question.image_alt
      : typeof question.imageAlt === 'string'
      ? question.imageAlt
      : '';
  const trimmed = rawAlt.trim();
  return trimmed || null;
}

function normalizeQuestionList(rows) {
  const source = Array.isArray(rows) ? rows : [];
  return source
    .map((question) => {
      if (!question) {
        return null;
      }
      return {
        ...question,
        explanation: ensureQuestionExplanation(question),
        image_url: normalizeQuestionImageUrl(question),
        image_alt: normalizeQuestionImageAlt(question),
        options: normalizeOptions(question.options, question.correct_answer),
      };
    })
    .filter(
      (question) =>
        question &&
        !isAutogeneratedQuestion(question) &&
        !isBlockedCategory(question.category) &&
        question.question &&
        question.correct_answer &&
        Array.isArray(question.options) &&
        question.options.length >= 2
    );
}

function buildQuestionsStorageKey({ category, language }) {
  const normalizedLanguage = normalizeLanguage(language);
  return `${QUESTIONS_STORAGE_PREFIX}:${normalizedLanguage}:${QUESTION_POOL_KEY}:${category ?? 'all'}`;
}

function buildRecentQuestionsStorageKey({ category, language }) {
  const normalizedLanguage = normalizeLanguage(language);
  return `${RECENT_QUESTION_IDS_STORAGE_PREFIX}:${normalizedLanguage}:${category ?? QUESTION_POOL_KEY}`;
}

function buildQuestionRequestKey({ limit, category, language, fallbackLanguage }) {
  const normalizedLanguage = normalizeLanguage(language);
  const normalizedFallbackLanguage = normalizeLanguageOrNull(fallbackLanguage);
  const normalizedLimit =
    Number.isFinite(limit) && limit > 0 ? Math.max(1, Math.floor(limit)) : 6;

  return [
    normalizedLanguage,
    normalizedFallbackLanguage ?? 'none',
    category ?? QUESTION_POOL_KEY,
    normalizedLimit,
  ].join(':');
}

function cloneStoredQuestionEntries(list) {
  if (!Array.isArray(list)) {
    return [];
  }

  return list.map((entry) => {
    if (!entry || typeof entry !== 'object') {
      return entry;
    }

    return {
      ...entry,
      options: Array.isArray(entry.options) ? [...entry.options] : entry.options,
    };
  });
}

async function loadCachedQuestions(storageKey) {
  if (cachedQuestionStorage.has(storageKey)) {
    return cloneStoredQuestionEntries(cachedQuestionStorage.get(storageKey));
  }

  try {
    const raw = await AsyncStorage.getItem(storageKey);
    if (!raw) {
      cachedQuestionStorage.set(storageKey, []);
      return [];
    }
    const parsed = JSON.parse(raw);
    const questions = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.questions)
      ? parsed.questions
      : [];
    cachedQuestionStorage.set(storageKey, questions);
    return cloneStoredQuestionEntries(questions);
  } catch (err) {
    console.warn('Konnte lokale Fragen nicht lesen:', err);
    cachedQuestionStorage.set(storageKey, []);
    return [];
  }
}

async function saveCachedQuestions(storageKey, questions) {
  try {
    const trimmed = Array.isArray(questions)
      ? questions.slice(-MAX_CACHED_QUESTIONS)
      : [];
    cachedQuestionStorage.set(storageKey, trimmed);
    const payload = {
      savedAt: new Date().toISOString(),
      questions: trimmed,
    };
    await AsyncStorage.setItem(storageKey, JSON.stringify(payload));
  } catch (err) {
    console.warn('Konnte lokale Fragen nicht speichern:', err);
  }
}

async function loadRecentQuestionIds(storageKey) {
  const cached = recentQuestionIdsCache.get(storageKey);
  if (Array.isArray(cached)) {
    return [...cached];
  }

  try {
    const raw = await AsyncStorage.getItem(storageKey);
    if (!raw) {
      recentQuestionIdsCache.set(storageKey, []);
      return [];
    }
    const parsed = JSON.parse(raw);
    const normalized = Array.isArray(parsed)
      ? parsed.filter((value) => typeof value === 'string' && value.trim())
      : [];
    recentQuestionIdsCache.set(storageKey, normalized);
    return [...normalized];
  } catch (err) {
    console.warn('Konnte kuerzlich gespielte Fragen nicht lesen:', err);
    recentQuestionIdsCache.set(storageKey, []);
    return [];
  }
}

async function saveRecentQuestionIds(storageKey, ids) {
  try {
    const trimmed = Array.isArray(ids)
      ? ids.slice(-MAX_RECENT_QUESTION_IDS)
      : [];
    recentQuestionIdsCache.set(storageKey, [...trimmed]);
    await AsyncStorage.setItem(storageKey, JSON.stringify(trimmed));
  } catch (err) {
    console.warn('Konnte kuerzlich gespielte Fragen nicht speichern:', err);
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

function buildPreferredQuestionOrder(list, recentQuestionIds) {
  const recentSet =
    recentQuestionIds instanceof Set ? recentQuestionIds : new Set(recentQuestionIds ?? []);
  const freshPreferred = [];
  const freshBiased = [];
  const repeatedPreferred = [];
  const repeatedBiased = [];

  shuffleList(Array.isArray(list) ? list : []).forEach((question) => {
    const questionId =
      question?.id !== null && question?.id !== undefined ? String(question.id) : '';
    const target = questionId && recentSet.has(questionId)
      ? (questionHasOptionLengthBias(question) ? repeatedBiased : repeatedPreferred)
      : (questionHasOptionLengthBias(question) ? freshBiased : freshPreferred);

    if (questionId && recentSet.has(questionId)) {
      target.push(question);
      return;
    }
    target.push(question);
  });

  return [
    ...freshPreferred,
    ...repeatedPreferred,
    ...freshBiased,
    ...repeatedBiased,
  ];
}

function deriveQuestionPoolLimit(limit) {
  const normalizedLimit =
    Number.isFinite(limit) && limit > 0 ? Math.max(1, Math.floor(limit)) : 6;
  return Math.min(50, Math.max(normalizedLimit * 3, MIN_SERVER_QUESTION_POOL));
}

async function rememberRecentQuestionIds(storageKey, questions) {
  const existing = await loadRecentQuestionIds(storageKey);
  const nextIds = (Array.isArray(questions) ? questions : [])
    .map((question) =>
      question?.id !== null && question?.id !== undefined ? String(question.id) : null
    )
    .filter(Boolean);

  if (!nextIds.length) {
    return existing;
  }

  const merged = [...existing, ...nextIds];
  const seen = new Set();
  const deduped = [];

  for (let index = merged.length - 1; index >= 0; index -= 1) {
    const value = merged[index];
    if (!value || seen.has(value)) {
      continue;
    }
    seen.add(value);
    deduped.push(value);
  }

  deduped.reverse();
  await saveRecentQuestionIds(storageKey, deduped);
  return deduped;
}

function buildOfflineSeedQuestions(limit, category, language) {
  const normalizedLanguage = normalizeLanguage(language);
  const normalizedCategory =
    typeof category === 'string' && category.trim() ? category.trim() : null;
  const includeMedicalBundle = normalizedCategory
    ? isMedicineCategory(normalizedCategory)
    : false;
  if (normalizedCategory && isBlockedCategory(normalizedCategory)) {
    return [];
  }
  const languagePool = OFFLINE_SEED_QUESTIONS.filter(
    (question) =>
      !isBlockedCategory(question?.category) &&
      normalizeLanguage(question?.language ?? DEFAULT_LANGUAGE) === normalizedLanguage
  );

  const sameCategoryQuestions = normalizedCategory
    ? languagePool.filter((question) =>
        includeMedicalBundle
          ? isMedicalQuestionCategory(question?.category)
          : question?.category === normalizedCategory
      )
    : languagePool;

  if (normalizedCategory) {
    // Keep category quizzes category-pure even when the app is offline.
    return mergeQuestionPools(shuffleList(sameCategoryQuestions), [], limit);
  }

  return mergeQuestionPools(shuffleList(languagePool), [], limit);
}

function buildFeaturedOfflineQuestions(limit, category, language) {
  const normalizedLanguage = normalizeLanguage(language);
  const normalizedCategory =
    typeof category === 'string' && category.trim() ? category.trim() : null;
  const normalizedLimit =
    Number.isFinite(limit) && limit > 0 ? Math.max(1, Math.floor(limit)) : 0;
  if (normalizedLimit <= 0 || normalizeCategoryKey(normalizedCategory) !== 'brainrot') {
    return [];
  }

  return OFFLINE_SEED_QUESTIONS.filter(
    (question) =>
      normalizeCategoryKey(question?.category) === 'brainrot' &&
      normalizeLanguage(question?.language ?? DEFAULT_LANGUAGE) === normalizedLanguage &&
      normalizeQuestionImageUrl(question)
  );
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

export async function queueScore(userId, points) {
  if (!userId || userId === 'guest') {
    return { ok: false, reason: 'guest' };
  }

  const pending = await readPendingScores();
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId,
    points: sanitizePoints(points),
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
    return { ok: true, flushed: 0, hadPending: false, didWork: false };
  }

  const remaining = [];
  let flushed = 0;

  for (const entry of pending) {
    if (entry?.userId !== userId) {
      remaining.push(entry);
      continue;
    }

    try {
      const { error } = await submitScoreRpc(
        userId,
        entry?.points,
        'quizService.submitScore.flush'
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
  if (flushed > 0) {
    invalidateLeaderboardCache();
  }
  return {
    ok: true,
    flushed,
    remaining: remaining.length,
    hadPending: true,
    didWork: flushed > 0,
  };
}

function buildQuestionsCacheKey({ limit, category, language }) {
  const normalizedLanguage = normalizeLanguage(language);
  return `${normalizedLanguage}:${QUESTION_POOL_KEY}:${limit}:${category ?? 'all'}`;
}

function cacheQuestionsSnapshot({
  cacheKey,
  questions,
  fetchedAt = Date.now(),
  limit,
  category,
  language,
}) {
  questionsCache.set(cacheKey, {
    data: Array.isArray(questions) ? questions : [],
    fetchedAt,
    limit,
    category: category ?? null,
    language: normalizeLanguage(language),
  });
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

function findReusableQuestionsSnapshot({ limit, category, language }) {
  const normalizedLimit =
    Number.isFinite(limit) && limit > 0 ? Math.max(1, Math.floor(limit)) : 1;
  const normalizedCategory =
    typeof category === 'string' && category.trim() ? category.trim() : null;
  const normalizedLanguage = normalizeLanguage(language);
  let bestCandidate = null;

  questionsCache.forEach((entry) => {
    if (!entry || !Array.isArray(entry.data) || entry.data.length < normalizedLimit) {
      return;
    }
    if (normalizeLanguage(entry.language) !== normalizedLanguage) {
      return;
    }
    if ((entry.category ?? null) !== normalizedCategory) {
      return;
    }

    if (!bestCandidate) {
      bestCandidate = entry;
      return;
    }

    if (entry.fetchedAt > bestCandidate.fetchedAt) {
      bestCandidate = entry;
      return;
    }

    if (
      entry.fetchedAt === bestCandidate.fetchedAt &&
      entry.data.length < bestCandidate.data.length
    ) {
      bestCandidate = entry;
    }
  });

  if (!bestCandidate) {
    return [];
  }

  return cloneQuestions(bestCandidate.data.slice(0, normalizedLimit));
}

async function resolveWarmQuestionsSnapshot({
  cacheKey,
  storageKey,
  limit,
  category,
  language,
}) {
  const fromMemory = findReusableQuestionsSnapshot({
    limit,
    category,
    language,
  });
  if (fromMemory.length) {
    cacheQuestionsSnapshot({
      cacheKey,
      questions: fromMemory,
      limit,
      category,
      language,
    });
    return fromMemory;
  }

  const stored = await loadCachedQuestions(storageKey);
  const normalizedStored = normalizeQuestionList(stored);
  if (normalizedStored.length < limit) {
    return [];
  }

  const resolved = mergeQuestionPools(
    shuffleList(normalizedStored),
    [],
    limit
  );
  if (!resolved.length) {
    return [];
  }

  cacheQuestionsSnapshot({
    cacheKey,
    questions: resolved,
    limit,
    category,
    language,
  });
  return cloneQuestions(resolved);
}

async function fetchRemoteQuestionRows({
  questionPoolLimit,
  category,
  language,
  fallbackLanguage,
}) {
  const rpcPayload = {
    p_limit: questionPoolLimit,
    p_category: category,
    p_language: language,
    p_fallback_language: fallbackLanguage,
  };

  let { data, error } = await runSupabaseRequest(
    () => supabase.rpc('get_questions', rpcPayload),
    {
      label: 'quizService.getQuestions',
      profile: 'ui',
    }
  );

  if (error && shouldFallbackToLegacyGetQuestions(error)) {
    const legacyPayload = {
      p_limit: questionPoolLimit,
      p_category: category,
    };
    const legacyResponse = await runSupabaseRequest(
      () => supabase.rpc('get_questions', legacyPayload),
      {
        label: 'quizService.getQuestions.legacy',
        profile: 'ui',
      }
    );
    if (!legacyResponse.error) {
      data = legacyResponse.data;
      error = null;
    }
  }

  return {
    rows: Array.isArray(data) ? data : [],
    error,
  };
}

async function loadSharedRemoteQuestionRows({
  requestKey,
  useSharedRequest = true,
  questionPoolLimit,
  category,
  language,
  fallbackLanguage,
}) {
  const execute = () =>
    fetchRemoteQuestionRows({
      questionPoolLimit,
      category,
      language,
      fallbackLanguage,
    });

  if (!useSharedRequest) {
    return execute();
  }

  const existing = inFlightQuestionPoolRequests.get(requestKey);
  if (existing) {
    return existing;
  }

  let requestPromise = null;
  requestPromise = execute().finally(() => {
    if (inFlightQuestionPoolRequests.get(requestKey) === requestPromise) {
      inFlightQuestionPoolRequests.delete(requestKey);
    }
  });
  inFlightQuestionPoolRequests.set(requestKey, requestPromise);
  return requestPromise;
}

export async function fetchQuestions(
  limit = 6,
  category = null,
  { force = false, offline = false, language, fallbackLanguage } = {}
) {
  const normalizedLanguage = normalizeLanguage(language);
  const normalizedFallbackLanguage = resolveFallbackLanguage(
    normalizedLanguage,
    fallbackLanguage
  );
  const normalizedLimit =
    Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 6;
  const questionPoolLimit = deriveQuestionPoolLimit(normalizedLimit);
  const normalizedCategory =
    typeof category === 'string' && category.trim() ? category.trim() : null;
  if (normalizedCategory && isBlockedCategory(normalizedCategory)) {
    return [];
  }
  const cacheKey = buildQuestionsCacheKey({
    limit: normalizedLimit,
    category: normalizedCategory,
    language: normalizedLanguage,
  });
  const storageKey = buildQuestionsStorageKey({
    category: normalizedCategory,
    language: normalizedLanguage,
  });
  const recentQuestionsKey = buildRecentQuestionsStorageKey({
    category: normalizedCategory,
    language: normalizedLanguage,
  });
  const questionRequestKey = buildQuestionRequestKey({
    limit: questionPoolLimit,
    category: normalizedCategory,
    language: normalizedLanguage,
    fallbackLanguage: normalizedFallbackLanguage,
  });
  const recentQuestionIds = new Set(await loadRecentQuestionIds(recentQuestionsKey));
  const now = Date.now();

  const finalizeQuestions = (questions) => {
    const featured = buildPreferredQuestionOrder(
      normalizeQuestionList(
        buildFeaturedOfflineQuestions(normalizedLimit, normalizedCategory, normalizedLanguage)
      ),
      recentQuestionIds
    );
    const ordered = buildPreferredQuestionOrder(
      normalizeQuestionList(questions),
      recentQuestionIds
    );
    const resolved = mergeQuestionPools(featured, ordered, normalizedLimit);
    if (!resolved.length) {
      return [];
    }
    rememberRecentQuestionIds(recentQuestionsKey, resolved).catch((err) => {
      console.warn('Konnte kuerzlich gespielte Fragen nicht aktualisieren:', err);
    });
    return cloneQuestions(resolved);
  };

  if (!force && !offline) {
    const cached = questionsCache.get(cacheKey);
    if (cached && now - cached.fetchedAt < QUESTIONS_CACHE_TTL) {
      const delivered = finalizeQuestions(cached.data);
      if (delivered.length) {
        return delivered;
      }
    }

    const warmSnapshot = await resolveWarmQuestionsSnapshot({
      cacheKey,
      storageKey,
      limit: questionPoolLimit,
      category: normalizedCategory,
      language: normalizedLanguage,
    });
    if (warmSnapshot.length) {
      const delivered = finalizeQuestions(warmSnapshot);
      if (delivered.length) {
        return delivered;
      }
    }
  }

  const topUpWithOfflineSeeds = (baseQuestions, resultLimit = normalizedLimit) => {
    const featured = buildPreferredQuestionOrder(
      normalizeQuestionList(
        buildFeaturedOfflineQuestions(resultLimit, normalizedCategory, normalizedLanguage)
      ),
      recentQuestionIds
    );
    const primary = mergeQuestionPools(
      featured,
      buildPreferredQuestionOrder(normalizeQuestionList(baseQuestions), recentQuestionIds),
      resultLimit
    );
    if (primary.length >= resultLimit) {
      return primary.slice(0, resultLimit);
    }

    const seedPool = buildPreferredQuestionOrder(
      normalizeQuestionList(
        buildOfflineSeedQuestions(
          Math.max(resultLimit * 3, MIN_SERVER_QUESTION_POOL),
          normalizedCategory,
          normalizedLanguage
        )
      ),
      recentQuestionIds
    );

    return mergeQuestionPools(primary, seedPool, resultLimit);
  };

  const resolveCachedQuestions = async () => {
    const cached = await loadCachedQuestions(storageKey);
    const resolved = topUpWithOfflineSeeds(cached, questionPoolLimit);
    if (!resolved.length) {
      return [];
    }
    cacheQuestionsSnapshot({
      cacheKey,
      questions: resolved,
      limit: questionPoolLimit,
      category: normalizedCategory,
      language: normalizedLanguage,
    });
    return finalizeQuestions(resolved);
  };

  const resolveOfflineSeeds = () => {
    const offlineQuestions = topUpWithOfflineSeeds([], questionPoolLimit);
    if (!offlineQuestions.length) {
      return [];
    }
    cacheQuestionsSnapshot({
      cacheKey,
      questions: offlineQuestions,
      limit: questionPoolLimit,
      category: normalizedCategory,
      language: normalizedLanguage,
    });
    syncCachedQuestions(storageKey, offlineQuestions).catch((err) => {
      console.warn('Konnte Fragen-Cache nicht synchronisieren:', err);
    });
    return finalizeQuestions(offlineQuestions);
  };

  if (offline) {
    const cached = await resolveCachedQuestions();
    if (cached.length) {
      return cached;
    }
    return resolveOfflineSeeds();
  }

  try {
    const { rows, error } = await loadSharedRemoteQuestionRows({
      requestKey: questionRequestKey,
      useSharedRequest: !force,
      questionPoolLimit,
      category: normalizedCategory,
      language: normalizedLanguage,
      fallbackLanguage: normalizedFallbackLanguage,
    });

    if (error) {
      console.warn('Fehler beim Laden der Fragen:', error.message);
      const cached = await resolveCachedQuestions();
      if (cached.length) {
        return cached;
      }
      const seeded = resolveOfflineSeeds();
      if (seeded.length) {
        return seeded;
      }
      return [];
    }

    if (!rows.length) {
      const cached = await resolveCachedQuestions();
      if (cached.length) {
        return cached;
      }
      const seeded = resolveOfflineSeeds();
      if (seeded.length) {
        return seeded;
      }
      console.warn('Keine Fragen in Supabase gefunden.');
      return [];
    }

    const resolved = topUpWithOfflineSeeds(rows, questionPoolLimit);

    if (!resolved.length) {
      console.warn('Nur automatisch generierte oder ungueltige Fragen gefunden.');
      const cached = await resolveCachedQuestions();
      if (cached.length) {
        return cached;
      }
      const seeded = resolveOfflineSeeds();
      if (seeded.length) {
        return seeded;
      }
      return [];
    }

    cacheQuestionsSnapshot({
      cacheKey,
      questions: resolved,
      fetchedAt: now,
      limit: questionPoolLimit,
      category: normalizedCategory,
      language: normalizedLanguage,
    });
    syncCachedQuestions(storageKey, resolved).catch((err) => {
      console.warn('Konnte Fragen-Cache nicht synchronisieren:', err);
    });
    return finalizeQuestions(resolved);
  } catch (err) {
    console.error('Unerwarteter Fehler beim Laden der Fragen:', err);
    const cached = await resolveCachedQuestions();
    if (cached.length) {
      return cached;
    }
    return [];
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
  const questions = await fetchQuestions(normalizedLimit, null, {
    force: true,
    language: normalizedLanguage,
  });
  const results = [
    {
      scope: QUESTION_POOL_KEY,
      count: Array.isArray(questions) ? questions.length : 0,
    },
  ];

  if (results.some((result) => result.count > 0)) {
    questionCacheSyncTimes.set(normalizedLanguage, now);
  }

  return { ok: true, results, language: normalizedLanguage };
}

export function calculateMatchPoints({ correct = 0, total = 0, usedBoostIds = [] } = {}) {
  const safeTotal = Math.max(1, Number.isFinite(total) ? total : 0);
  const safeCorrect = Math.max(0, Math.min(Number.isFinite(correct) ? correct : 0, safeTotal));
  const boostPenalty = getBoostPointPenalty(sanitizeBoostUsage(usedBoostIds));
  const rawPoints = safeCorrect * POINTS_PER_CORRECT_ANSWER;

  return Math.max(0, rawPoints - boostPenalty);
}

export function calculateCoinReward({
  correct = 0,
  total = 0,
  isMultiplayer = false,
} = {}) {
  const safeTotal = Math.max(0, Number.isFinite(total) ? total : 0);
  const safeCorrect = Math.max(0, Number.isFinite(correct) ? correct : 0);
  const completionBonus = safeTotal > 0 ? COIN_COMPLETION_BONUS : 0;
  const perfectBonus =
    safeTotal > 0 && safeCorrect >= safeTotal ? COIN_PERFECT_BONUS : 0;
  const multiplayerBonus = isMultiplayer ? COIN_MULTIPLAYER_BONUS : 0;
  const rawCoins =
    Math.min(safeCorrect, safeTotal) +
    completionBonus +
    perfectBonus +
    multiplayerBonus;

  return Math.max(1, Math.round(rawCoins));
}

export async function fetchLeaderboard(limit = 20, { force = false } = {}) {
  const requestedLimit =
    Number.isFinite(limit) && limit > 0
      ? Math.max(1, Math.min(Math.floor(limit), 100))
      : 20;
  const now = Date.now();

  if (
    !force &&
    leaderboardCache.data &&
    now - leaderboardCache.fetchedAt < LEADERBOARD_CACHE_TTL &&
    leaderboardCache.data.length >= requestedLimit
  ) {
    return leaderboardCache.data.slice(0, requestedLimit);
  }

  try {
    const rpcResult = await runSupabaseRequest(
      () =>
        supabase.rpc('get_leaderboard', {
          p_limit: requestedLimit,
        }),
      {
        label: 'quizService.getLeaderboard',
        profile: 'ui',
        dedupeKey: `rpc:${requestedLimit}`,
      }
    );
    let data = Array.isArray(rpcResult.data) ? rpcResult.data : null;

    if (rpcResult.error) {
      console.warn('Fehler beim Laden der Rangliste-RPC, pruefe Tabellen-Fallback:', rpcResult.error);
      const fallbackRows = await fetchLeaderboardRowsFromUsers(requestedLimit);
      if (fallbackRows.length) {
        data = fallbackRows;
      } else {
        throw rpcResult.error;
      }
    } else if (!data?.length) {
      const fallbackRows = await fetchLeaderboardRowsFromUsers(requestedLimit);
      if (fallbackRows.length) {
        data = fallbackRows;
      }
    }

    if (!Array.isArray(data)) {
      throw new Error('Leaderboard response is not an array.');
    }

    if (!data.length) {
      invalidateLeaderboardCache();
      return [];
    }

    const userIds = Array.from(
      new Set(
        data
          .map((item) => item?.user_id ?? item?.userId ?? item?.id ?? null)
          .filter(Boolean)
      )
    );
    const profileByUserId = new Map();

    if (userIds.length) {
      const profileResult = await runSupabaseRequest(
        () =>
          supabase
            .from('profiles')
            .select('id, avatar_url, avatar_icon, avatar_color, display_name')
            .in('id', userIds),
        {
          label: 'quizService.getLeaderboardProfiles',
          profile: 'ui',
          dedupeKey: `profiles:${userIds.join(',')}`,
        }
      );

      if (!profileResult.error && Array.isArray(profileResult.data)) {
        profileResult.data.forEach((row) => {
          if (!row?.id) {
            return;
          }
          profileByUserId.set(row.id, row);
        });
      }
    }

    const ranked = data.map((item) => ({
      id: item.id ?? item.user_id ?? item.userId ?? null,
      userId: item.user_id ?? item.userId ?? item.id ?? null,
      username:
        item.username
        ?? profileByUserId.get(item.user_id ?? item.userId ?? item.id)?.display_name
        ?? null,
      xp: Number.isFinite(item.xp) ? item.xp : sanitizeLeaderboardNumber(item.xp, null),
      points: sanitizeLeaderboardNumber(item.points ?? item.leaderboard_points, 0),
      avatarUrl:
        sanitizeAvatarUrl(item.avatar_url ?? item.avatarUrl)
        ?? sanitizeAvatarUrl(profileByUserId.get(item.user_id ?? item.userId ?? item.id)?.avatar_url),
      avatarIcon:
        sanitizeAvatarIcon(item.avatar_icon ?? item.avatarIcon)
        ?? sanitizeAvatarIcon(profileByUserId.get(item.user_id ?? item.userId ?? item.id)?.avatar_icon),
      avatarColor:
        sanitizeAvatarColor(item.avatar_color ?? item.avatarColor)
        ?? sanitizeAvatarColor(profileByUserId.get(item.user_id ?? item.userId ?? item.id)?.avatar_color),
      createdAt: item.created_at ?? item.createdAt ?? null,
    }));

    leaderboardCache.data = ranked;
    leaderboardCache.fetchedAt = now;

    return ranked;
  } catch (err) {
    console.error('Unerwarteter Fehler beim Laden der Rangliste:', err);
    throw err;
  }
}

export async function submitScore(
  userId,
  points,
  options = {}
) {
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

  if (options.offline) {
    return queueScore(safeUserId, sanitizedPoints);
  }
  try {
    const { data, error } = await submitScoreRpc(safeUserId, sanitizedPoints);

    if (error) {
      console.warn('Fehler beim Speichern des Scores:', error.message);
      return { ok: false, error };
    }

    invalidateLeaderboardCache();
    return { ok: true, data };
  } catch (err) {
    console.error('Unerwarteter Fehler beim Speichern des Scores:', err);
    return { ok: false, error: err };
  }
}
