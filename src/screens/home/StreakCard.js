import { memo, useMemo } from 'react';
import { Image, Text, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/HomeScreen.styles';

const STREAK_ICON_STATIC = require('../../../assets/icons/flaticon/hingabe_14251500.png');
const STREAK_ICON_ANIMATED = require('../../../assets/icons/flaticon/hingabe_14251500.gif');
const STREAK_MILESTONES = [7, 30];

function StreakCard({ streakValue = 0 }) {
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

  return (
    <View style={styles.streakCard}>
      <View style={styles.streakHeader}>
        <View style={styles.streakCopy}>
          <Text style={styles.streakTitle}>{streakSummary.title}</Text>
          <Text style={styles.streakSubtitle}>{streakSummary.subtitle}</Text>
        </View>
        <View style={styles.streakIconWrap}>
          <Image
            source={hasStreak ? STREAK_ICON_ANIMATED : STREAK_ICON_STATIC}
            style={styles.streakIconImage}
          />
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
