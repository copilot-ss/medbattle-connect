import { useCallback, useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabaseClient';
import styles from './styles/HomeScreen.styles';

const DIFFICULTIES = [
  {
    id: 'leicht',
    title: 'Leicht',
    description: 'Locker aufwaermen',
    accent: '#34D399',
    glow: 'rgba(52, 211, 153, 0.35)',
  },
  {
    id: 'mittel',
    title: 'Mittel',
    description: 'Balance aus Tempo & Wissen',
    accent: '#60A5FA',
    glow: 'rgba(96, 165, 250, 0.35)',
  },
  {
    id: 'schwer',
    title: 'Schwer',
    description: 'Nur fuer echte Pros',
    accent: '#F97316',
    glow: 'rgba(249, 115, 22, 0.35)',
  },
];

const STREAK_STORAGE_KEYS = {
  leicht: 'medbattle_streak_leicht',
  mittel: 'medbattle_streak_mittel',
  schwer: 'medbattle_streak_schwer',
};

const DEFAULT_STREAKS = {
  leicht: 0,
  mittel: 0,
  schwer: 0,
};

export default function HomeScreen({ navigation }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState('mittel');
  const [selectedMode, setSelectedMode] = useState('campaign');
  const [soundEnabled, setSoundEnabled] = useState(
    typeof globalThis.__medbattleSound === 'boolean'
      ? globalThis.__medbattleSound
      : true
  );
  const [streaks, setStreaks] = useState(() => {
    const globalStreaks =
      typeof globalThis.__medbattleStreaks === 'object' &&
      globalThis.__medbattleStreaks !== null
        ? globalThis.__medbattleStreaks
        : DEFAULT_STREAKS;
    return { ...DEFAULT_STREAKS, ...globalStreaks };
  });

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function syncPreferences() {
        try {
          const storedSound = await AsyncStorage.getItem(
            'medbattle_sound_enabled'
          );
          if (storedSound !== null) {
            const parsed = storedSound === 'true';
            globalThis.__medbattleSound = parsed;
            if (active) {
              setSoundEnabled(parsed);
            }
          } else if (typeof globalThis.__medbattleSound === 'boolean') {
            setSoundEnabled(globalThis.__medbattleSound);
          }
        } catch (err) {
          console.warn('Konnte Sound-Einstellung nicht laden:', err);
        }

        try {
          const globalStreaks =
            typeof globalThis.__medbattleStreaks === 'object' &&
            globalThis.__medbattleStreaks !== null
              ? globalThis.__medbattleStreaks
              : DEFAULT_STREAKS;

          const resolved = { ...DEFAULT_STREAKS, ...globalStreaks };

          await Promise.all(
            Object.entries(STREAK_STORAGE_KEYS).map(async ([difficulty, key]) => {
              try {
                const raw = await AsyncStorage.getItem(key);
                const parsed = raw ? parseInt(raw, 10) : null;
                if (Number.isFinite(parsed) && parsed >= 0) {
                  resolved[difficulty] = parsed;
                }
              } catch (streakErr) {
                console.warn(
                  `Konnte Streak fuer ${difficulty} nicht laden:`,
                  streakErr
                );
              }
            })
          );

          if (active) {
            setStreaks(resolved);
          }
          globalThis.__medbattleStreaks = resolved;
        } catch (err) {
          console.warn('Konnte Streak nicht laden:', err);
        }
      }

      syncPreferences();

      return () => {
        active = false;
      };
    }, [])
  );

  const selectedCard = useMemo(
    () => DIFFICULTIES.find((item) => item.id === selectedDifficulty),
    [selectedDifficulty]
  );
  const isCampaign = selectedMode === 'campaign';

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Fehler beim Abmelden:', err);
    }
  }

  function handleCampaignPress() {
    setSelectedMode('campaign');
  }

  function handleCreateLobby() {
    navigation.navigate('MultiplayerLobby', {
      difficulty: selectedDifficulty,
      mode: 'create',
    });
  }

  function handleJoinLobby() {
    navigation.navigate('MultiplayerLobby', {
      difficulty: selectedDifficulty,
      mode: 'join',
    });
  }

  function startCampaign() {
    navigation.navigate('Quiz', {
      difficulty: selectedDifficulty,
    });
  }

  function openMultiplayerLobby() {
    navigation.navigate('MultiplayerLobby', {
      difficulty: selectedDifficulty,
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MedBattle</Text>

        <View style={styles.quickActions}>
          <Pressable
            onPress={() => navigation.navigate('Leaderboard')}
            style={styles.leaderboardButton}
          >
            <View style={styles.leaderboardDotLarge} />
            <View style={styles.leaderboardDotMedium} />
            <View style={styles.leaderboardDotSmall} />
          </Pressable>

          <Pressable
            onPress={() =>
              navigation.navigate('Settings', {
                initialSoundEnabled: soundEnabled,
              })
            }
            style={styles.settingsButton}
          >
            <View style={styles.settingsOuter}>
              <View style={styles.settingsNeedle} />
              <View style={styles.settingsPivot} />
            </View>
          </Pressable>
        </View>
      </View>

      <View style={styles.arenaCard}>
        <Text style={styles.arenaLabel}>Arena bereit</Text>
        <Text style={styles.arenaTitle}>Waehle deinen Spielmodus</Text>
        <Text style={styles.arenaDescription}>
          Hoste ein Live-Duell, tritt einer Lobby bei oder trainiere solo in der Campaign.
        </Text>
      </View>

      <Text style={styles.sectionLabel}>Modi</Text>

      <View style={styles.modeList}>
        <Pressable onPress={handleCreateLobby} style={[styles.modeCard, styles.modeCardHost]}>
          <Text style={styles.modeCardTitle}>Create Lobby</Text>
          <Text style={styles.modeCardSubtitle}>
            Starte ein Duell und teile den Match-Code mit deiner Crew.
          </Text>
        </Pressable>

        <Pressable onPress={handleJoinLobby} style={[styles.modeCard, styles.modeCardJoin]}>
          <Text style={styles.modeCardTitle}>Join Lobby</Text>
          <Text style={styles.modeCardSubtitle}>
            Match-Code eingeben oder offene Lobbys durchstoebern.
          </Text>
        </Pressable>

        <Pressable
          onPress={handleCampaignPress}
          style={[
            styles.modeCard,
            styles.modeCardCampaign,
            isCampaign ? styles.modeCardActive : styles.modeCardInactive,
            isCampaign && selectedCard
              ? {
                  borderColor: selectedCard.accent,
                  shadowColor: selectedCard.accent,
                }
              : null,
          ]}
        >
          <Text style={styles.modeCardTitle}>Campaign</Text>
          <Text style={styles.modeCardSubtitle}>
            Solo-Run mit Supabase Fragen und deinem persönlichen Streak.
          </Text>
        </Pressable>
      </View>

      {isCampaign ? (
        <>
          <Text style={styles.sectionLabel}>Schwierigkeit</Text>

          <View style={styles.difficultyList}>
            {DIFFICULTIES.map((mode, indexItem) => {
              const isActive = mode.id === selectedDifficulty;
              const streakValue = streaks[mode.id] ?? 0;
              const isLast = indexItem === DIFFICULTIES.length - 1;

              return (
                <Pressable
                  key={mode.id}
                  onPress={() => setSelectedDifficulty(mode.id)}
                  style={[
                    styles.difficultyCard,
                    isLast ? styles.difficultyCardLast : null,
                    isActive ? styles.difficultyCardActive : styles.difficultyCardInactive,
                    isActive
                      ? {
                          borderColor: mode.accent,
                          shadowColor: mode.accent,
                        }
                      : null,
                  ]}
                >
                  <View style={styles.difficultyRow}>
                    <View>
                      <Text style={styles.difficultyTitle}>{mode.title}</Text>
                      <Text style={styles.difficultyDescription}>{mode.description}</Text>
                    </View>
                    <View
                      style={[
                        styles.streakBadge,
                        {
                          borderColor: mode.accent,
                          backgroundColor: isActive ? mode.glow : 'rgba(15, 23, 42, 0.85)',
                        },
                      ]}
                    >
                      <Text style={[styles.streakValue, { color: mode.accent }]}>{streakValue}</Text>
                      <Text style={[styles.streakLabel, { color: mode.accent }]}>Streak</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={startCampaign}
            style={[
              styles.startButton,
              selectedCard
                ? {
                    backgroundColor: selectedCard.accent,
                    shadowColor: selectedCard.accent,
                  }
                : null,
            ]}
          >
            <Text style={styles.startButtonText}>Campaign starten</Text>
          </Pressable>
        </>
      ) : null}

      <View style={styles.flexSpacer} />

      <Pressable onPress={handleSignOut} style={styles.signOutButton}>
        <Text style={styles.signOutText}>Abmelden</Text>
      </Pressable>
    </View>
  );
}


