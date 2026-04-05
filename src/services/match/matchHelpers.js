import { MULTIPLAYER_DEFAULT_QUESTION_LIMIT } from '../../config/quizLimits';
import { sanitizeBoostUsage } from '../../utils/quizBoosts';

const MATCH_CACHE_TTL = 15 * 1000;
const LOBBY_IDLE_TIMEOUT_MINUTES = 10;
const MATCH_STATUS = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

const MATCH_STATUS_ORDER = {
  [MATCH_STATUS.WAITING]: 1,
  [MATCH_STATUS.ACTIVE]: 2,
  [MATCH_STATUS.COMPLETED]: 3,
  [MATCH_STATUS.CANCELLED]: 3,
};

function nowIso() {
  return new Date().toISOString();
}

function ensureQuestionExplanation(question) {
  if (!question || typeof question !== 'object') {
    return null;
  }

  const explanation =
    typeof question.explanation === 'string' ? question.explanation.trim() : '';
  if (explanation) {
    return explanation;
  }

  const correctAnswer =
    typeof question.correct_answer === 'string'
      ? question.correct_answer.trim()
      : '';
  if (!correctAnswer) {
    return 'Pruefe die Antwortoptionen und merke dir den Kernpunkt dieser Frage.';
  }

  return `Richtige Antwort: ${correctAnswer}.`;
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
        explanation: ensureQuestionExplanation(question),
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
    boostsUsed: sanitizeBoostUsage(answer.boostsUsed),
    answeredAt: answer.answeredAt ?? nowIso(),
  };
}

function sanitizeOptionalText(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed || null;
}

function sanitizeAvatarUrl(value) {
  const normalized = sanitizeOptionalText(value);
  if (!normalized) {
    return null;
  }
  if (/^https?:\/\//i.test(normalized) || /^data:image\//i.test(normalized)) {
    return normalized;
  }
  return null;
}

function sanitizeAvatarIcon(value) {
  const normalized = sanitizeOptionalText(value);
  if (!normalized) {
    return null;
  }
  return /^[a-z0-9-]+$/i.test(normalized) ? normalized : null;
}

function sanitizeAvatarColor(value) {
  const normalized = sanitizeOptionalText(value);
  if (!normalized) {
    return null;
  }
  if (/^#[0-9a-f]{3,8}$/i.test(normalized) || /^rgba?\([^)]+\)$/i.test(normalized)) {
    return normalized;
  }
  return null;
}

function normalizeMatchState(state) {
  const base = {
    host: {
      userId: null,
      username: null,
      title: null,
      index: 0,
      score: 0,
      finished: false,
      answers: [],
      ready: false,
      avatarUrl: null,
      avatarIcon: null,
      avatarColor: null,
    },
    guest: {
      userId: null,
      username: null,
      title: null,
      index: 0,
      score: 0,
      finished: false,
      answers: [],
      ready: false,
      avatarUrl: null,
      avatarIcon: null,
      avatarColor: null,
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
      username: sanitizeOptionalText(roleState.username) ?? base[roleKey].username,
      title: sanitizeOptionalText(roleState.title) ?? base[roleKey].title,
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
      avatarUrl:
        sanitizeAvatarUrl(roleState.avatarUrl ?? roleState.avatar_url)
        ?? base[roleKey].avatarUrl,
      avatarIcon:
        sanitizeAvatarIcon(roleState.avatarIcon ?? roleState.avatar_icon)
        ?? base[roleKey].avatarIcon,
      avatarColor:
        sanitizeAvatarColor(roleState.avatarColor ?? roleState.avatar_color)
        ?? base[roleKey].avatarColor,
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
      : MULTIPLAYER_DEFAULT_QUESTION_LIMIT,
    question_ids: Array.isArray(row.question_ids) ? row.question_ids : [],
    questions: sanitizeQuestionsForMatch(row.questions),
    state: normalizeMatchState(row.state),
  };
}

function resolveProgressiveMatch(prevMatch, nextMatch) {
  if (!nextMatch) {
    return prevMatch ?? null;
  }

  if (!prevMatch) {
    return nextMatch;
  }

  if (prevMatch.id && nextMatch.id && prevMatch.id !== nextMatch.id) {
    return nextMatch;
  }

  const prevUpdatedAt = Date.parse(prevMatch.updated_at ?? prevMatch.updatedAt ?? '') || 0;
  const nextUpdatedAt = Date.parse(nextMatch.updated_at ?? nextMatch.updatedAt ?? '') || 0;

  if (nextUpdatedAt > prevUpdatedAt) {
    return nextMatch;
  }

  if (nextUpdatedAt < prevUpdatedAt) {
    return prevMatch;
  }

  const prevStatusRank = MATCH_STATUS_ORDER[prevMatch.status] ?? 0;
  const nextStatusRank = MATCH_STATUS_ORDER[nextMatch.status] ?? 0;

  if (nextStatusRank > prevStatusRank) {
    return nextMatch;
  }

  if (nextStatusRank < prevStatusRank) {
    return prevMatch;
  }

  return nextMatch;
}

export {
  MATCH_CACHE_TTL,
  LOBBY_IDLE_TIMEOUT_MINUTES,
  MATCH_STATUS,
  sanitizeAnswer,
  normalizeMatchRow,
  resolveProgressiveMatch,
};
