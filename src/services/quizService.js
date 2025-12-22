import { supabase } from '../lib/supabaseClient';

const LEADERBOARD_CACHE_TTL = 30 * 1000;
const leaderboardCache = {
  data: null,
  fetchedAt: 0,
};
const BASE_MATCH_POINTS = 12;
const DIFFICULTY_MULTIPLIERS = {
  leicht: 0.8,
  mittel: 1,
  schwer: 1.25,
};

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

export async function fetchQuestions(difficulty = 'mittel', limit = 6, category = null) {
  const normalizedDifficulty = ['leicht', 'mittel', 'schwer'].includes(
    difficulty
  )
    ? difficulty
    : 'mittel';
  const normalizedLimit =
    Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 6;
  const normalizedCategory =
    typeof category === 'string' && category.trim() ? category.trim() : null;

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

    return normalized;
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

export async function submitScore(userId, points, difficulty = 'mittel') {
  const safeUserId =
    typeof userId === 'string' ? userId.trim() : userId ? String(userId) : '';

  if (!safeUserId) {
    console.warn('Kein angemeldeter Nutzer fuer Score-Speicherung vorhanden.');
    return { ok: false, error: new Error('Kein Nutzer angemeldet.') };
  }

  if (safeUserId === 'guest') {
    return { ok: false, error: new Error('Gaeste koennen keine Scores speichern.') };
  }

  const sanitizedPoints = Number.isFinite(points) ? Math.max(points, 0) : 0;
  const sanitizedDifficulty =
    typeof difficulty === 'string' && difficulty.trim()
      ? difficulty.trim().toLowerCase()
      : 'mittel';
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
