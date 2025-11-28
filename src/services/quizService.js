import { supabase } from '../lib/supabaseClient';
import {
  getCampaignQuestions,
  getCampaignQuestionsForStage,
  getCampaignStageByKey,
  CAMPAIGN_QUESTION_LIMIT,
  CAMPAIGN_STAGES,
} from '../data/campaignQuestions';
import { ensureUserRecord } from './userService';

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

function shuffleList(list) {
  const copy = Array.isArray(list) ? [...list] : [];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export { CAMPAIGN_QUESTION_LIMIT, CAMPAIGN_STAGES, getCampaignStageByKey };

export function fetchCampaignQuestions(limit = CAMPAIGN_QUESTION_LIMIT) {
  const questions = getCampaignQuestions(limit);
  if (!Array.isArray(questions) || !questions.length) {
    return [];
  }

  return questions.map((question) => ({
    ...question,
    options: shuffleList(question.options),
  }));
}

export function fetchCampaignStageQuestions(stageKey, limit) {
  const questions = getCampaignQuestionsForStage(stageKey, limit);
  if (!Array.isArray(questions) || !questions.length) {
    return [];
  }

  return questions.map((question) => ({
    ...question,
    options: shuffleList(question.options),
  }));
}

export async function fetchQuestions(difficulty = 'mittel', limit = 5) {
  const normalizedDifficulty = ['leicht', 'mittel', 'schwer'].includes(
    difficulty
  )
    ? difficulty
    : 'mittel';

  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('difficulty', normalizedDifficulty)
      .order('created_at', { ascending: false })
      .limit(limit);

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
        const options = parseOptions(question.options);
        return {
          ...question,
          difficulty: question.difficulty ?? normalizedDifficulty,
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
      console.warn('Fragen ohne gueltige Antwortoptionen gefunden.');
      return [];
    }

    return shuffleList(normalized).slice(0, limit);
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
    const { data, error } = await supabase
      .from('scores')
      .select('id, user_id, points, difficulty, created_at, users:users(username)')
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
        username: item.users?.username ?? null,
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
  const safeUserId =
    typeof userId === 'string' ? userId.trim() : userId ? String(userId) : '';

  if (!safeUserId) {
    console.warn('Kein angemeldeter Nutzer fuer Score-Speicherung vorhanden.');
    return { ok: false, error: new Error('Kein Nutzer angemeldet.') };
  }

  const sanitizedPoints = Number.isFinite(points) ? Math.max(points, 0) : 0;
  const sanitizedDifficulty =
    typeof difficulty === 'string' && difficulty.trim()
      ? difficulty.trim().toLowerCase()
      : 'mittel';
  const payload = {
    user_id: safeUserId,
    points: sanitizedPoints,
    difficulty: sanitizedDifficulty,
  };

  let authUser = null;

  try {
    const { data, error } = await supabase.auth.getUser();

    if (!error && data?.user) {
      authUser = data.user;
    }
  } catch (err) {
    console.warn('Konnte Nutzerinformationen fuer Score nicht abrufen:', err);
  }

  let ensuredProfile = false;

  try {
    const ensureTarget =
      authUser && authUser.id === safeUserId
        ? authUser
        : {
            id: safeUserId,
            email: authUser?.email ?? null,
            user_metadata: authUser?.user_metadata ?? {},
          };

    const ensureResult = await ensureUserRecord(ensureTarget);
    ensuredProfile = ensureResult.ok;

    if (!ensureResult.ok && ensureResult.error) {
      console.warn('Konnte Nutzerprofil vor Score nicht anlegen:', ensureResult.error);
    }
  } catch (err) {
    console.warn('Konnte Nutzerprofil vor Score nicht synchronisieren:', err);
  }

  async function insertScoreRow() {
    return supabase.from('scores').insert([payload]);
  }

  try {
    let { error } = await insertScoreRow();

    if (error) {
      const message = error.message ?? '';

      if (message.includes('foreign key constraint')) {
        const { data: userData, error: userFetchError } = await supabase.auth.getUser();

        if (!userFetchError && userData?.user) {
          const ensureResult =
            ensuredProfile && userData.user.id === safeUserId
              ? { ok: true }
              : await ensureUserRecord(userData.user);

          if (!ensureResult.ok && ensureResult.error) {
            console.warn('Konnte Nutzerprofil beim erneuten Versuch nicht anlegen:', ensureResult.error);
          }

          if (ensureResult.ok) {
            const retry = await insertScoreRow();

            if (!retry.error) {
              return { ok: true, retried: true };
            }

            error = retry.error;
          }
        }
      }

      console.error('Fehler beim Speichern des Scores:', error.message);
      return { ok: false, error };
    }

    return { ok: true };
  } catch (err) {
    console.error('Unerwarteter Fehler beim Speichern des Scores:', err);
    return { ok: false, error: err };
  }
}
