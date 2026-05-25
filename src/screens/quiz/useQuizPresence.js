import { useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import useSupabaseUserId from '../../hooks/useSupabaseUserId';
import { getSessionUser, supabase } from '../../lib/supabaseClient';
import { getFriendCodeForUser } from '../../services/friendsService';

export default function useQuizPresence({ matchId = null, joinCode = null } = {}) {
  const userId = useSupabaseUserId();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused || !userId) {
      return undefined;
    }

    const code = getFriendCodeForUser(userId);
    if (!code) {
      return undefined;
    }

    let cancelled = false;
    let channel = null;
    const normalizedMatchId =
      typeof matchId === 'string' && matchId.trim() ? matchId.trim() : null;
    const normalizedJoinCode =
      typeof joinCode === 'string' && joinCode.trim()
        ? joinCode.trim().toUpperCase()
        : null;

    async function attachPresence() {
      let username = 'MedQuiz';
      try {
        const user = await getSessionUser();
        if (cancelled) {
          return;
        }
        const metadata = user?.user_metadata ?? {};
        const candidate =
          metadata.username ?? metadata.full_name ?? metadata.display_name;
        if (typeof candidate === 'string' && candidate.trim()) {
          username = candidate.trim();
        }
      } catch (err) {
        console.warn('Konnte Quiz-Presence Nutzer nicht laden:', err);
      }

      if (cancelled) {
        return;
      }

      channel = supabase.channel('presence:friends', {
        config: { presence: { key: userId } },
      });

      channel.subscribe((status) => {
        if (status !== 'SUBSCRIBED') {
          return;
        }
        channel.track({
          userId,
          code,
          username,
          title: null,
          activity: 'quiz',
          lobby: null,
          matchId: normalizedMatchId,
          matchCode: normalizedJoinCode,
          lobbyPlayers: null,
          lobbyCapacity: null,
          trackedAt: Date.now(),
        }).catch((err) => {
          console.warn('Konnte Quiz-Presence nicht tracken:', err);
        });
      });
    }

    attachPresence();

    return () => {
      cancelled = true;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [isFocused, joinCode, matchId, userId]);
}
