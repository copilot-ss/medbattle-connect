import { MULTIPLAYER_DEFAULT_QUESTION_LIMIT } from '../../config/quizLimits';
import { t } from '../../i18n';
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

function isRematchStatusTransition(prevMatch, nextMatch) {
  if (prevMatch?.status !== MATCH_STATUS.COMPLETED) {
    return false;
  }

  if (
    nextMatch?.status !== MATCH_STATUS.WAITING &&
    nextMatch?.status !== MATCH_STATUS.ACTIVE
  ) {
    return false;
  }

  const prevUpdatedAt = Date.parse(prevMatch.updated_at ?? prevMatch.updatedAt ?? '') || 0;
  const nextUpdatedAt = Date.parse(nextMatch.updated_at ?? nextMatch.updatedAt ?? '') || 0;

  return nextUpdatedAt > 0 && prevUpdatedAt > 0 && nextUpdatedAt >= prevUpdatedAt;
}

const EMPTY_PLAYER_STATE = {
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
};

function isMatchPlayerRole(role) {
  return role === 'host' || role === 'guest' || /^guest\d+$/.test(String(role));
}

function getMatchPlayerRoleOrder(role) {
  if (role === 'host') {
    return 0;
  }
  if (role === 'guest') {
    return 1;
  }
  const match = /^guest(\d+)$/.exec(String(role));
  if (!match) {
    return Number.MAX_SAFE_INTEGER;
  }
  const index = Number.parseInt(match[1], 10);
  return Number.isFinite(index) ? index : Number.MAX_SAFE_INTEGER;
}

function getSortedMatchPlayerRoles(state) {
  if (!state || typeof state !== 'object') {
    return ['host', 'guest'];
  }

  const roles = Object.keys(state).filter(isMatchPlayerRole);
  if (!roles.includes('host')) {
    roles.push('host');
  }
  if (!roles.includes('guest')) {
    roles.push('guest');
  }
  return roles.sort(
    (a, b) => getMatchPlayerRoleOrder(a) - getMatchPlayerRoleOrder(b)
  );
}

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
    return t('Pruefe die Antwortoptionen und merke dir den Kernpunkt dieser Frage.');
  }

  return t('Richtige Antwort: {answer}.', { answer: correctAnswer });
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
        image_url:
          typeof question.image_url === 'string' &&
          /^https?:\/\//i.test(question.image_url.trim())
            ? question.image_url.trim()
            : typeof question.imageUrl === 'string' &&
              /^https?:\/\//i.test(question.imageUrl.trim())
            ? question.imageUrl.trim()
            : null,
        image_alt:
          typeof question.image_alt === 'string' && question.image_alt.trim()
            ? question.image_alt.trim()
            : typeof question.imageAlt === 'string' && question.imageAlt.trim()
            ? question.imageAlt.trim()
            : null,
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

function normalizePlayerState(roleState = {}) {
  return {
    userId: roleState.userId ?? EMPTY_PLAYER_STATE.userId,
    username: sanitizeOptionalText(roleState.username) ?? EMPTY_PLAYER_STATE.username,
    title: sanitizeOptionalText(roleState.title) ?? EMPTY_PLAYER_STATE.title,
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
      ?? EMPTY_PLAYER_STATE.avatarUrl,
    avatarIcon:
      sanitizeAvatarIcon(roleState.avatarIcon ?? roleState.avatar_icon)
      ?? EMPTY_PLAYER_STATE.avatarIcon,
    avatarColor:
      sanitizeAvatarColor(roleState.avatarColor ?? roleState.avatar_color)
      ?? EMPTY_PLAYER_STATE.avatarColor,
    gaveUp: Boolean(roleState.gaveUp),
  };
}

function normalizeMatchState(state) {
  const base = {
    host: { ...EMPTY_PLAYER_STATE },
    guest: { ...EMPTY_PLAYER_STATE },
    history: [],
  };

  if (!state || typeof state !== 'object') {
    return base;
  }

  const next = { ...base };

  for (const roleKey of getSortedMatchPlayerRoles(state)) {
    const roleState = state[roleKey] ?? {};
    next[roleKey] = normalizePlayerState(roleState);
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
            isMatchPlayerRole(entry.player)
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

function getMatchPlayerEntries(matchOrState) {
  const state = matchOrState?.state && typeof matchOrState.state === 'object'
    ? matchOrState.state
    : matchOrState;

  if (!state || typeof state !== 'object') {
    return [];
  }

  return getSortedMatchPlayerRoles(state)
    .map((role) => ({
      role,
      state: normalizePlayerState(state[role] ?? {}),
    }))
    .filter((entry) => entry.state.userId);
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

  if (isRematchStatusTransition(prevMatch, nextMatch)) {
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
  getMatchPlayerEntries,
  getMatchPlayerRoleOrder,
  isMatchPlayerRole,
  sanitizeAnswer,
  normalizeMatchRow,
  resolveProgressiveMatch,
};
