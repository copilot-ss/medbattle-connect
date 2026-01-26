import { memo, useMemo } from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/theme';
import styles from '../styles/HomeScreen.styles';

const STREAK_MILESTONES = [7, 30];

function StreakCard({ streakValue = 0 }) {
  const streakSummary = useMemo(() => {
    const safeValue = Number.isFinite(streakValue) ? Math.max(0, streakValue) : 0;
    const nextTarget =
      STREAK_MILESTONES.find((target) => safeValue < target) ?? null;
    const progress = nextTarget ? Math.min(safeValue / nextTarget, 1) : 1;
    const progressPercent = Math.round(progress * 100);

    return {
      safeValue,
      progressPercent,
      title: safeValue > 0 ? `Streak ${safeValue}` : 'Start your streak',
      subtitle:
        safeValue > 0 ? 'Keep it going.' : 'Win quizzes to build it.',
      progressLabel: nextTarget
        ? `${safeValue}/${nextTarget} to next badge`
        : 'Legend status unlocked',
    };
  }, [streakValue]);

  return (
    <View style={styles.streakCard}>
      <View style={styles.streakHeader}>
        <View style={styles.streakCopy}>
          <Text style={styles.streakTitle}>{streakSummary.title}</Text>
          <Text style={styles.streakSubtitle}>{streakSummary.subtitle}</Text>
        </View>
        <View style={styles.streakIconWrap}>
          <Ionicons name="flame" size={18} color={colors.accentWarm} />
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
