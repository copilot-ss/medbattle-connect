import { useEffect } from 'react';

export default function useLobbyAutoCreate({
  autoCreateAttemptedRef,
  isCreateOnly,
  currentMatch,
  creating,
  loadingUser,
  userId,
  existingMatch,
  onCreateMatch,
}) {
  useEffect(() => {
    if (
      !isCreateOnly ||
      currentMatch ||
      creating ||
      loadingUser ||
      !userId ||
      existingMatch
    ) {
      return;
    }
    if (autoCreateAttemptedRef.current) {
      return;
    }

    autoCreateAttemptedRef.current = true;
    onCreateMatch();
  }, [
    autoCreateAttemptedRef,
    creating,
    currentMatch,
    existingMatch,
    isCreateOnly,
    loadingUser,
    onCreateMatch,
    userId,
  ]);

  useEffect(() => {
    if (!isCreateOnly) {
      autoCreateAttemptedRef.current = false;
    }
  }, [autoCreateAttemptedRef, isCreateOnly]);
}
