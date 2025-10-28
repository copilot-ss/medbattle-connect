import { useCallback, useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabaseClient';

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

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Fehler beim Abmelden:', err);
    }
  }

  function startQuiz() {
    navigation.navigate('Quiz', {
      difficulty: selectedDifficulty,
    });
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#030712',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 40,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 32,
        }}
      >
        <Text
          style={{
            color: '#F8FAFC',
            fontSize: 32,
            fontWeight: '800',
            letterSpacing: 1,
          }}
        >
          MedBattle
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            onPress={() => navigation.navigate('Leaderboard')}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: 'rgba(96, 165, 250, 0.12)',
              borderWidth: 1,
              borderColor: 'rgba(96, 165, 250, 0.35)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: 14,
                height: 14,
                borderRadius: 4,
                backgroundColor: '#60A5FA',
              }}
            />
            <View
              style={{
                position: 'absolute',
                bottom: 10,
                width: 10,
                height: 10,
                borderRadius: 3,
                backgroundColor: '#93C5FD',
              }}
            />
            <View
              style={{
                position: 'absolute',
                bottom: 4,
                width: 6,
                height: 6,
                borderRadius: 2,
                backgroundColor: '#BFDBFE',
              }}
            />
          </Pressable>

          <Pressable
            onPress={() =>
              navigation.navigate('Settings', {
                initialSoundEnabled: soundEnabled,
              })
            }
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: 'rgba(148, 163, 184, 0.18)',
              borderWidth: 1,
              borderColor: 'rgba(148, 163, 184, 0.35)',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 16,
            }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: '#E2E8F0',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  width: 2,
                  height: 10,
                  backgroundColor: '#E2E8F0',
                  borderRadius: 1,
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  top: 3,
                  width: 2,
                  height: 2,
                  backgroundColor: '#E2E8F0',
                  borderRadius: 1,
                }}
              />
            </View>
          </Pressable>
        </View>
      </View>

      <View
        style={{
          backgroundColor: '#111827',
          borderRadius: 24,
          paddingVertical: 28,
          paddingHorizontal: 24,
          marginBottom: 28,
          borderWidth: 1,
          borderColor: 'rgba(59, 130, 246, 0.25)',
        }}
      >
        <Text
          style={{
            color: '#60A5FA',
            fontSize: 14,
            letterSpacing: 2,
            fontWeight: '600',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          Arena bereit
        </Text>
        <Text
          style={{
            color: '#F8FAFC',
            fontSize: 24,
            fontWeight: '700',
            marginBottom: 10,
          }}
        >
          Bereit fuer die naechste Battle?
        </Text>
        <Text
          style={{
            color: '#CBD5F5',
            fontSize: 15,
            lineHeight: 22,
          }}
        >
          Waehle deine Schwierigkeit, stelle dich 5 Fragen und sichere dir den
          Highscore.
        </Text>
      </View>

      <Text
        style={{
          color: '#94A3B8',
          fontSize: 14,
          marginBottom: 12,
        }}
      >
        Schwierigkeit
      </Text>

      <View style={{ gap: 14 }}>
        {DIFFICULTIES.map((mode) => {
          const isActive = mode.id === selectedDifficulty;
          const streakValue = streaks[mode.id] ?? 0;
          return (
            <Pressable
              key={mode.id}
              onPress={() => setSelectedDifficulty(mode.id)}
              style={{
                backgroundColor: '#0F172A',
                borderRadius: 18,
                paddingVertical: 16,
                paddingHorizontal: 18,
                borderWidth: 1,
                borderColor: isActive ? mode.accent : 'rgba(148, 163, 184, 0.25)',
                shadowColor: mode.accent,
                shadowOpacity: isActive ? 0.45 : 0,
                shadowRadius: isActive ? 12 : 0,
                shadowOffset: { width: 0, height: isActive ? 8 : 0 },
                elevation: isActive ? 6 : 0,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View>
                  <Text
                    style={{
                      color: '#F8FAFC',
                      fontSize: 20,
                      fontWeight: '700',
                    }}
                  >
                    {mode.title}
                  </Text>
                  <Text
                    style={{
                      color: '#94A3B8',
                      fontSize: 13,
                      marginTop: 4,
                    }}
                  >
                    {mode.description}
                  </Text>
                </View>
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 24,
                    backgroundColor: isActive ? mode.glow : 'rgba(15, 23, 42, 0.85)',
                    borderWidth: 2,
                    borderColor: mode.accent,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 10,
                    paddingHorizontal: 6,
                  }}
                >
                  <Text
                    style={{
                      color: mode.accent,
                      fontWeight: '800',
                      fontSize: 18,
                    }}
                  >
                    {streakValue}
                  </Text>
                  <Text
                    style={{
                      color: mode.accent,
                      fontSize: 14,
                      fontWeight: '700',
                      marginTop: 2,
                    }}
                  >
                    🔥
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={{ flex: 1 }} />

      <Pressable
        onPress={startQuiz}
        style={{
          backgroundColor: selectedCard?.accent ?? '#2563EB',
          paddingVertical: 18,
          borderRadius: 16,
          alignItems: 'center',
          shadowColor: selectedCard?.accent ?? '#2563EB',
          shadowOpacity: 0.45,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 8,
          marginBottom: 14,
        }}
      >
        <Text
          style={{
            color: '#0F172A',
            fontSize: 18,
            fontWeight: '800',
            letterSpacing: 0.5,
          }}
        >
          Match starten
        </Text>
      </Pressable>

      <Pressable onPress={handleSignOut} style={{ alignSelf: 'center' }}>
        <Text style={{ color: '#64748B', fontSize: 14 }}>Abmelden</Text>
      </Pressable>
    </View>
  );
}
