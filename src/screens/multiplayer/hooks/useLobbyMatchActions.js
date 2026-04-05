import useLobbyCreateAndStartActions from './useLobbyCreateAndStartActions';
import useLobbyJoinActions from './useLobbyJoinActions';
import useLobbyLeaveActions from './useLobbyLeaveActions';

export default function useLobbyMatchActions({
  userId,
  t,
  language,
  navigation,
  isCreateOnly,
  currentMatch,
  setCurrentMatch,
  existingMatch,
  attachMatchSubscription,
  refreshMatches,
  selectedCategory,
  questionLimit,
  setSelectedCategory,
  setQuestionLimit,
  setMatchesError,
  closingRef,
  skipAutoCloseRef,
  canStartFromLobby,
}) {
  const {
    creating,
    startingMatch,
    handleCreateMatch,
    handleStartMatch,
  } = useLobbyCreateAndStartActions({
    userId,
    t,
    language,
    isCreateOnly,
    currentMatch,
    setCurrentMatch,
    existingMatch,
    attachMatchSubscription,
    refreshMatches,
    selectedCategory,
    questionLimit,
    setSelectedCategory,
    setQuestionLimit,
    setMatchesError,
    closingRef,
    canStartFromLobby,
  });

  const {
    joinCode,
    setJoinCode,
    joining,
    handleJoinByCode,
    handleJoinQuick,
  } = useLobbyJoinActions({
    userId,
    t,
    isCreateOnly,
    attachMatchSubscription,
    refreshMatches,
    setCurrentMatch,
    setMatchesError,
  });

  const {
    closingLobby,
    showLeaveConfirm,
    handleLeaveLobby,
    handleConfirmLeave,
    handleCancelLeave,
    handleNavigateHome,
  } = useLobbyLeaveActions({
    currentMatch,
    userId,
    navigation,
    setCurrentMatch,
    setMatchesError,
    closingRef,
    skipAutoCloseRef,
  });

  return {
    joinCode,
    setJoinCode,
    creating,
    joining,
    closingLobby,
    startingMatch,
    showLeaveConfirm,
    handleCreateMatch,
    handleJoinByCode,
    handleJoinQuick,
    handleLeaveLobby,
    handleConfirmLeave,
    handleCancelLeave,
    handleNavigateHome,
    handleStartMatch,
  };
}
