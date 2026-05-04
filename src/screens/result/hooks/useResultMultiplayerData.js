import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildPublicProfilePayload } from '../../../utils/publicProfile';
import { getInitials } from '../resultUtils';
import { sanitizeBoostUsage } from '../../../utils/quizBoosts';
import { fetchPublicProfileByUserId } from '../../../services/userService';
import {
  getAvatarPresetSource,
  isRemoteAvatarUrl,
} from '../../../utils/avatarUtils';
import {
  getMatchPlayerEntries,
  getMatchPlayerRoleOrder,
} from '../../../services/match/matchHelpers';

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

function getQuestionKey(item, fallbackIndex = 0) {
  const key = item?.questionId ?? item?.id ?? item?.index ?? fallbackIndex;
  return String(key);
}

function findMatchingReviewItem(items, targetItem, targetIndex) {
  const source = Array.isArray(items) ? items : [];
  const targetKey = getQuestionKey(targetItem, targetIndex);
  const targetOrder = getReviewOrderIndex(targetItem);

  return source.find((candidate, candidateIndex) => {
    if (getQuestionKey(candidate, candidateIndex) === targetKey) {
      return true;
    }
    return getReviewOrderIndex(candidate) === targetOrder;
  }) ?? null;
}

function getDisplayName(playerState, fallback) {
  const name =
    typeof playerState?.username === 'string' ? playerState.username.trim() : '';
  return name || fallback;
}

