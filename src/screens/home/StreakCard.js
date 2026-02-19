import { memo, useMemo } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../i18n/useTranslation';
import { colors } from '../../styles/theme';
import styles from '../styles/HomeScreen.styles';
const STREAK_MILESTONES = [7, 30];
const STREAK_FLAME_ANIMATION = require('../../../assets/animations/streak/flame.gif');
const STREAK_FLAME_LOW_ANIMATION = require('../../../assets/animations/streak/flame_low.gif');
const STREAK_GLOW_STOPS = [
  { step: 0, color: '#FFB25C' },
  { step: 3, color: '#FF915C' },
  { step: 6, color: '#FF6B5C' },
  { step: 8, color: '#FF4B4B' },
  { step: 10, color: '#FF2D2D' },
];

const clampNumber = (value, min, max) => Math.min(max, Math.max(min, value));

const hexToRgb = (hex) => {
  const cleaned = hex.replace('#', '');
  const full = cleaned.length === 3 ? cleaned.split('').map((c) => `${c}${c}`).join('') : cleaned;
  const int = parseInt(full, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
};

const rgbToHex = ({ r, g, b }) =>
  `#${[r, g, b]
    .map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0'))
    .join('')}`;

const mixHex = (fromHex, toHex, amount) => {
  const from = hexToRgb(fromHex);
  const to = hexToRgb(toHex);
  const mix = clampNumber(amount, 0, 1);
  return rgbToHex({
    r: from.r + (to.r - from.r) * mix,
    g: from.g + (to.g - from.g) * mix,
    b: from.b + (to.b - from.b) * mix,
  });
};

const getStreakGlowStyle = (value) => {
  const step = clampNumber(Math.round(value), 0, 10);
  if (step === 0) {
    return null;
  }
  let stopIndex = 0;
  for (let index = 0; index < STREAK_GLOW_STOPS.length - 1; index += 1) {
    if (step <= STREAK_GLOW_STOPS[index + 1].step) {
      stopIndex = index;
      break;
    }
  }
  const from = STREAK_GLOW_STOPS[stopIndex];
  const to = STREAK_GLOW_STOPS[stopIndex + 1] ?? from;
  const phaseRange = Math.max(1, to.step - from.step);
  const phaseProgress = clampNumber((step - from.step) / phaseRange, 0, 1);
  const glowColor = mixHex(from.color, to.color, phaseProgress);
  const intensity = step / 10;

  return {
    borderColor: glowColor,
    shadowColor: glowColor,
    shadowOpacity: 0.18 + 0.35 * intensity,
    shadowRadius: 16 + 12 * intensity,
    elevation: 4 + Math.round(6 * intensity),
  };
};

function StreakCard({
  streakValue = 0,
  streakShieldCount = 0,
  streakShieldActive = false,
  onToggleStreakShield,
}) {
  const { t } = useTranslation();

  const streakSummary = useMemo(() => {
    const safeValue = Number.isFinite(streakValue) ? Math.max(0, streakValue) : 0;
    const nextTarget =
      STREAK_MILESTONES.find((target) => safeValue < target) ?? null;
    const progress = nextTarget ? Math.min(safeValue / nextTarget, 1) : 1;
    const progressPercent = Math.round(progress * 100);

    return {
      safeValue,
      progressPercent,
      title: safeValue > 0 ? t('Streak {count}', { count: safeValue }) : t('Streak starten'),
      subtitle:
        safeValue > 0 ? t('Weiter so!') : t('Gewinne Quizze, um sie aufzubauen.'),
      progressLabel: nextTarget
        ? t('{current}/{target} bis zum nächsten Badge', {
            current: safeValue,
            target: nextTarget,
          })
        : t('Legend-Status freigeschaltet'),
    };
  }, [streakValue, t]);
  const hasStreak = streakSummary.safeValue > 0;
  const showFlameAnimation = streakSummary.safeValue >= 10;
  const showFlameLowAnimation =
    streakSummary.safeValue >= 1 && streakSummary.safeValue < 10;
  const flameName = hasStreak ? 'flame' : 'flame-outline';
  const flameColor = hasStreak ? colors.accentWarm : colors.textMuted;
  const flameSize = hasStreak ? 44 : 24;
  const resolvedShieldCount = Number.isFinite(streakShieldCount)
    ? Math.max(0, streakShieldCount)
    : 0;
  const hasShield = resolvedShieldCount > 0;
  const shieldDisabled = !hasShield || !onToggleStreakShield || streakShieldActive;
  const shieldButtonLabel = !hasShield
    ? t('Kein Schild')
    : streakShieldActive
    ? t('Aktiv')
    : t('Aktivieren');

  const streakGlowStyle = useMemo(
    () => getStreakGlowStyle(streakSummary.safeValue),
    [streakSummary.safeValue]
  );

  return (
    <View style={[styles.streakCard, streakGlowStyle]}>
      <View style={styles.streakHeader}>
        <View style={styles.streakCopy}>
          <View style={styles.streakTitleRow}>
            <Text style={styles.streakTitle}>{streakSummary.title}</Text>
            <Pressable
              onPress={onToggleStreakShield}
              disabled={shieldDisabled}
              style={[
                styles.streakShieldButton,
                streakShieldActive ? styles.streakShieldButtonActive : null,
                shieldDisabled ? styles.streakShieldButtonDisabled : null,
              ]}
            >
              <Ionicons
                name="shield-checkmark"
                size={12}
                color={streakShieldActive ? '#0A0A12' : colors.accentWarm}
              />
              <Text
                style={[
                  styles.streakShieldButtonText,
                  streakShieldActive ? styles.streakShieldButtonTextActive : null,
                ]}
              >
                {shieldButtonLabel}
              </Text>
            </Pressable>
          </View>
          <Text style={styles.streakSubtitle}>{streakSummary.subtitle}</Text>
        </View>
        <View style={styles.streakIconWrap}>
          {showFlameAnimation ? (
            <Image source={STREAK_FLAME_ANIMATION} style={styles.streakIconImage} />
          ) : showFlameLowAnimation ? (
            <Image source={STREAK_FLAME_LOW_ANIMATION} style={styles.streakIconImage} />
          ) : (
            <Ionicons name={flameName} size={flameSize} color={flameColor} />
          )}
        </View>
      </View>
      <View style={styles.streakProgressTrack}>
        <View
          style={[
            styles.streakProgressFill,
            { width: `${streakSummary.progressPercent}%` },
          ]}
        />
      </View>
      <Text style={styles.streakProgressText}>{streakSummary.progressLabel}</Text>
    </View>
  );
}

export default memo(StreakCard);
