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
    {
      id: 'leicht-6',
      question: 'Wie viele Zaehen hat ein erwachsener Mensch typischerweise?',
      options: ['28', '30', '32', '34'],
      correct_answer: '32',
    },
    {
      id: 'leicht-7',
      question: 'Welche Blutgruppe gilt als Universalempfaenger?',
      options: ['0-', 'A+', 'B-', 'AB+'],
      correct_answer: 'AB+',
    },
    {
      id: 'leicht-8',
      question: 'Welches Mineral staerkt vor allem die Knochen?',
      options: ['Zink', 'Kalzium', 'Jod', 'Eisen'],
      correct_answer: 'Kalzium',
    },
    {
      id: 'leicht-9',
      question: 'Wie viele Kammern hat das menschliche Herz?',
      options: ['Zwei', 'Drei', 'Vier', 'Fuenf'],
      correct_answer: 'Vier',
    },
    {
      id: 'leicht-10',
      question: 'Welches Organ filtert das Blut und bildet Urin?',
      options: ['Milz', 'Nieren', 'Leber', 'Magen'],
      correct_answer: 'Nieren',
    },
    {
      id: 'leicht-11',
      question: 'Wie viele Halswirbel besitzt der Mensch?',
      options: ['Fuenf', 'Sieben', 'Acht', 'Zehn'],
      correct_answer: 'Sieben',
    },
    {
      id: 'leicht-12',
      question:
        'Welches Sinnesorgan ist hauptsaechlich fuer den Geruchssinn verantwortlich?',
      options: ['Zunge', 'Auge', 'Nase', 'Ohr'],
      correct_answer: 'Nase',
    },
    {
      id: 'leicht-13',
      question: 'Welche Einheit wird zur Messung des Blutdrucks verwendet?',
      options: ['Millimeter Quecksilber', 'Milligramm', 'Liter', 'Volt'],
      correct_answer: 'Millimeter Quecksilber',
    },
    {
      id: 'leicht-14',
      question: 'Welches Organ gehoert zum Verdauungssystem?',
      options: ['Lunge', 'Leber', 'Herz', 'Milz'],
      correct_answer: 'Leber',
    },
    {
      id: 'leicht-15',
      question: 'Wie nennt man den fluessigen Anteil des Blutes?',
      options: ['Serum', 'Plasma', 'Lymphe', 'Rheuma'],
      correct_answer: 'Plasma',
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
      options: ['Baender', 'Sehnen', 'Knorpel', 'Faszien'],
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
      question: 'Welcher Gerinnungsfaktor ist Vitamin-K-abhaengig?',
      options: ['Faktor II', 'Faktor VIII', 'Faktor IX', 'Faktor XII'],
      correct_answer: 'Faktor II',
    },
    {
      id: 'mittel-5',
      question: 'Welches Elektrolyt ist vor allem intrazellulaer dominant?',
      options: ['Natrium', 'Kalium', 'Chlorid', 'Kalzium'],
      correct_answer: 'Kalium',
    },
    {
      id: 'mittel-6',
      question: 'Welcher Hirnnerv steuert hauptsaechlich die Gesichtsmuskeln?',
      options: ['N. trigeminus', 'N. facialis', 'N. vagus', 'N. glossopharyngeus'],
      correct_answer: 'N. facialis',
    },
    {
      id: 'mittel-7',
      question: 'Welche Zellen produzieren Antikoerper?',
      options: ['Erythrozyten', 'Plasmazellen', 'Neutrophile', 'Thrombozyten'],
      correct_answer: 'Plasmazellen',
    },
    {
      id: 'mittel-8',
      question: 'Welcher Laborwert weist am empfindlichsten auf einen Herzinfarkt hin?',
      options: ['CK', 'Troponin T', 'LDH', 'D-Dimer'],
      correct_answer: 'Troponin T',
    },
    {
      id: 'mittel-9',
      question: 'Welches Hormon wird vor allem in der Nebennierenrinde gebildet?',
      options: ['Adrenalin', 'Cortisol', 'Vasopressin', 'Insulin'],
      correct_answer: 'Cortisol',
    },
    {
      id: 'mittel-10',
      question: 'Welcher Darmabschnitt resorbiert die meisten Gallensalze?',
      options: ['Duodenum', 'Jejunum', 'Ileum', 'Colon'],
      correct_answer: 'Ileum',
    },
    {
      id: 'mittel-11',
      question:
        'Welcher Knochen bildet zusammen mit dem Oberarmkopf das Schultergelenk?',
      options: ['Clavicula', 'Scapula', 'Sternum', 'Radius'],
      correct_answer: 'Scapula',
    },
    {
      id: 'mittel-12',
      question: 'Welches Immunglobulin ueberquert als einziges die Plazenta?',
      options: ['IgA', 'IgM', 'IgG', 'IgE'],
      correct_answer: 'IgG',
    },
    {
      id: 'mittel-13',
      question: 'Welches Enzym spaltet Milchzucker im Duennndarm?',
      options: ['Amylase', 'Laktase', 'Pepsin', 'Lipase'],
      correct_answer: 'Laktase',
    },
    {
      id: 'mittel-14',
      question:
        'Ab welchem Wert spricht man laut Leitlinie von einer Hypertonie Grad 1?',
      options: [
        '>= 130/80 mmHg',
        '>= 135/85 mmHg',
        '>= 140/90 mmHg',
        '>= 150/95 mmHg',
      ],
      correct_answer: '>= 140/90 mmHg',
    },
    {
      id: 'mittel-15',
      question: 'Welches Organ produziert die meisten Gerinnungsfaktoren?',
      options: ['Leber', 'Milz', 'Thymus', 'Pankreas'],
      correct_answer: 'Leber',
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
      options: ['>= 5,7 %', '>= 6,0 %', '>= 6,5 %', '>= 7,0 %'],
      correct_answer: '>= 6,5 %',
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
    {
      id: 'schwer-6',
      question: 'Welche Autoantikörper sind typisch fuer Morbus Basedow?',
      options: ['Anti-CCP', 'TRAK', 'ANA', 'Anti-TPO'],
      correct_answer: 'TRAK',
    },
    {
      id: 'schwer-7',
      question: 'Welcher Score bewertet die Schwere einer ambulanten Pneumonie?',
      options: ['CHA2DS2-VASc', 'CRB-65', 'APGAR', 'SOFA'],
      correct_answer: 'CRB-65',
    },
    {
      id: 'schwer-8',
      question: 'Welches Antidot wird bei Paracetamol-Ueberdosierung eingesetzt?',
      options: ['Naloxon', 'Flumazenil', 'Acetylcystein', 'Protamin'],
      correct_answer: 'Acetylcystein',
    },
    {
      id: 'schwer-9',
      question: 'Welche genetische Veraenderung ist charakteristisch fuer CML?',
      options: ['JAK2 V617F', 'BCR-ABL', 'KRAS', 'EGFR'],
      correct_answer: 'BCR-ABL',
    },
    {
      id: 'schwer-10',
      question: 'Welcher Tumormarker spricht fuer ein Ovarialkarzinom?',
      options: ['CA 15-3', 'AFP', 'CA 19-9', 'CA 125'],
      correct_answer: 'CA 125',
    },
    {
      id: 'schwer-11',
      question: 'Welcher Autoantikörper ist typisch fuer eine autoimmune Hepatitis Typ 1?',
      options: ['ANA', 'AMA', 'ANCA', 'Anti-Jo-1'],
      correct_answer: 'ANA',
    },
    {
      id: 'schwer-12',
      question: 'Welches Medikament ist Mittel der Wahl beim Status asthmaticus?',
      options: [
        'Ipratropium',
        'Schnell wirksames Beta-2-Spray',
        'Theophyllin i.v.',
        'Adrenalin i.m.',
      ],
      correct_answer: 'Schnell wirksames Beta-2-Spray',
    },
    {
      id: 'schwer-13',
      question: 'Welche Diagnostik ist Goldstandard zur Bestaetigung einer Lungenembolie?',
      options: [
        'Ventilations-Perfusions-Szintigrafie',
        'CT-Angiografie',
        'Thoraxroentgen',
        'Sonografie',
      ],
      correct_answer: 'CT-Angiografie',
    },
    {
      id: 'schwer-14',
      question: 'Welches Antibiotikum deckt Pseudomonas aeruginosa typischerweise ab?',
      options: ['Amoxicillin', 'Ciprofloxacin', 'Clarithromycin', 'Cefazolin'],
      correct_answer: 'Ciprofloxacin',
    },
    {
      id: 'schwer-15',
      question: 'Welcher Elektrolyt muss vor einer Amiodaron-Gabe korrigiert werden?',
      options: ['Natrium', 'Magnesium', 'Kalium', 'Kalzium'],
      correct_answer: 'Kalium',
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

function shuffleList(list) {
  const copy = Array.isArray(list) ? [...list] : [];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getFallbackQuestions(difficulty, limit) {
  const normalizedDifficulty = ['leicht', 'mittel', 'schwer'].includes(
    difficulty
  )
    ? difficulty
    : 'mittel';

  const basePool = FALLBACK_QUESTIONS[normalizedDifficulty] ?? [];
  const shuffledBase = shuffleList(basePool);
  const results = [...shuffledBase];

  if (results.length < limit) {
    const otherKeys = shuffleList(
      Object.keys(FALLBACK_QUESTIONS).filter((key) => key !== normalizedDifficulty)
    );

    for (const key of otherKeys) {
      const extraPool = shuffleList(FALLBACK_QUESTIONS[key] ?? []);
      for (const question of extraPool) {
        if (!results.some((item) => item.id === question.id)) {
          results.push(question);
        }
        if (results.length >= limit) {
          break;
        }
      }

      if (results.length >= limit) {
        break;
      }
    }
  }

  return shuffleList(results).slice(0, limit);
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

    let prepared = shuffleList(normalized);

    if (prepared.length < limit) {
      const fallback = getFallbackQuestions(normalizedDifficulty, limit);
      const deduped = [...prepared];
      const seenIds = new Set(deduped.map((item) => item.id));
      for (const question of fallback) {
        if (!seenIds.has(question.id)) {
          deduped.push(question);
          seenIds.add(question.id);
        }
        if (deduped.length >= limit) {
          break;
        }
      }
      prepared = deduped;
    }

    return prepared.slice(0, limit);
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