function buildFallbackPlayerEntries({
  playerRole,
  playerState,
  opponentState,
  matchStateSnapshot,
}) {
  const snapshotEntries = getMatchPlayerEntries(matchStateSnapshot);
  if (snapshotEntries.length) {
    return snapshotEntries;
  }

  const selfRole = playerRole || 'host';
  const opponentRole = selfRole === 'host' ? 'guest' : 'host';
  return [
    playerState
      ? { role: selfRole, state: playerState }
      : null,
    opponentState
      ? { role: opponentRole, state: opponentState }
      : null,
  ].filter((entry) => entry?.state);
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
  matchStateSnapshot,
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

  const resolvedMatchStatus =
    liveMatch?.status ?? liveMatchStatus ?? matchStatus ?? null;
  const routeUserId = useMemo(
    () => normalizeUserId(userId),
    [userId]
  );
  const resolvedPlayerEntries = useMemo(() => {
    if (!isMultiplayer) {
      return [];
    }
    const liveEntries = getMatchPlayerEntries(liveMatch);
    if (liveEntries.length) {
      return liveEntries;
    }
    return buildFallbackPlayerEntries({
      playerRole,
      playerState,
      opponentState,
      matchStateSnapshot,
    });
  }, [
    isMultiplayer,
    liveMatch,
    matchStateSnapshot,
    opponentState,
    playerRole,
    playerState,
  ]);
  const selfPlayerEntry = useMemo(() => {
    return (
      resolvedPlayerEntries.find((entry) => (
        normalizeUserId(entry?.state?.userId) === routeUserId
      )) ??
      resolvedPlayerEntries.find((entry) => entry.role === playerRole) ??
      null
    );
  }, [playerRole, resolvedPlayerEntries, routeUserId]);
  const opponentPlayerEntries = useMemo(
    () => resolvedPlayerEntries.filter((entry) => entry !== selfPlayerEntry),
    [resolvedPlayerEntries, selfPlayerEntry]
  );
  const resolvedPlayerState = selfPlayerEntry?.state ?? (
    liveMatch ? livePlayerState ?? null : playerState ?? null
  );
  const resolvedOpponentState =
    opponentPlayerEntries[0]?.state ??
    (liveMatch ? liveOpponentState ?? null : opponentState ?? null);
  const selfUserId = normalizeUserId(resolvedPlayerState?.userId) ?? routeUserId;
  const profileTargetUserIds = useMemo(() => {
    return Array.from(
      new Set(
        opponentPlayerEntries
          .map((entry) => normalizeUserId(entry?.state?.userId))
          .filter(Boolean)
      )
    );
  }, [opponentPlayerEntries]);

  useEffect(() => {
    const missingUserIds = profileTargetUserIds.filter(
      (participantUserId) =>
        !Object.prototype.hasOwnProperty.call(participantProfiles, participantUserId)
    );

    if (missingUserIds.length === 0) {
      return undefined;
    }

    let active = true;

    (async () => {
      const entries = await Promise.all(
        missingUserIds.map(async (participantUserId) => {
          let nextProfile = null;
          try {
            const result = await fetchPublicProfileByUserId(participantUserId);
            nextProfile = result?.ok ? result.profile ?? null : null;
          } catch {
            nextProfile = null;
          }
          return [participantUserId, nextProfile];
        })
      );

      if (!active) {
        return;
      }

      setParticipantProfiles((prev) => {
        const next = { ...prev };
        entries.forEach(([participantUserId, profile]) => {
          next[participantUserId] = profile;
        });
        return next;
      });
    })();

    return () => {
      active = false;
    };
  }, [
    participantProfiles,
    profileTargetUserIds,
  ]);

  const currentAvatarUri = useMemo(() => {
    if (!avatarSource || typeof avatarSource !== 'object' || Array.isArray(avatarSource)) {
      return null;
    }
    return typeof avatarSource.uri === 'string' && avatarSource.uri.trim()
      ? avatarSource.uri.trim()
      : null;
  }, [avatarSource]);

  const selfAvatarUrl = resolvedPlayerState?.avatarUrl ?? currentAvatarUri ?? null;
  const selfAvatarIcon = selfAvatarUrl ? null : avatarIcon ?? resolvedPlayerState?.avatarIcon ?? null;
  const selfAvatarSource = selfAvatarUrl
    ? null
    : avatarSource ?? getAvatarPresetSource(selfAvatarIcon);
  const selfAvatarColor =
    resolvedPlayerState?.avatarColor ?? currentAvatarColor ?? null;

  const playerPresentationEntries = useMemo(() => {
    const entries = resolvedPlayerEntries.length
      ? resolvedPlayerEntries
      : [
          resolvedPlayerState
            ? { role: playerRole ?? 'host', state: resolvedPlayerState }
            : null,
          resolvedOpponentState
            ? { role: playerRole === 'host' ? 'guest' : 'host', state: resolvedOpponentState }
            : null,
        ].filter(Boolean);

    return entries
      .slice()
      .sort((a, b) => getMatchPlayerRoleOrder(a.role) - getMatchPlayerRoleOrder(b.role))
      .map((entry) => {
        const entryUserId = normalizeUserId(entry?.state?.userId);
        const isSelf = Boolean(entryUserId && entryUserId === selfUserId);
        const profile = !isSelf && entryUserId
          ? participantProfiles[entryUserId] ?? null
          : null;
        const stateAvatarUrl = isRemoteAvatarUrl(entry?.state?.avatarUrl)
          ? entry.state.avatarUrl.trim()
          : null;
        const profileAvatarUrl = isRemoteAvatarUrl(profile?.avatarUrl)
          ? profile.avatarUrl.trim()
          : null;
        const resolvedAvatarUrl = isSelf
          ? selfAvatarUrl
          : profileAvatarUrl ?? stateAvatarUrl ?? null;
        const resolvedAvatarIcon = resolvedAvatarUrl
          ? null
          : isSelf
            ? selfAvatarIcon
            : entry?.state?.avatarIcon ?? profile?.avatarIcon ?? null;
        return {
          role: entry.role,
          state: entry.state,
          userId: entryUserId,
          key: entryUserId ?? entry.role,
          isSelf,
          name: getDisplayName(entry.state, isSelf ? t('Spieler') : opponentName ?? t('Gegner')),
          avatarUrl: resolvedAvatarUrl,
          avatarSource: resolvedAvatarUrl
            ? null
            : isSelf
              ? selfAvatarSource
              : getAvatarPresetSource(resolvedAvatarIcon),
          avatarIcon: resolvedAvatarIcon,
          avatarColor: isSelf
            ? selfAvatarColor
            : entry?.state?.avatarColor ?? profile?.avatarColor ?? null,
        };
      });
  }, [
    opponentName,
    participantProfiles,
    playerRole,
    resolvedOpponentState,
    resolvedPlayerEntries,
    resolvedPlayerState,
    selfAvatarColor,
    selfAvatarIcon,
    selfAvatarSource,
    selfAvatarUrl,
    selfUserId,
    t,
  ]);

  const reviewItems = useMemo(() => {
    return sortReviewItemsByIndex(answerHistory);
  }, [answerHistory]);

  const selfScoreValue = resolveScoreValue(
    resolvedPlayerState?.score,
    score
  ) ?? 0;
  const opponentScoreValue = useMemo(() => {
    const scores = playerPresentationEntries
      .filter((entry) => !entry.isSelf)
      .map((entry) => resolveScoreValue(entry.state?.score))
      .filter(Number.isFinite);
    if (scores.length) {
      return Math.max(...scores);
    }
    return resolveScoreValue(resolvedOpponentState?.score, opponentScore);
  }, [
    opponentScore,
    playerPresentationEntries,
    resolvedOpponentState?.score,
  ]);

  const hasOpponent = useMemo(() => {
    if (!isMultiplayer) {
      return false;
    }
    if (playerPresentationEntries.some((entry) => !entry.isSelf)) {
      return true;
    }
    if (typeof opponentName === 'string' && opponentName.trim()) {
      return true;
    }
    return Number.isFinite(opponentScoreValue);
  }, [
    isMultiplayer,
    opponentName,
    opponentScoreValue,
    playerPresentationEntries,
  ]);

  const selfPlayerKey = selfUserId ?? 'self';

  const allPlayersFinished = Boolean(
    isMultiplayer &&
      (resolvedMatchStatus === 'completed' ||
        (hasOpponent &&
          playerPresentationEntries.length > 1 &&
          playerPresentationEntries.every((entry) => entry.state?.finished)))
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
    return playerPresentationEntries
      .filter((entry) => !entry.state?.finished)
      .map((entry) => entry.name);
  }, [
    hasOpponent,
    isMultiplayer,
    opponentName,
    playerPresentationEntries,
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
            imageSource: question?.image_asset ?? question?.imageSource ?? null,
            imageUrl: question?.image_url ?? question?.imageUrl ?? null,
            imageAlt: question?.image_alt ?? question?.imageAlt ?? null,
            imageOnly:
              question?.image_only === true ||
              question?.imageOnly === true ||
              question?.prompt_mode === 'image_only' ||
              question?.promptMode === 'image_only',
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

  const reviewByPlayerKey = useMemo(() => {
    const map = new Map();
    playerPresentationEntries.forEach((entry) => {
      map.set(
        entry.key,
        entry.isSelf ? selfReviewItems : mapAnswersToReview(entry.state?.answers)
      );
    });
    if (!map.has(selfPlayerKey)) {
      map.set(selfPlayerKey, selfReviewItems);
    }
    return map;
  }, [
    mapAnswersToReview,
    playerPresentationEntries,
    selfPlayerKey,
    selfReviewItems,
  ]);

  const multiplayerEntries = useMemo(() => {
    if (!isMultiplayer) {
      return [];
    }
    const entries = playerPresentationEntries.map((entry) => ({
      key: entry.key,
      name: entry.name,
      username: entry.state?.username ?? null,
      title: entry.state?.title ?? null,
      userId: entry.userId,
      score: resolveScoreValue(
        entry.isSelf ? resolvedPlayerState?.score : entry.state?.score,
        entry.isSelf ? score : null
      ),
      isSelf: entry.isSelf,
      avatarSource: entry.avatarSource,
      avatarUrl: entry.avatarUrl,
      avatarIcon: entry.avatarIcon,
      avatarColor: entry.avatarColor,
      initials: getInitials(entry.name),
      usedBoostIds: collectUsedBoostIds(reviewByPlayerKey.get(entry.key)),
    }));
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
    collectUsedBoostIds,
    isMultiplayer,
    playerPresentationEntries,
    resolvedPlayerState?.score,
    reviewByPlayerKey,
    score,
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
    const activePlayerKey = selectedScorePlayerKey ?? selfPlayerKey;
    const activeItems = reviewByPlayerKey.get(activePlayerKey) ?? [];

    if (!allPlayersFinished) {
      return activeItems;
    }

    return activeItems.map((item, index) => {
      const otherPlayerAnswers = multiplayerEntries
        .filter((entry) => entry.key !== activePlayerKey)
        .map((entry) => {
          const matchingReviewItem = findMatchingReviewItem(
            reviewByPlayerKey.get(entry.key),
            item,
            index
          );

          if (!matchingReviewItem) {
            return null;
          }

          return {
            key: entry.key,
            name: entry.name,
            selectedOption: matchingReviewItem.timedOut
              ? t('Zeit abgelaufen')
              : matchingReviewItem.selectedOption ?? t('Keine Antwort'),
            isCorrect: Boolean(matchingReviewItem.isCorrect),
            timedOut: Boolean(matchingReviewItem.timedOut),
          };
        })
        .filter(Boolean);

      return {
        ...item,
        otherPlayerAnswers,
      };
    });
  }, [
    allPlayersFinished,
    isMultiplayer,
    multiplayerEntries,
    reviewByPlayerKey,
    reviewItems,
    selectedScorePlayerKey,
    selfPlayerKey,
    selfReviewItems,
    t,
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
    const nextState = playerPresentationEntries.reduce((acc, entry) => {
      acc[entry.role] = {
        userId: entry.userId,
        username: entry.state?.username ?? null,
        title: entry.state?.title ?? null,
        score: resolveScoreValue(entry.state?.score, entry.isSelf ? selfScoreValue : null),
        finished: Boolean(entry.state?.finished),
        answers: Array.isArray(entry.state?.answers) ? entry.state.answers : [],
        avatarUrl: entry.avatarUrl ?? null,
        avatarIcon: entry.avatarIcon ?? null,
        avatarColor: entry.avatarColor ?? null,
      };
      return acc;
    }, {});
    if (!nextState.host && resolvedPlayerState) {
      nextState.host = {
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
    }
    if (!nextState.guest) {
      nextState.guest = {
        userId: null,
        username: null,
        title: null,
        score: 0,
        finished: false,
        answers: [],
        avatarUrl: null,
        avatarIcon: null,
        avatarColor: null,
      };
    }
    return {
      id: matchId,
      code: matchJoinCode ?? null,
      status: resolvedMatchStatus,
      category: liveMatch?.category ?? category ?? null,
      question_limit: liveMatch?.question_limit ?? questionLimit ?? null,
      host_id: nextState.host?.userId ?? null,
      guest_id: nextState.guest?.userId ?? null,
      state: nextState,
    };
  }, [
    category,
    isMultiplayer,
    questionLimit,
    liveMatch?.category,
    liveMatch?.question_limit,
    matchId,
    matchJoinCode,
    playerPresentationEntries,
    resolvedPlayerState?.answers,
    resolvedPlayerState?.finished,
    resolvedPlayerState?.title,
    resolvedPlayerState?.username,
    selfAvatarColor,
    selfAvatarIcon,
    selfAvatarUrl,
    selfScoreValue,
    selfUserId,
    resolvedMatchStatus,
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
