import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../i18n/useTranslation';
import { getTitleProgress } from '../../services/titleService';
import styles from '../styles/SettingsScreen.styles';

const CLAIM_PROGRESS_MIN_DURATION = 1400;
const CLAIM_PROGRESS_MAX_DURATION = 3200;
const CLAIM_PROGRESS_STEP_MIN_DURATION = 220;
const CLAIM_PROGRESS_RESET_DURATION = 90;
const CLAIM_END_HOLD_MS = 700;

const clampNumber = (value, min, max) => {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
};

const sanitizeNonNegative = (value, fallback = 0) => {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(0, value);
};

const resolveProgress = (xp) =>
  clampNumber(getTitleProgress(sanitizeNonNegative(xp))?.progress ?? 0, 0, 1);

const buildClaimProgressSegments = ({ fromXp, toXp }) => {
  const safeFromXp = sanitizeNonNegative(fromXp);
  const safeToXp = sanitizeNonNegative(toXp, safeFromXp);
  const fromProgress = resolveProgress(safeFromXp);
  const toProgress = resolveProgress(safeToXp);

  if (safeToXp <= safeFromXp) {
    return {
      fromProgress,
      toProgress,
      segments: [{ toValue: toProgress, duration: 640 }],
      duration: 640,
    };
  }

  const totalGain = safeToXp - safeFromXp;
  const baseDuration = clampNumber(
    Math.round(1320 + totalGain * 0.2),
    CLAIM_PROGRESS_MIN_DURATION,
    CLAIM_PROGRESS_MAX_DURATION
  );
  const segments = [];
  let cursorXp = safeFromXp;
  let guard = 0;

  while (cursorXp < safeToXp && guard < 24) {
    guard += 1;
    const cursorTier = getTitleProgress(cursorXp);
    const tierStartXp = sanitizeNonNegative(cursorTier?.current?.minXp, cursorXp);
    const tierEndXp = Number.isFinite(cursorTier?.next?.minXp)
      ? cursorTier.next.minXp
      : null;

    if (!tierEndXp || tierEndXp <= cursorXp) {
      const remainingGain = safeToXp - cursorXp;
      const remainingRatio = remainingGain / totalGain;
      segments.push({
        toValue: toProgress,
        duration: Math.max(
          CLAIM_PROGRESS_STEP_MIN_DURATION,
          Math.round(baseDuration * remainingRatio)
        ),
      });
      cursorXp = safeToXp;
      break;
    }

    const segmentEndXp = Math.min(safeToXp, tierEndXp);
    const segmentGain = Math.max(0, segmentEndXp - cursorXp);
    if (segmentGain <= 0) {
      cursorXp += 1;
      continue;
    }

    const segmentRatio = segmentGain / totalGain;
    const hitsTierBoundary = segmentEndXp === tierEndXp && safeToXp > tierEndXp;
    const segmentProgress = hitsTierBoundary
      ? 1
      : clampNumber(
          (segmentEndXp - tierStartXp) / Math.max(1, tierEndXp - tierStartXp),
          0,
          1
        );

    segments.push({
      toValue: segmentProgress,
      duration: Math.max(
        CLAIM_PROGRESS_STEP_MIN_DURATION,
        Math.round(baseDuration * segmentRatio)
      ),
    });

    if (hitsTierBoundary) {
      segments.push({
        toValue: 0,
        duration: CLAIM_PROGRESS_RESET_DURATION,
      });
    }

    cursorXp = segmentEndXp;
  }

  if (!segments.length) {
    segments.push({
      toValue: toProgress,
      duration: CLAIM_PROGRESS_STEP_MIN_DURATION,
    });
  }

  return {
    fromProgress,
    toProgress,
    segments,
    duration: segments.reduce((sum, segment) => sum + segment.duration, 0),
  };
};

