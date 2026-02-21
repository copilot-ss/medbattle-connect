import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildPublicProfilePayload } from '../../../utils/publicProfile';
import { getInitials } from '../resultUtils';

export default function useResultMultiplayerData({
  isMultiplayer,
  matchId,
  matchStatus,
  matchJoinCode,
  playerRole,
  userId,
  score,
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

  const reviewItems = useMemo(() => {
    const source = Array.isArray(answerHistory) ? answerHistory : [];
    return source.slice().sort((a, b) => {
      const indexA = Number.isFinite(a?.index) ? a.index : 0;
      const indexB = Number.isFinite(b?.index) ? b.index : 0;
      return indexA - indexB;
    });
  }, [answerHistory]);

  const selfBaseName = useMemo(() => {
    const name =
      typeof resolvedPlayerState?.username === 'string'
        ? resolvedPlayerState.username.trim()
        : '';
    return name || t('Du');
  }, [resolvedPlayerState?.username, t]);

  const selfDisplayName =
    resolvedPlayerState?.userId &&
    userId &&
    resolvedPlayerState.userId === userId &&
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

  const opponentScoreValue = Number.isFinite(resolvedOpponentState?.score)
    ? resolvedOpponentState.score
    : Number.isFinite(opponentScore)
      ? opponentScore
      : null;

  const selfScoreValue = Number.isFinite(resolvedPlayerState?.score)
    ? resolvedPlayerState.score
    : score;

  const hasOpponent = useMemo(() => {
    if (!isMultiplayer) {
      return false;
    }
    if (resolvedOpponentState?.userId) {
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
    playerRole,
    resolvedOpponentState?.userId,
  ]);

  const selfPlayerKey = resolvedPlayerState?.userId ?? userId ?? 'self';
  const opponentPlayerKey = resolvedOpponentState?.userId ?? 'opponent';

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
          const meta =
            questionMetaById.get(rawQuestionId) ??
            questionMetaById.get(String(rawQuestionId)) ??
            null;
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
            explanation: question?.explanation ?? null,
          };
        })
        .sort((a, b) => {
          const indexA = Number.isFinite(a?.index) ? a.index : 0;
          const indexB = Number.isFinite(b?.index) ? b.index : 0;
          return indexA - indexB;
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
        userId: resolvedPlayerState?.userId ?? userId ?? null,
        score: Number.isFinite(selfScoreValue) ? selfScoreValue : 0,
        isSelf: true,
        avatarSource,
        avatarUrl: resolvedPlayerState?.avatarUrl ?? null,
        avatarIcon,
        avatarColor:
          resolvedPlayerState?.avatarColor ?? currentAvatarColor ?? null,
        initials: getInitials(selfDisplayName),
      },
    ];

    if (hasOpponent) {
      entries.push({
        key: opponentPlayerKey,
        name: opponentDisplayName,
        username: resolvedOpponentState?.username ?? null,
        title: resolvedOpponentState?.title ?? null,
        userId: resolvedOpponentState?.userId ?? null,
        score: Number.isFinite(opponentScoreValue) ? opponentScoreValue : null,
        isSelf: false,
        avatarSource: resolvedOpponentState?.avatarUrl
          ? { uri: resolvedOpponentState.avatarUrl }
          : null,
        avatarUrl: resolvedOpponentState?.avatarUrl ?? null,
        avatarIcon: resolvedOpponentState?.avatarIcon ?? null,
        avatarColor: resolvedOpponentState?.avatarColor ?? null,
        initials: getInitials(opponentDisplayName),
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
    avatarIcon,
    avatarSource,
    currentAvatarColor,
    hasOpponent,
    isMultiplayer,
    opponentDisplayName,
    opponentPlayerKey,
    opponentScoreValue,
    resolvedOpponentState?.avatarColor,
    resolvedOpponentState?.avatarIcon,
    resolvedOpponentState?.avatarUrl,
    resolvedOpponentState?.title,
    resolvedOpponentState?.userId,
    resolvedOpponentState?.username,
    resolvedPlayerState?.avatarColor,
    resolvedPlayerState?.avatarUrl,
    resolvedPlayerState?.title,
    resolvedPlayerState?.userId,
    resolvedPlayerState?.username,
    selfDisplayName,
    selfPlayerKey,
    selfScoreValue,
    userId,
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
      statusLabel: 'Lobby Ergebnis',
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

  const selectedReviewTitle = isMultiplayer
    ? selectedScoreEntry
      ? t('Antworten von {name}', { name: selectedScoreEntry.name })
      : t('Quiz Zusammenfassung')
    : null;

  const selectedAnswerLabel =
    isMultiplayer && selectedScoreEntry && !selectedScoreEntry.isSelf
      ? t('Antwort von {name}', { name: selectedScoreEntry.name })
      : t('Deine Antwort');

  const fallbackExistingMatch = useMemo(() => {
    if (!isMultiplayer || !matchId) {
      return null;
    }
    const selfSnapshot = {
      userId: resolvedPlayerState?.userId ?? userId ?? null,
      username: resolvedPlayerState?.username ?? null,
      score: Number.isFinite(selfScoreValue) ? selfScoreValue : score,
      finished: Boolean(resolvedPlayerState?.finished),
    };
    const opponentSnapshot = {
      userId: resolvedOpponentState?.userId ?? null,
      username: resolvedOpponentState?.username ?? opponentName ?? null,
      score: Number.isFinite(opponentScoreValue) ? opponentScoreValue : null,
      finished: Boolean(resolvedOpponentState?.finished),
    };
    const resolvedRole = playerRole === 'guest' ? 'guest' : 'host';
    const hostState = resolvedRole === 'host' ? selfSnapshot : opponentSnapshot;
    const guestState = resolvedRole === 'guest' ? selfSnapshot : opponentSnapshot;
    return {
      id: matchId,
      code: matchJoinCode ?? null,
      status: resolvedMatchStatus,
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
    opponentName,
    opponentScoreValue,
    playerRole,
    resolvedMatchStatus,
    resolvedOpponentState?.finished,
    resolvedOpponentState?.userId,
    resolvedOpponentState?.username,
    resolvedPlayerState?.finished,
    resolvedPlayerState?.userId,
    resolvedPlayerState?.username,
    score,
    selfScoreValue,
    userId,
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
    resolvedPlayerState,
    resolvedOpponentState,
    resolvedMatchStatus,
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
  };
}
