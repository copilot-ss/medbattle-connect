import { useEffect, useState } from 'react';
import { fetchFriends } from '../../../services/friendsService';

export default function useLobbyFriends(userId) {
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadFriends() {
      if (!userId) {
        setFriends([]);
        setFriendsLoading(false);
        return;
      }

      setFriendsLoading(true);
      try {
        const result = await fetchFriends(userId);
        if (active) {
          setFriends(Array.isArray(result) ? result : []);
        }
      } catch (err) {
        if (active) {
          console.warn('Freunde konnten nicht geladen werden:', err);
        }
      } finally {
        if (active) {
          setFriendsLoading(false);
        }
      }
    }

    loadFriends();

    return () => {
      active = false;
    };
  }, [userId]);

  return { friends, friendsLoading };
}
