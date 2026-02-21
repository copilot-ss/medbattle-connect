import LobbyJoinCodeForm from './LobbyJoinCodeForm';
import LobbyOpenMatchesList from './LobbyOpenMatchesList';

export default function LobbyJoinSection({
  isCreateOnly,
  isJoinOnly,
  joinCode,
  onChangeJoinCode,
  onJoinByCode,
  onJoinPressIn,
  onJoinPressOut,
  joinPressStyle,
  joining,
  matchesLoading,
  openMatches,
  onRefreshMatches,
  onJoinQuick,
  difficultyLabel,
}) {
  if (isCreateOnly) {
    return null;
  }

  return (
    <>
      <LobbyOpenMatchesList
        matchesLoading={matchesLoading}
        openMatches={openMatches}
        onRefreshMatches={onRefreshMatches}
        onJoinQuick={onJoinQuick}
        difficultyLabel={difficultyLabel}
      />
      <LobbyJoinCodeForm
        joinCode={joinCode}
        onChangeJoinCode={onChangeJoinCode}
        onJoinByCode={onJoinByCode}
        onJoinPressIn={onJoinPressIn}
        onJoinPressOut={onJoinPressOut}
        joinPressStyle={joinPressStyle}
        joining={joining}
        isJoinOnly={isJoinOnly}
      />
    </>
  );
}