const formatThousands = (value) => {
  const numeric = Number.parseInt(value, 10);
  if (!Number.isFinite(numeric)) {
    return '0';
  }
  return String(numeric).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export default function ClaimRewardTopBar({
  userLevel = 1,
  avatarInitials = '?',
  currentAvatar = null,
  avatarUri = null,
  xp = 0,
  coins = 0,
  energy = 0,
  energyMax = null,
  claimRewardAnimation = null,
  onClaimRewardAnimationEnd,
}) {
  const { t } = useTranslation();
  const avatarImageSource = avatarUri ? { uri: avatarUri } : currentAvatar?.source;
  const avatarIconName = !avatarUri ? currentAvatar?.icon : null;
  const levelLabel = t('Level {level}', { level: userLevel });
  const currentTitleProgress = getTitleProgress(xp);
  const currentProgress = Number.isFinite(currentTitleProgress?.progress)
    ? clampNumber(currentTitleProgress.progress, 0, 1)
    : 0;

  const [showClaimHeader, setShowClaimHeader] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(currentProgress);
  const [animatedCoins, setAnimatedCoins] = useState(coins);
  const progressAnim = useRef(new Animated.Value(currentProgress)).current;
  const coinsAnim = useRef(new Animated.Value(coins)).current;
  const runningClaimIdRef = useRef(null);
  const energyLabel = useMemo(() => {
    const resolvedEnergy = Number.isFinite(energy) ? Math.max(0, energy) : 0;
    const resolvedEnergyMax =
      Number.isFinite(energyMax) && energyMax > 0 ? energyMax : null;
    return resolvedEnergyMax
      ? `${resolvedEnergy}/${resolvedEnergyMax}`
      : `${resolvedEnergy}`;
  }, [energy, energyMax]);
  const animatedProgressWidth = `${Math.round(
    Math.min(Math.max(animatedProgress, 0), 1) * 100
  )}%`;

  useEffect(() => {
    if (showClaimHeader) {
      return;
    }
    setAnimatedCoins(coins);
    setAnimatedProgress(currentProgress);
    coinsAnim.setValue(coins);
    progressAnim.setValue(currentProgress);
  }, [coins, coinsAnim, currentProgress, progressAnim, showClaimHeader]);

  useEffect(() => {
    const claimId = claimRewardAnimation?.id;
    if (!claimId || runningClaimIdRef.current === claimId) {
      return undefined;
    }

    runningClaimIdRef.current = claimId;
    const fromXp = Number.isFinite(claimRewardAnimation?.fromXp)
      ? Math.max(0, claimRewardAnimation.fromXp)
      : xp;
    const toXp = Number.isFinite(claimRewardAnimation?.toXp)
      ? Math.max(0, claimRewardAnimation.toXp)
      : xp;
    const fromCoins = Number.isFinite(claimRewardAnimation?.fromCoins)
      ? Math.max(0, claimRewardAnimation.fromCoins)
      : coins;
    const toCoins = Number.isFinite(claimRewardAnimation?.toCoins)
      ? Math.max(0, claimRewardAnimation.toCoins)
      : coins;
    const { fromProgress, toProgress, segments, duration } =
      buildClaimProgressSegments({
        fromXp,
        toXp,
      });
    setShowClaimHeader(true);
    setAnimatedCoins(fromCoins);
    setAnimatedProgress(fromProgress);
    coinsAnim.setValue(fromCoins);
    progressAnim.setValue(fromProgress);

    const progressListenerId = progressAnim.addListener(({ value }) => {
      setAnimatedProgress(Math.min(Math.max(value, 0), 1));
    });
    const coinsListenerId = coinsAnim.addListener(({ value }) => {
      setAnimatedCoins(Math.max(0, Math.round(value)));
    });

    const progressMotion = Animated.sequence(
      segments.map((segment) =>
        Animated.timing(progressAnim, {
          toValue: segment.toValue,
          duration: segment.duration,
          easing:
            segment.toValue === 0
              ? Easing.linear
              : Easing.out(Easing.cubic),
          useNativeDriver: false,
        })
      )
    );

    const coinsMotion = Animated.timing(coinsAnim, {
      toValue: toCoins,
      duration: Math.max(1100, Math.round(duration * 0.96)),
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });

    let endTimeoutId = null;
    const motion = Animated.parallel([progressMotion, coinsMotion]);
    motion.start(({ finished }) => {
      progressAnim.removeListener(progressListenerId);
      coinsAnim.removeListener(coinsListenerId);
      if (!finished) {
        return;
      }
      setAnimatedProgress(toProgress);
      setAnimatedCoins(toCoins);
      endTimeoutId = setTimeout(() => {
        setShowClaimHeader(false);
        onClaimRewardAnimationEnd?.();
      }, CLAIM_END_HOLD_MS);
    });

    return () => {
      if (endTimeoutId) {
        clearTimeout(endTimeoutId);
      }
      progressAnim.stopAnimation();
      coinsAnim.stopAnimation();
      progressAnim.removeListener(progressListenerId);
      coinsAnim.removeListener(coinsListenerId);
    };
  }, [
    claimRewardAnimation?.id,
    claimRewardAnimation?.fromCoins,
    claimRewardAnimation?.fromXp,
    claimRewardAnimation?.toCoins,
    claimRewardAnimation?.toXp,
    coinsAnim,
    onClaimRewardAnimationEnd,
    progressAnim,
  ]);

  if (!showClaimHeader) {
    return null;
  }

  return (
    <View style={styles.profileClaimTopRow}>
      <View style={styles.profileClaimHeader}>
        <View style={styles.profileClaimQuickAccess}>
          <View
            style={[
              styles.profileClaimAvatarFrame,
              currentAvatar?.color ? { borderColor: currentAvatar.color } : null,
            ]}
          >
            <View
              style={[
                styles.profileClaimAvatarCircle,
                currentAvatar?.color
                  ? { backgroundColor: `${currentAvatar.color}33` }
                  : null,
              ]}
            >
              {avatarImageSource ? (
                <Image
                  source={avatarImageSource}
                  style={styles.profileClaimAvatarImage}
                  resizeMode="cover"
                />
              ) : avatarIconName ? (
                <Ionicons
                  name={avatarIconName}
                  size={16}
                  color={currentAvatar?.color || '#CBEAFF'}
                />
              ) : (
                <Text style={styles.profileClaimAvatarInitials}>{avatarInitials}</Text>
              )}
            </View>
          </View>
          <View style={styles.profileClaimProgressBlock}>
            <Text style={styles.profileClaimLevelText}>{levelLabel}</Text>
            <View style={styles.profileClaimProgressTrack}>
              <View
                style={[
                  styles.profileClaimProgressFill,
                  { width: animatedProgressWidth },
                  currentAvatar?.color ? { backgroundColor: currentAvatar.color } : null,
                ]}
              />
            </View>
          </View>
        </View>
        <View style={styles.profileClaimBadges}>
          <View style={styles.profileClaimCoinBadge}>
            <Text style={styles.profileClaimCoinEmoji}>{'\u{1FA99}'}</Text>
            <Text style={styles.profileClaimCoinText}>{formatThousands(animatedCoins)}</Text>
          </View>
          <View style={styles.profileClaimEnergyBadge}>
            <Text style={styles.profileClaimEnergyEmoji}>{'\u26A1'}</Text>
            <Text style={styles.profileClaimEnergyText}>{energyLabel}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
