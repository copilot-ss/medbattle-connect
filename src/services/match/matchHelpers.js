const MATCH_CACHE_TTL = 15 * 1000;
const LOBBY_IDLE_TIMEOUT_MINUTES = 10;
const MATCH_STATUS = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
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
        explanation: question.explanation ?? null,
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
      ready: false,
    },
    guest: {
      userId: null,
      username: null,
      index: 0,
      score: 0,
      finished: false,
      answers: [],
      ready: false,
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
      ready: Boolean(roleState.ready),
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
    question_ids: Array.isArray(row.question_ids) ? row.question_ids : [],
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

export {
  MATCH_CACHE_TTL,
  LOBBY_IDLE_TIMEOUT_MINUTES,
  MATCH_STATUS,
  nowIso,
  normalizeDifficulty,
  sanitizeQuestionsForMatch,
  sanitizeAnswer,
  normalizeMatchState,
  normalizeMatchRow,
  generateJoinCode,
};
