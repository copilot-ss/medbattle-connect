import { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';

const BADGES = [
  {
    min: 0,
    max: 49,
    title: 'Med Rookie',
    subtitle: 'Noch ein Versuch und du kletterst ins Mittelfeld!',
    color: '#F97316',
    glow: '#FB923C',
  },
  {
    min: 50,
    max: 79,
    title: 'Knowledge Handler',
    subtitle: 'Starke Leistung! Hol dir jetzt einen Platz in der Top 10.',
    color: '#38BDF8',
    glow: '#0EA5E9',
  },
  {
    min: 80,
    max: 94,
    title: 'Surgery Ace',
    subtitle: 'Fast makellos - noch ein Run fuer den Legendenstatus.',
    color: '#22C55E',
    glow: '#4ADE80',
    spotlight: true,
  },
  {
    min: 95,
    max: 100,
    title: 'Legendary Medic',
    subtitle: 'Absolute Spitzenklasse. Teile deinen Triumph!',
    color: '#FACC15',
    glow: '#FDE047',
    spotlight: true,
  },
];

function findBadge(percentage) {
  const normalized = Math.max(0, Math.min(percentage, 100));
  return (
    BADGES.find((badge) => normalized >= badge.min && normalized <= badge.max) ??
    BADGES[0]
  );
}

function Sparkle({ size, top, left, opacity, rotate = '0deg', color }) {
  return (
    <View
      style={{
        position: 'absolute',
        top,
        left,
        width: size,
        height: size,
        transform: [{ rotate }],
        opacity,
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: '45%',
          left: 0,
          right: 0,
          height: size * 0.2,
          backgroundColor: color,
          borderRadius: size * 0.1,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: '45%',
          top: 0,
          bottom: 0,
          width: size * 0.2,
          backgroundColor: color,
          borderRadius: size * 0.1,
        }}
      />
    </View>
  );
}

function StatPill({ label, value }) {
  return (
    <View
      style={{
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: 'rgba(148, 163, 184, 0.12)',
        marginHorizontal: 6,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: '#CBD5F5', fontSize: 12 }}>{label}</Text>
      <Text style={{ color: '#FFFFFF', fontWeight: '600', marginTop: 2 }}>
        {value}
      </Text>
    </View>
  );
}

export default function ResultScreen({ route, navigation }) {
  const {
    score = 0,
    total = 0,
    userId = null,
    difficulty = 'Mittel',
    difficultyKey = 'mittel',
    questionLimit = total,
  } = route.params ?? {};

  const totalQuestions = total || questionLimit || 0;
  const percentage = useMemo(() => {
    if (!totalQuestions) {
      return 0;
    }
    return Math.round((score / totalQuestions) * 100);
  }, [score, totalQuestions]);

  const badge = useMemo(() => findBadge(percentage), [percentage]);
  const accuracyValue = Math.max(0, Math.min(percentage, 100));

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#0B1120',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 32,
      }}
    >
      <View
        style={{
          position: 'absolute',
          width: 320,
          height: 320,
          borderRadius: 160,
          backgroundColor: badge.glow,
          opacity: 0.2,
          top: -60,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: 260,
          height: 260,
          borderRadius: 130,
          backgroundColor: '#2563EB',
          opacity: 0.18,
          bottom: -80,
          right: -40,
        }}
      />

      <Sparkle size={36} top={120} left={36} opacity={0.35} rotate="25deg" color={badge.glow} />
      <Sparkle size={24} top={80} left={280} opacity={0.28} rotate="-10deg" color="#60A5FA" />
      <Sparkle size={32} top={380} left={300} opacity={0.3} rotate="45deg" color="#34D399" />
      <Sparkle size={28} top={420} left={44} opacity={0.26} rotate="-30deg" color="#FCD34D" />

      <View
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 28,
          paddingVertical: 28,
          paddingHorizontal: 24,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          borderWidth: 1,
          borderColor: 'rgba(148, 163, 184, 0.18)',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: badge.color,
            paddingVertical: 10,
            paddingHorizontal: 24,
            borderRadius: 999,
            marginBottom: 18,
          }}
        >
          <Text
            style={{
              color: '#0F172A',
              fontSize: 14,
              fontWeight: '700',
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            {badge.title}
          </Text>
        </View>

        <Text
          style={{
            fontSize: 32,
            fontWeight: '800',
            color: '#F8FAFF',
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          {percentage >= 95 ? 'Legendary Win!' : 'MedBattle abgeschlossen'}
        </Text>

        <Text
          style={{
            fontSize: 16,
            color: '#CBD5F5',
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          {badge.subtitle}
        </Text>

        <View
          style={{
            width: '100%',
            borderRadius: 20,
            paddingVertical: 20,
            paddingHorizontal: 18,
            backgroundColor: 'rgba(30, 64, 175, 0.25)',
            borderWidth: 1,
            borderColor: 'rgba(59, 130, 246, 0.4)',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginBottom: 14,
            }}
          >
            <StatPill label="Score" value={`${score}/${totalQuestions}`} />
            <StatPill label="Trefferquote" value={`${accuracyValue}%`} />
            <StatPill label="Level" value={difficulty} />
          </View>

          <View
            style={{
              height: 12,
              borderRadius: 6,
              backgroundColor: 'rgba(148, 163, 184, 0.2)',
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${accuracyValue}%`,
                backgroundColor: badge.color,
              }}
            />
          </View>
        </View>

        <Pressable
          onPress={() =>
            navigation.replace('Quiz', { difficulty: difficultyKey })
          }
          style={{
            marginTop: 28,
            width: '100%',
            backgroundColor: badge.color,
            paddingVertical: 16,
            borderRadius: 16,
            alignItems: 'center',
            shadowColor: badge.color,
            shadowOpacity: 0.45,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,
          }}
        >
          <Text style={{ color: '#0F172A', fontSize: 18, fontWeight: '700' }}>
            Naechste Challenge
          </Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('Leaderboard')}
          style={{
            width: '100%',
            paddingVertical: 14,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: 'rgba(148, 163, 184, 0.35)',
            alignItems: 'center',
            marginTop: 14,
          }}
        >
          <Text style={{ color: '#E0E7FF', fontSize: 16, fontWeight: '600' }}>
            Rangliste checken
          </Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('Home')}
          style={{ marginTop: 16 }}
        >
          <Text style={{ color: '#94A3B8', fontSize: 14 }}>Zurueck zur Basis</Text>
        </Pressable>
      </View>

      {badge.spotlight ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            width: '70%',
            height: 120,
            top: 90,
            borderRadius: 60,
            backgroundColor: 'rgba(250, 204, 21, 0.16)',
            transform: [{ rotate: '-5deg' }],
          }}
        />
      ) : null}
    </View>
  );
}
