import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabaseClient';

const PROGRESS_CACHE_TTL = 60 * 1000;
const progressCache = {
  userId: null,
  fetchedAt: 0,
  data: null,
};

const PENDING_PROGRESS_KEY = 'medbattle_pending_progress';
const MAX_PENDING_PROGRESS = 50;

function sanitizeStatNumber(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }
  return 0;
}

function normalizeDelta(delta) {
  return {
    quizzes: sanitizeStatNumber(delta?.quizzes),
    correct: sanitizeStatNumber(delta?.correct),
    questions: sanitizeStatNumber(delta?.questions),
    xp: sanitizeStatNumber(delta?.xp),
  };
}

function hasDelta(delta) {
  return (
    delta.quizzes > 0 ||
    delta.correct > 0 ||
    delta.questions > 0 ||
    delta.xp > 0
  );
}

async function readPendingProgress() {
  try {
    const raw = await AsyncStorage.getItem(PENDING_PROGRESS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Konnte Fortschritts-Queue nicht lesen:', err);
    return [];
  }
}

async function writePendingProgress(entries) {
  try {
    const trimmed = Array.isArray(entries)
      ? entries.slice(-MAX_PENDING_PROGRESS)
      : [];
    await AsyncStorage.setItem(PENDING_PROGRESS_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.warn('Konnte Fortschritts-Queue nicht speichern:', err);
  }
}

export async function fetchUserProgress(userId, { force = false } = {}) {
  if (!userId || userId === 'guest') {
    return { ok: false, reason: 'guest' };
  }

  const now = Date.now();
  if (
    !force &&
    progressCache.userId === userId &&
    progressCache.fetchedAt &&
    now - progressCache.fetchedAt < PROGRESS_CACHE_TTL
  ) {
    return { ok: true, progress: progressCache.data };
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('xp, quizzes, correct, questions')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    const progress = {
      xp: sanitizeStatNumber(data?.xp),
      quizzes: sanitizeStatNumber(data?.quizzes),
      correct: sanitizeStatNumber(data?.correct),
      questions: sanitizeStatNumber(data?.questions),
    };

    progressCache.userId = userId;
    progressCache.fetchedAt = Date.now();
    progressCache.data = progress;

    return { ok: true, progress };
  } catch (err) {
    return { ok: false, error: err };
  }
}

export async function incrementUserProgress(userId, delta) {
  if (!userId || userId === 'guest') {
    return { ok: false, reason: 'guest' };
  }

  const normalized = normalizeDelta(delta);
  if (!hasDelta(normalized)) {
    return { ok: true, skipped: true };
  }

  try {
    const { error } = await supabase.rpc('increment_user_progress', {
      p_user_id: userId,
      p_quizzes: normalized.quizzes,
      p_correct: normalized.correct,
      p_questions: normalized.questions,
      p_xp: normalized.xp,
    });

    if (error) {
      throw error;
    }

    progressCache.userId = userId;
    progressCache.fetchedAt = Date.now();
    if (progressCache.data) {
      progressCache.data = {
        xp: sanitizeStatNumber(progressCache.data.xp) + normalized.xp,
        quizzes: sanitizeStatNumber(progressCache.data.quizzes) + normalized.quizzes,
        correct: sanitizeStatNumber(progressCache.data.correct) + normalized.correct,
        questions: sanitizeStatNumber(progressCache.data.questions) + normalized.questions,
      };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err };
  }
}

export async function queueUserProgressDelta(userId, delta) {
  if (!userId || userId === 'guest') {
    return { ok: false, reason: 'guest' };
  }

  const normalized = normalizeDelta(delta);
  if (!hasDelta(normalized)) {
    return { ok: true, skipped: true };
  }

  const pending = await readPendingProgress();
  pending.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId,
    delta: normalized,
    createdAt: new Date().toISOString(),
  });
  await writePendingProgress(pending);
  return { ok: true, queued: true };
}

export async function syncUserProgressDelta(userId, delta, { offline = false } = {}) {
  if (!userId || userId === 'guest') {
    return { ok: false, reason: 'guest' };
  }
  if (offline) {
    return queueUserProgressDelta(userId, delta);
  }

  const result = await incrementUserProgress(userId, delta);
  if (!result.ok) {
    await queueUserProgressDelta(userId, delta);
    return { ok: false, queued: true, error: result.error };
  }
  return result;
}

export async function flushQueuedProgress(userId) {
  if (!userId || userId === 'guest') {
    return { ok: false, reason: 'guest' };
  }

  const pending = await readPendingProgress();
  if (!pending.length) {
    return { ok: true, flushed: 0 };
  }

  const remaining = [];
  const aggregate = {
    quizzes: 0,
    correct: 0,
    questions: 0,
    xp: 0,
  };
  let matched = 0;

  pending.forEach((entry) => {
    if (entry?.userId !== userId) {
      remaining.push(entry);
      return;
    }
    matched += 1;
    const delta = normalizeDelta(entry?.delta ?? {});
    aggregate.quizzes += delta.quizzes;
    aggregate.correct += delta.correct;
    aggregate.questions += delta.questions;
    aggregate.xp += delta.xp;
  });

  if (!matched) {
    return { ok: true, flushed: 0, remaining: pending.length };
  }

  const result = await incrementUserProgress(userId, aggregate);
  if (!result.ok) {
    return { ok: false, remaining: pending.length, error: result.error };
  }

  await writePendingProgress(remaining);
  return { ok: true, flushed: matched, remaining: remaining.length };
}
