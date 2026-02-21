import { useMemo } from 'react';
import { deriveFriendCode } from '../../../services/friendsService';

export default function useLobbyVisibleOpenMatches({
  openMatches,
  isJoinOnly,
  friends,
}) {
  const friendCodeSet = useMemo(
    () => new Set((friends ?? []).map((item) => item?.code).filter(Boolean)),
    [friends]
  );

  return useMemo(() => {
    if (!isJoinOnly) {
      return openMatches;
    }

    return (openMatches ?? []).filter((match) => {
      if (!match?.hostId) {
        return false;
      }
      const hostCode = deriveFriendCode(match.hostId);
      return Boolean(hostCode) && friendCodeSet.has(hostCode);
    });
  }, [friendCodeSet, isJoinOnly, openMatches]);
}
