import { supabase } from '../lib/supabaseClient';

const FALLBACK_QUESTIONS = [
  {
    id: 'sample-1',
    question: 'Was misst der systolische Blutdruck?',
    options: [
      'Druck wenn sich das Herz zusammenzieht',
      'Druck in Ruhephasen des Herzens',
      'Anzahl der Herzschlaege pro Minute',
      'Sauerstoffsaettigung des Blutes',
    ],
    correct_answer: 'Druck wenn sich das Herz zusammenzieht',
  },
  {
    id: 'sample-2',
    question: 'Welches Organ produziert Insulin?',
    options: ['Leber', 'Bauchspeicheldruese', 'Milz', 'Schilddruese'],
    correct_answer: 'Bauchspeicheldruese',
  },
  {
    id: 'sample-3',
    question: 'Welche Blutgruppe gilt als universeller Spender?',
    options: ['A+', 'B-', 'AB+', '0-'],
    correct_answer: '0-',
  },
];

const LEADERBOARD_CACHE_TTL = 30 * 1000;
const leaderboardCache = {
  data: null,
  fetchedAt: 0,
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

export async function fetchQuestions(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('Fehler beim Laden der Fragen:', error.message);
      return FALLBACK_QUESTIONS.slice(0, limit);
    }

    if (!data) {
      return FALLBACK_QUESTIONS.slice(0, limit);
    }

    const normalized = data
      .map((question) => {
        const options = parseOptions(question.options);
        return {
          ...question,
          options,
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
      return FALLBACK_QUESTIONS.slice(0, limit);
    }

    return normalized.slice(0, limit);
  } catch (err) {
    console.error('Unerwarteter Fehler beim Laden der Fragen:', err);
    return FALLBACK_QUESTIONS.slice(0, limit);
  }
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
    const { data, error } = await supabase
      .from('scores')
      .select('id, user_id, points, difficulty, created_at')
      .order('points', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(Math.max(limit * 3, 50));

    if (error) {
      console.warn('Fehler beim Laden der Rangliste:', error.message);
      return [];
    }

    if (!Array.isArray(data) || !data.length) {
      return [];
    }

    const ranked = [];
    const seen = new Set();

    for (const item of data) {
      if (!item?.user_id || seen.has(item.user_id)) {
        continue;
      }

      seen.add(item.user_id);

      ranked.push({
        id: item.id,
        userId: item.user_id,
        points: Number.isFinite(item.points) ? item.points : 0,
        difficulty: item.difficulty ?? 'unbekannt',
        createdAt: item.created_at ?? null,
      });

      if (ranked.length >= limit) {
        break;
      }
    }

    leaderboardCache.data = ranked;
    leaderboardCache.fetchedAt = now;

    return ranked;
  } catch (err) {
    console.error('Unerwarteter Fehler beim Laden der Rangliste:', err);
    return [];
  }
}

export async function submitScore(userId, points, difficulty = 'mittel') {
  try {
    const { error } = await supabase.from('scores').insert([
      {
        user_id: userId,
        points,
        difficulty,
      },
    ]);

    if (error) {
      console.error('Fehler beim Speichern des Scores:', error.message);
      return { ok: false, error };
    }

    return { ok: true };
  } catch (err) {
    console.error('Unerwarteter Fehler beim Speichern des Scores:', err);
    return { ok: false, error: err };
  }
}
