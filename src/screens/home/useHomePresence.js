import { useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { supabase } from '../../lib/supabaseClient';
import { getFriendCodeForUser } from '../../services/friendsService';

export default function useHomePresence({
  userId,
  userName,
  userTitle,
}) {
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused || !userId) {
      return undefined;
    }

    const code = getFriendCodeForUser(userId);
    if (!code) {
      return undefined;
    }

    const channel = supabase.channel('presence:friends', {
      config: { presence: { key: userId } },
    });

    channel.subscribe((status) => {
      if (status !== 'SUBSCRIBED') {
        return;
      }
      channel.track({
        userId,
        code,
        username: userName || 'MedBattle',
        title: userTitle ?? null,
        activity: 'online',
        lobby: null,
        lobbyPlayers: null,
        lobbyCapacity: null,
      }).catch((err) => {
        console.warn('Konnte Home-Presence nicht tracken:', err);
      });
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isFocused, userId, userName, userTitle]);
}
