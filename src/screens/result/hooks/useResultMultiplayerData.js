import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildPublicProfilePayload } from '../../../utils/publicProfile';
import { getInitials } from '../resultUtils';
import { sanitizeBoostUsage } from '../../../utils/quizBoosts';
import { fetchPublicProfileByUserId } from '../../../services/userService';
import {
  getAvatarPresetSource,
  isRemoteAvatarUrl,
} from '../../../utils/avatarUtils';

function normalizeUserId(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed || null;
}

function resolveScoreValue(primaryValue, fallbackValue = null) {
  if (Number.isFinite(primaryValue)) {
    return primaryValue;
  }
  if (Number.isFinite(fallbackValue)) {
    return fallbackValue;
  }
  return null;
}

function getReviewOrderIndex(item) {
  return Number.isFinite(item?.index) ? item.index : 0;
}

function sortReviewItemsByIndex(items = []) {
  const source = Array.isArray(items) ? items : [];
  return source
    .slice()
    .sort((a, b) => getReviewOrderIndex(a) - getReviewOrderIndex(b));
}

function getQuestionMeta(map, questionId) {
  return map.get(questionId) ?? map.get(String(questionId)) ?? null;
}

export default function useResultMultiplayerData({
  isMultiplayer,
  matchId,
  matchStatus,
  matchJoinCode,
  playerRole,
  userId,
  score,
  category,
  questionLimit,
  opponentScore,
  opponentName,
  playerState,
  opponentState,
  answerHistory,
  liveMatch,
  liveMatchStatus,
  liveQuestions,
  livePlayerState,
  liveOpponentState,
  avatarSource,
  avatarIcon,
  currentAvatarColor,
  openProfile,
  t,
}) {
  const [selectedScorePlayerKey, setSelectedScorePlayerKey] = useState(null);
  const [participantProfiles, setParticipantProfiles] = useState({});
  const collectUsedBoostIds = useCallback((items = []) => {
    return sanitizeBoostUsage(
      (Array.isArray(items) ? items : []).flatMap((item) =>
        Array.isArray(item?.boostsUsed) ? item.boostsUsed : []
      )
    );
  }, []);

  const resolvedPlayerState = useMemo(() => {
    if (isMultiplayer && liveMatch) {
      return livePlayerState ?? null;
    }
    return playerState ?? null;
  }, [isMultiplayer, liveMatch, livePlayerState, playerState]);

  const resolvedOpponentState = useMemo(() => {
    if (isMultiplayer && liveMatch) {
      return liveOpponentState ?? null;
    }
    return opponentState ?? null;
  }, [isMultiplayer, liveMatch, liveOpponentState, opponentState]);

  const resolvedMatchStatus =
    liveMatch?.status ?? liveMatchStatus ?? matchStatus ?? null;
  const routeUserId = useMemo(
    () => normalizeUserId(userId),
    [userId]
  );
  const selfUserId = useMemo(
    () => normalizeUserId(resolvedPlayerState?.userId) ?? routeUserId,
    [resolvedPlayerState?.userId, routeUserId]
  );
  const opponentUserId = useMemo(
    () => normalizeUserId(resolvedOpponentState?.userId),
    [resolvedOpponentState?.userId]
  );
  const opponentStateAvatarUrl = useMemo(() => {
    if (!isRemoteAvatarUrl(resolvedOpponentState?.avatarUrl)) {
      return null;
    }
    return resolvedOpponentState.avatarUrl.trim();
  }, [resolvedOpponentState?.avatarUrl]);
  const hasCachedOpponentProfile = useMemo(
    () => (
      opponentUserId
        ? Object.prototype.hasOwnProperty.call(participantProfiles, opponentUserId)
        : false
    ),
    [opponentUserId, participantProfiles]
  );

  useEffect(() => {
    if (
      !opponentUserId ||
      opponentStateAvatarUrl ||
      hasCachedOpponentProfile
    ) {
      return undefined;
    }

    let active = true;

    (async () => {
      let nextProfile = null;
      try {
        const result = await fetchPublicProfileByUserId(opponentUserId);
        nextProfile = result?.ok ? result.profile ?? null : null;
      } catch {
        nextProfile = null;
      }
      if (!active) {
        return;
      }

      setParticipantProfiles((prev) => ({
        ...prev,
        [opponentUserId]: nextProfile,
      }));
    })();

    return () => {
      active = false;
    };
  }, [
    hasCachedOpponentProfile,
    opponentUserId,
    opponentStateAvatarUrl,
  ]);

  const currentAvatarUri = useMemo(() => {
    if (!avatarSource || typeof avatarSource !== 'object' || Array.isArray(avatarSource)) {
      return null;
    }
    return typeof avatarSource.uri === 'string' && avatarSource.uri.trim()
      ? avatarSource.uri.trim()
      : null;
  }, [avatarSource]);

  const opponentProfile = opponentUserId
    ? participantProfiles[opponentUserId] ?? null
    : null;
  const selfAvatarUrl = resolvedPlayerState?.avatarUrl ?? currentAvatarUri ?? null;
  const selfAvatarIcon = selfAvatarUrl ? null : avatarIcon ?? resolvedPlayerState?.avatarIcon ?? null;
  const selfAvatarSource = selfAvatarUrl
    ? null
    : avatarSource ?? getAvatarPresetSource(selfAvatarIcon);
  const selfAvatarColor =
    resolvedPlayerState?.avatarColor ?? currentAvatarColor ?? null;
  const opponentProfileAvatarUrl = isRemoteAvatarUrl(opponentProfile?.avatarUrl)
    ? opponentProfile.avatarUrl.trim()
    : null;
  const opponentAvatarUrl = opponentProfileAvatarUrl ?? opponentStateAvatarUrl ?? null;
  const opponentAvatarIcon =
    opponentAvatarUrl
      ? null
      : resolvedOpponentState?.avatarIcon ?? opponentProfile?.avatarIcon ?? null;
  const opponentAvatarSource = opponentAvatarUrl
    ? null
    : getAvatarPresetSource(opponentAvatarIcon);
  const opponentAvatarColor =
    resolvedOpponentState?.avatarColor ?? opponentProfile?.avatarColor ?? null;

  const reviewItems = useMemo(() => {
    return sortReviewItemsByIndex(answerHistory);
  }, [answerHistory]);

  const selfBaseName = useMemo(() => {
    const name =
      typeof resolvedPlayerState?.username === 'string'
        ? resolvedPlayerState.username.trim()
        : '';
    return name || t('Du');
  }, [resolvedPlayerState?.username, t]);

  const selfDisplayName =
    selfUserId &&
    routeUserId &&
    selfUserId === routeUserId &&
    selfBaseName !== t('Du')
      ? `${selfBaseName} (${t('Du')})`
      : selfBaseName;

  const opponentDisplayName = useMemo(() => {
    if (
      typeof resolvedOpponentState?.username === 'string' &&
      resolvedOpponentState.username.trim()
    ) {
      return resolvedOpponentState.username.trim();
    }
    if (opponentName && typeof opponentName === 'string') {
      return opponentName;
    }
    return t('Gegner');
  }, [opponentName, resolvedOpponentState?.username, t]);

  const opponentScoreValue = resolveScoreValue(
    resolvedOpponentState?.score,
    opponentScore
  );
  const selfScoreValue = resolveScoreValue(
    resolvedPlayerState?.score,
    score
  ) ?? 0;

  const hasOpponent = useMemo(() => {
    if (!isMultiplayer) {
      return false;
    }
    if (opponentUserId) {
      return true;
    }
    const expectedOpponentId =
      playerRole === 'guest' ? liveMatch?.host_id : liveMatch?.guest_id;
    if (expectedOpponentId) {
      return true;
    }
    if (opponentState?.userId) {
      return true;
    }
    if (typeof opponentName === 'string' && opponentName.trim()) {
      return true;
    }
    return Number.isFinite(opponentScoreValue);
  }, [
    isMultiplayer,
    liveMatch?.guest_id,
    liveMatch?.host_id,
    opponentName,
    opponentScoreValue,
    opponentState?.userId,
    opponentUserId,
    playerRole,
  ]);

  const selfPlayerKey = selfUserId ?? 'self';
  const opponentPlayerKey = opponentUserId ?? 'opponent';

  const allPlayersFinished = Boolean(
    isMultiplayer &&
      (resolvedMatchStatus === 'completed' ||
        (hasOpponent &&
          resolvedPlayerState?.finished &&
          resolvedOpponentState?.finished))
  );
  const showMultiplayerWaiting = isMultiplayer && !allPlayersFinished;

  const waitingPlayers = useMemo(() => {
    if (!isMultiplayer) {
      return [];
    }
    if (!hasOpponent) {
      if (opponentName && typeof opponentName === 'string' && opponentName.trim()) {
        return [opponentName.trim()];
      }
      return [];
    }
    const next = [];
    if (!resolvedPlayerState?.finished) {
      next.push(selfDisplayName);
    }
    if (!resolvedOpponentState?.finished) {
      next.push(opponentDisplayName);
    }
    return next;
  }, [
    hasOpponent,
    isMultiplayer,
    opponentDisplayName,
    opponentName,
    resolvedOpponentState?.finished,
    resolvedPlayerState?.finished,
    selfDisplayName,
  ]);

  const waitingPlayersLabel = waitingPlayers.length
    ? waitingPlayers.join(', ')
    : t('Spieler wird gesucht ...');

  const multiplayerQuestions = useMemo(() => {
    if (!isMultiplayer) {
      return [];
    }
    if (Array.isArray(liveQuestions) && liveQuestions.length) {
      return liveQuestions;
    }
    if (Array.isArray(liveMatch?.questions)) {
      return liveMatch.questions;
    }
    return [];
  }, [isMultiplayer, liveMatch?.questions, liveQuestions]);

  const questionMetaById = useMemo(() => {
    const map = new Map();
    multiplayerQuestions.forEach((question, index) => {
      const key = question?.id ?? `${index}`;
      const meta = { question, index };
      map.set(key, meta);
      map.set(String(key), meta);
    });
    return map;
  }, [multiplayerQuestions]);

  const mapAnswersToReview = useCallback(
    (answers = []) => {
      const source = Array.isArray(answers) ? answers : [];
      return source
        .map((entry, index) => {
          const rawQuestionId = entry?.questionId ?? `${index}`;
          const meta = getQuestionMeta(questionMetaById, rawQuestionId);
          const question = meta?.question ?? null;
          const orderIndex = Number.isFinite(meta?.index) ? meta.index : index;
          return {
            index: orderIndex,
            questionId: rawQuestionId,
            question:
              question?.question ??
              t('Frage {index}', {
                index: orderIndex + 1,
              }),
            options: Array.isArray(question?.options) ? question.options : [],
            correctAnswer: question?.correct_answer ?? null,
            selectedOption: entry?.selectedOption ?? null,
            isCorrect: Boolean(entry?.correct),
            timedOut: Boolean(entry?.timedOut),
            durationMs: Number.isFinite(entry?.durationMs) ? entry.durationMs : null,
            boostsUsed: sanitizeBoostUsage(entry?.boostsUsed),
            explanation: question?.explanation ?? null,
          };
        });
    },
    [questionMetaById, t]
  );

  const selfFallbackReviewItems = useMemo(
    () => mapAnswersToReview(resolvedPlayerState?.answers),
    [mapAnswersToReview, resolvedPlayerState?.answers]
  );

  const selfReviewItems =
    reviewItems.length > 0 ? reviewItems : selfFallbackReviewItems;

  const opponentReviewItems = useMemo(
    () => mapAnswersToReview(resolvedOpponentState?.answers),
    [mapAnswersToReview, resolvedOpponentState?.answers]
  );

  const reviewByPlayerKey = useMemo(() => {
    const map = new Map();
    map.set(selfPlayerKey, selfReviewItems);
    if (hasOpponent) {
      map.set(opponentPlayerKey, opponentReviewItems);
    }
    return map;
  }, [
    hasOpponent,
    opponentPlayerKey,
    opponentReviewItems,
    selfPlayerKey,
    selfReviewItems,
  ]);
  const selfBoostIds = useMemo(
    () => collectUsedBoostIds(selfReviewItems),
    [collectUsedBoostIds, selfReviewItems]
  );
  const opponentBoostIds = useMemo(
    () => collectUsedBoostIds(opponentReviewItems),
    [collectUsedBoostIds, opponentReviewItems]
  );

  const multiplayerEntries = useMemo(() => {
    if (!isMultiplayer) {
      return [];
    }
    const entries = [
      {
        key: selfPlayerKey,
        name: selfDisplayName,
        username: resolvedPlayerState?.username ?? null,
        title: resolvedPlayerState?.title ?? null,
        userId: selfUserId,
        score: selfScoreValue,
        isSelf: true,
        avatarSource: selfAvatarSource,
        avatarUrl: selfAvatarUrl,
        avatarIcon: selfAvatarIcon,
        avatarColor: selfAvatarColor,
        initials: getInitials(selfDisplayName),
        usedBoostIds: selfBoostIds,
      },
    ];

    if (hasOpponent) {
      entries.push({
        key: opponentPlayerKey,
        name: opponentDisplayName,
        username: resolvedOpponentState?.username ?? null,
        title: resolvedOpponentState?.title ?? null,
        userId: opponentUserId,
        score: opponentScoreValue,
        isSelf: false,
        avatarSource: opponentAvatarSource,
        avatarUrl: opponentAvatarUrl,
        avatarIcon: opponentAvatarIcon,
        avatarColor: opponentAvatarColor,
        initials: getInitials(opponentDisplayName),
        usedBoostIds: opponentBoostIds,
      });
    }

    const scoreValue = (value) => (Number.isFinite(value) ? value : -1);
    return entries
      .sort((a, b) => {
        const diff = scoreValue(b.score) - scoreValue(a.score);
        if (diff !== 0) {
          return diff;
        }
        if (a.isSelf && !b.isSelf) {
          return -1;
        }
        if (!a.isSelf && b.isSelf) {
          return 1;
        }
        return a.name.localeCompare(b.name);
      })
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
  }, [
    hasOpponent,
    isMultiplayer,
    opponentBoostIds,
    opponentAvatarColor,
    opponentAvatarIcon,
    opponentAvatarSource,
    opponentAvatarUrl,
    opponentDisplayName,
    opponentProfile?.avatarColor,
    opponentProfile?.avatarIcon,
    opponentProfile?.avatarUrl,
    opponentPlayerKey,
    opponentScoreValue,
    opponentUserId,
    resolvedOpponentState?.title,
    resolvedOpponentState?.username,
    resolvedPlayerState?.title,
    resolvedPlayerState?.username,
    selfBoostIds,
    selfAvatarColor,
    selfAvatarIcon,
    selfAvatarSource,
    selfAvatarUrl,
    selfDisplayName,
    selfPlayerKey,
    selfScoreValue,
    selfUserId,
  ]);

  const handleOpenScoreProfile = useCallback((entry) => {
    if (!entry?.userId || entry.isSelf) {
      return;
    }

    openProfile(buildPublicProfilePayload({
      userId: entry.userId,
      name: entry.name ?? t('Spieler'),
      username: entry.username ?? null,
      title: entry.title ?? null,
      avatarUrl: entry.avatarUrl ?? null,
      avatarIcon: entry.avatarIcon ?? null,
      avatarColor: entry.avatarColor ?? null,
      statusLabel: t('Lobby Ergebnis'),
    }));
  }, [openProfile, t]);

  const selectedScoreEntry = useMemo(
    () =>
      multiplayerEntries.find((entry) => entry.key === selectedScorePlayerKey) ??
      null,
    [multiplayerEntries, selectedScorePlayerKey]
  );

  const selectedReviewItems = useMemo(() => {
    if (!isMultiplayer) {
      return reviewItems;
    }
    if (!selectedScorePlayerKey) {
      return selfReviewItems;
    }
    return reviewByPlayerKey.get(selectedScorePlayerKey) ?? [];
  }, [
    isMultiplayer,
    reviewByPlayerKey,
    reviewItems,
    selectedScorePlayerKey,
    selfReviewItems,
  ]);

  const selectedReviewTitle = useMemo(() => {
    if (!isMultiplayer) {
      return null;
    }
    if (selectedScoreEntry) {
      return t('Antworten von {name}', { name: selectedScoreEntry.name });
    }
    return t('Quiz Zusammenfassung');
  }, [isMultiplayer, selectedScoreEntry, t]);

  const selectedAnswerLabel = useMemo(() => {
    if (isMultiplayer && selectedScoreEntry && !selectedScoreEntry.isSelf) {
      return t('Antwort von {name}', { name: selectedScoreEntry.name });
    }
    return t('Deine Antwort');
  }, [isMultiplayer, selectedScoreEntry, t]);

  const fallbackExistingMatch = useMemo(() => {
    if (!isMultiplayer || !matchId) {
      return null;
    }
    const selfSnapshot = {
      userId: selfUserId,
      username: resolvedPlayerState?.username ?? null,
      title: resolvedPlayerState?.title ?? null,
      score: selfScoreValue,
      finished: Boolean(resolvedPlayerState?.finished),
      answers: Array.isArray(resolvedPlayerState?.answers)
        ? resolvedPlayerState.answers
        : [],
      avatarUrl: selfAvatarUrl,
      avatarIcon: selfAvatarIcon,
      avatarColor: selfAvatarColor,
    };
    const opponentSnapshot = {
      userId: opponentUserId,
      username: resolvedOpponentState?.username ?? opponentName ?? null,
      title: resolvedOpponentState?.title ?? null,
      score: opponentScoreValue,
      finished: Boolean(resolvedOpponentState?.finished),
      answers: Array.isArray(resolvedOpponentState?.answers)
        ? resolvedOpponentState.answers
        : [],
      avatarUrl: opponentAvatarUrl,
      avatarIcon: opponentAvatarIcon,
      avatarColor: opponentAvatarColor,
    };
    const resolvedRole = playerRole === 'guest' ? 'guest' : 'host';
    const hostState = resolvedRole === 'host' ? selfSnapshot : opponentSnapshot;
    const guestState = resolvedRole === 'guest' ? selfSnapshot : opponentSnapshot;
    return {
      id: matchId,
      code: matchJoinCode ?? null,
      status: resolvedMatchStatus,
      category: liveMatch?.category ?? category ?? null,
      question_limit: liveMatch?.question_limit ?? questionLimit ?? null,
      host_id: hostState?.userId ?? null,
      guest_id: guestState?.userId ?? null,
      state: {
        host: hostState,
        guest: guestState,
      },
    };
  }, [
    isMultiplayer,
    matchId,
    matchJoinCode,
    category,
    questionLimit,
    opponentName,
    opponentAvatarColor,
    opponentAvatarIcon,
    opponentAvatarUrl,
    opponentScoreValue,
    opponentUserId,
    playerRole,
    resolvedMatchStatus,
    resolvedOpponentState?.finished,
    resolvedOpponentState?.answers,
    resolvedOpponentState?.title,
    resolvedOpponentState?.username,
    resolvedPlayerState?.answers,
    resolvedPlayerState?.title,
    resolvedPlayerState?.finished,
    resolvedPlayerState?.username,
    selfScoreValue,
    selfAvatarColor,
    selfAvatarIcon,
    selfAvatarUrl,
    liveMatch?.category,
    liveMatch?.question_limit,
    selfUserId,
  ]);

  useEffect(() => {
    if (!isMultiplayer) {
      return;
    }
    if (!multiplayerEntries.length) {
      setSelectedScorePlayerKey(null);
      return;
    }
    setSelectedScorePlayerKey((prev) => {
      if (prev && multiplayerEntries.some((entry) => entry.key === prev)) {
        return prev;
      }
      return multiplayerEntries[0].key;
    });
  }, [isMultiplayer, multiplayerEntries]);

  return {
    reviewItems,
    showMultiplayerWaiting,
    waitingPlayersLabel,
    multiplayerEntries,
    selectedScorePlayerKey,
    setSelectedScorePlayerKey,
    handleOpenScoreProfile,
    selectedReviewItems,
    selectedReviewTitle,
    selectedAnswerLabel,
    fallbackExistingMatch,
    selfScoreValue,
    opponentScoreValue,
  };
}
