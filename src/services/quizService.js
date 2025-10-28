import { supabase } from '../lib/supabaseClient';
import { ensureUserRecord } from './userService';

const FALLBACK_QUESTIONS = {
  leicht: [
    {
      id: 'leicht-1',
      question: 'Welches Organ pumpt Blut durch den Koerper?',
      options: ['Leber', 'Herz', 'Lunge', 'Niere'],
      correct_answer: 'Herz',
    },
    {
      id: 'leicht-2',
      question: 'Wie viele Lungenfluegel hat der Mensch?',
      options: ['Einen', 'Zwei', 'Drei', 'Vier'],
      correct_answer: 'Zwei',
    },
    {
      id: 'leicht-3',
      question: 'Welches Vitamin produziert der Koerper durch Sonnenlicht?',
      options: ['Vitamin A', 'Vitamin B12', 'Vitamin C', 'Vitamin D'],
      correct_answer: 'Vitamin D',
    },
    {
      id: 'leicht-4',
      question: 'Welcher Blutbestandteil transportiert Sauerstoff?',
      options: ['Leukozyten', 'Erythrozyten', 'Thrombozyten', 'Plasma'],
      correct_answer: 'Erythrozyten',
    },
    {
      id: 'leicht-5',
      question: 'Welche Koerpertemperatur gilt als Fieber?',
      options: ['Ab 37,0°C', 'Ab 37,5°C', 'Ab 38,0°C', 'Ab 39,0°C'],
      correct_answer: 'Ab 38,0°C',
    },
  ],
  mittel: [
    {
      id: 'mittel-1',
      question: 'Welches Hormon reguliert den Blutzuckerspiegel?',
      options: ['Adrenalin', 'Insulin', 'Kortisol', 'Thyroxin'],
      correct_answer: 'Insulin',
    },
    {
      id: 'mittel-2',
      question: 'Welche Struktur verbindet Muskel mit Knochen?',
      options: ['Bänder', 'Sehnen', 'Knorpel', 'Faszien'],
      correct_answer: 'Sehnen',
    },
    {
      id: 'mittel-3',
      question: 'Welcher Teil des Gehirns steuert das Gleichgewicht?',
      options: ['Grosshirn', 'Kleinhirn', 'Zwischenhirn', 'Hirnstamm'],
      correct_answer: 'Kleinhirn',
    },
    {
      id: 'mittel-4',
      question: 'Welcher Antikoagulans-Faktor ist Vitamin-K-abhaengig?',
      options: ['Faktor II', 'Faktor VIII', 'Faktor IX', 'Faktor XII'],
      correct_answer: 'Faktor II',
    },
    {
      id: 'mittel-5',
      question: 'Welches Elektrolyt ist vor allem intrazellulaer dominant?',
      options: ['Natrium', 'Kalium', 'Chlorid', 'Kalzium'],
      correct_answer: 'Kalium',
    },
  ],
  schwer: [
    {
      id: 'schwer-1',
      question: 'Welches Bakterium ist haeufigster Erreger einer ambulanten Pneumonie?',
      options: [
        'Staphylococcus aureus',
        'Streptococcus pneumoniae',
        'Pseudomonas aeruginosa',
        'Klebsiella pneumoniae',
      ],
      correct_answer: 'Streptococcus pneumoniae',
    },
    {
      id: 'schwer-2',
      question: 'Welcher HbA1c-Wert entspricht diagnostisch einem Diabetes mellitus?',
      options: ['≥ 5,7 %', '≥ 6,0 %', '≥ 6,5 %', '≥ 7,0 %'],
      correct_answer: '≥ 6,5 %',
    },
    {
      id: 'schwer-3',
      question: 'Welches Medikament ist First-Line bei anaphylaktischem Schock?',
      options: ['Prednisolon', 'Dimetinden', 'Adrenalin i.m.', 'Volumengeber'],
      correct_answer: 'Adrenalin i.m.',
    },
    {
      id: 'schwer-4',
      question: 'Welche Struktur bildet den juxtaglomerulaeren Apparat der Niere?',
      options: [
        'Macula densa, juxtaglomerulaere Zellen, extraglomerulaere Mesangiumzellen',
        'Bowman-Kapsel, Henle-Schleife, Sammelrohr',
        'Podozyten, Endothel, Basalmembran',
        'Proximaler Tubulus, Distaler Tubulus, Henle-Schleife',
      ],
      correct_answer:
        'Macula densa, juxtaglomerulaere Zellen, extraglomerulaere Mesangiumzellen',
    },
    {
      id: 'schwer-5',
      question: 'Welcher Tumormarker ist typisch fuer das hepatozellulaere Karzinom?',
      options: ['CEA', 'AFP', 'CA 19-9', 'PSA'],
      correct_answer: 'AFP',
    },
  ],
};

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

function getFallbackQuestions(difficulty, limit) {
  const normalizedDifficulty = ['leicht', 'mittel', 'schwer'].includes(
    difficulty
  )
    ? difficulty
    : 'mittel';

  const pool = FALLBACK_QUESTIONS[normalizedDifficulty] ?? [];

  if (pool.length >= limit) {
    return pool.slice(0, limit);
  }

  const fallback = [...pool];

  if (fallback.length < limit) {
    const otherDifficulties = Object.keys(FALLBACK_QUESTIONS).filter(
      (key) => key !== normalizedDifficulty
    );
    for (const key of otherDifficulties) {
      const otherPool = FALLBACK_QUESTIONS[key] ?? [];
      for (const question of otherPool) {
        fallback.push(question);
        if (fallback.length >= limit) {
          break;
        }
      }
      if (fallback.length >= limit) {
        break;
      }
    }
  }

  return fallback.slice(0, limit);
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
      return getFallbackQuestions(normalizedDifficulty, limit);
    }

    if (!data) {
      return getFallbackQuestions(normalizedDifficulty, limit);
    }

    const normalized = data
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
      return getFallbackQuestions(normalizedDifficulty, limit);
    }

    if (normalized.length < limit) {
      const fallback = getFallbackQuestions(normalizedDifficulty, limit);
      const deduped = [...normalized];
      const seenIds = new Set(deduped.map((item) => item.id));
      for (const question of fallback) {
        if (!seenIds.has(question.id)) {
          deduped.push(question);
        }
        if (deduped.length >= limit) {
          break;
        }
      }
      return deduped.slice(0, limit);
    }

    return normalized.slice(0, limit);
  } catch (err) {
    console.error('Unerwarteter Fehler beim Laden der Fragen:', err);
    return getFallbackQuestions(normalizedDifficulty, limit);
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
