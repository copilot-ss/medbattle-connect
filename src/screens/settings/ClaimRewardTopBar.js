import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Text, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import { getTitleLevel, getTitleProgress } from '../../services/titleService';
import styles from '../styles/SettingsScreen.styles';

const BlurModule = (() => {
  try {
    return require('expo-blur');
  } catch (_error) {
    return null;
  }
})();
const NativeBlurView = BlurModule?.BlurView ?? null;

const CLAIM_COUNTER_MIN_DURATION = 1200;
const CLAIM_COUNTER_MAX_DURATION = 2600;
const CLAIM_OVERLAY_ENTER_MS = 220;
const CLAIM_OVERLAY_EXIT_MS = 320;
const CLAIM_END_HOLD_MS = 180;
const CLAIM_BAR_BASE_HEIGHT = 12;
const CLAIM_BAR_MAX_HEIGHT = 30;
const CLAIM_SECTION_STAGGER_MS = 95;

const formatThousands = (value) => {
  const numeric = Number.parseInt(value, 10);
  if (!Number.isFinite(numeric)) {
    return '0';
  }
  return String(numeric).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export default function ClaimRewardTopBar({
  userLevel = 1,
  xp = 0,
  coins = 0,
  blurTargetRef = null,
  claimRewardAnimation = null,
  onClaimRewardAnimationEnd,
}) {
  const { t } = useTranslation();
  const [showClaimOverlay, setShowClaimOverlay] = useState(false);
  const [animatedLevel, setAnimatedLevel] = useState(userLevel);
  const [animatedCoins, setAnimatedCoins] = useState(coins);
  const [animatedXp, setAnimatedXp] = useState(xp);
  const [rewardXpGain, setRewardXpGain] = useState(0);
  const [rewardCoinsGain, setRewardCoinsGain] = useState(0);
  const [progressBarHeight, setProgressBarHeight] = useState(CLAIM_BAR_BASE_HEIGHT);
  const overlayOpacityAnim = useRef(new Animated.Value(0)).current;
  const cardOpacityAnim = useRef(new Animated.Value(0)).current;
  const cardScaleAnim = useRef(new Animated.Value(0.72)).current;
  const levelAnim = useRef(new Animated.Value(userLevel)).current;
  const coinsAnim = useRef(new Animated.Value(coins)).current;
  const xpAnim = useRef(new Animated.Value(xp)).current;
  const progressAnim = useRef(
    new Animated.Value(getTitleProgress(xp).progress)
  ).current;
  const progressScaleAnim = useRef(new Animated.Value(1)).current;
  const badgeScaleAnim = useRef(new Animated.Value(0.86)).current;
  const headingOpacityAnim = useRef(new Animated.Value(0)).current;
  const headingTranslateAnim = useRef(new Animated.Value(12)).current;
  const rewardsOpacityAnim = useRef(new Animated.Value(0)).current;
  const rewardsTranslateAnim = useRef(new Animated.Value(14)).current;
  const metaOpacityAnim = useRef(new Animated.Value(0)).current;
  const metaTranslateAnim = useRef(new Animated.Value(16)).current;
  const runningClaimIdRef = useRef(null);
  const safeLiveLevel = Number.isFinite(userLevel) ? Math.max(1, userLevel) : 1;
  const safeLiveCoins = Number.isFinite(coins) ? Math.max(0, coins) : 0;
  const safeLiveXp = Number.isFinite(xp) ? Math.max(0, xp) : 0;
  const safeLiveProgress = getTitleProgress(safeLiveXp).progress;
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  const canUseNativeBlur =
    NativeBlurView != null &&
    (Platform.OS !== 'android' || blurTargetRef != null);

  useEffect(() => {
    if (showClaimOverlay) {
      return;
    }
    setAnimatedLevel(safeLiveLevel);
    setAnimatedCoins(safeLiveCoins);
    setAnimatedXp(safeLiveXp);
    setRewardXpGain(0);
    setRewardCoinsGain(0);
    setProgressBarHeight(CLAIM_BAR_BASE_HEIGHT);
    levelAnim.setValue(safeLiveLevel);
    coinsAnim.setValue(safeLiveCoins);
    xpAnim.setValue(safeLiveXp);
    progressAnim.setValue(safeLiveProgress);
    progressScaleAnim.setValue(1);
    badgeScaleAnim.setValue(0.86);
    headingOpacityAnim.setValue(0);
    headingTranslateAnim.setValue(12);
    rewardsOpacityAnim.setValue(0);
    rewardsTranslateAnim.setValue(14);
    metaOpacityAnim.setValue(0);
    metaTranslateAnim.setValue(16);
  }, [
    badgeScaleAnim,
    coinsAnim,
    headingOpacityAnim,
    headingTranslateAnim,
    levelAnim,
    metaOpacityAnim,
    metaTranslateAnim,
    progressAnim,
    progressScaleAnim,
    rewardsOpacityAnim,
    rewardsTranslateAnim,
    safeLiveCoins,
    safeLiveLevel,
    safeLiveProgress,
    safeLiveXp,
    showClaimOverlay,
    xpAnim,
  ]);

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
    const fromLevel = Math.max(1, getTitleLevel(fromXp));
    const toLevel = Math.max(1, getTitleLevel(toXp));
    const rewardXp = Math.max(0, toXp - fromXp);
    const rewardCoins = Math.max(0, toCoins - fromCoins);
    const fromProgress = getTitleProgress(fromXp).progress;
    const toProgress = getTitleProgress(toXp).progress;
    const levelJump = Math.max(0, toLevel - fromLevel);
    const normalizedFromProgress =
      levelJump > 0 && toProgress < fromProgress ? 0 : fromProgress;
    const xpImpact = Math.min(1, rewardXp / 3000);
    const gainMagnitude = rewardXp + Math.abs(toCoins - fromCoins) * 0.4 + levelJump * 900;
    const counterDuration = Math.min(
      CLAIM_COUNTER_MAX_DURATION,
      Math.max(CLAIM_COUNTER_MIN_DURATION, Math.round(1180 + gainMagnitude * 0.58))
    );
    const peakCardScale = Math.min(
      1.34,
      1.08 + xpImpact * 0.2 + Math.min(levelJump * 0.05, 0.16)
    );
    const peakProgressScale = Math.min(
      1.58,
      1.1 + xpImpact * 0.36 + Math.min(levelJump * 0.08, 0.22)
    );
    const nextBarHeight = Math.max(
      CLAIM_BAR_BASE_HEIGHT,
      Math.min(
        CLAIM_BAR_MAX_HEIGHT,
        Math.round(CLAIM_BAR_BASE_HEIGHT + xpImpact * 12 + Math.min(levelJump, 2) * 3)
      )
    );

    setShowClaimOverlay(true);
    setAnimatedLevel(fromLevel);
    setAnimatedCoins(fromCoins);
    setAnimatedXp(fromXp);
    setRewardXpGain(rewardXp);
    setRewardCoinsGain(rewardCoins);
    setProgressBarHeight(nextBarHeight);
    overlayOpacityAnim.setValue(0);
    cardOpacityAnim.setValue(0);
    cardScaleAnim.setValue(0.72);
    levelAnim.setValue(fromLevel);
    coinsAnim.setValue(fromCoins);
    xpAnim.setValue(fromXp);
    progressAnim.setValue(normalizedFromProgress);
    progressScaleAnim.setValue(0.94);
    badgeScaleAnim.setValue(0.86);
    headingOpacityAnim.setValue(0);
    headingTranslateAnim.setValue(12);
    rewardsOpacityAnim.setValue(0);
    rewardsTranslateAnim.setValue(14);
    metaOpacityAnim.setValue(0);
    metaTranslateAnim.setValue(16);

    const levelListenerId = levelAnim.addListener(({ value }) => {
      setAnimatedLevel(Math.max(1, Math.round(value)));
    });
    const coinsListenerId = coinsAnim.addListener(({ value }) => {
      setAnimatedCoins(Math.max(0, Math.round(value)));
    });
    const xpListenerId = xpAnim.addListener(({ value }) => {
      setAnimatedXp(Math.max(0, Math.round(value)));
    });

    const motion = Animated.sequence([
      Animated.parallel([
        Animated.timing(overlayOpacityAnim, {
          toValue: 1,
          duration: CLAIM_OVERLAY_ENTER_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacityAnim, {
          toValue: 1,
          duration: CLAIM_OVERLAY_ENTER_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(cardScaleAnim, {
          toValue: 0.98,
          duration: 260,
          easing: Easing.out(Easing.back(0.9)),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(cardScaleAnim, {
          toValue: peakCardScale,
          duration: counterDuration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(levelAnim, {
          toValue: toLevel,
          duration: Math.max(900, Math.round(counterDuration * 0.85)),
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(coinsAnim, {
          toValue: toCoins,
          duration: counterDuration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(xpAnim, {
          toValue: toXp,
          duration: counterDuration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(progressAnim, {
          toValue: toProgress,
          duration: Math.max(880, Math.round(counterDuration * 0.84)),
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.sequence([
          Animated.timing(progressScaleAnim, {
            toValue: peakProgressScale,
            duration: Math.max(280, Math.round(counterDuration * 0.32)),
            easing: Easing.out(Easing.back(1.1)),
            useNativeDriver: false,
          }),
          Animated.timing(progressScaleAnim, {
            toValue: 1,
            duration: Math.max(420, Math.round(counterDuration * 0.48)),
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
          }),
        ]),
        Animated.stagger(CLAIM_SECTION_STAGGER_MS, [
          Animated.parallel([
            Animated.timing(headingOpacityAnim, {
              toValue: 1,
              duration: 220,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(headingTranslateAnim, {
              toValue: 0,
              duration: 280,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(rewardsOpacityAnim, {
              toValue: 1,
              duration: 220,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(rewardsTranslateAnim, {
              toValue: 0,
              duration: 280,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(metaOpacityAnim, {
              toValue: 1,
              duration: 220,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(metaTranslateAnim, {
              toValue: 0,
              duration: 280,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.sequence([
          Animated.timing(badgeScaleAnim, {
            toValue: 1.08,
            duration: 280,
            easing: Easing.out(Easing.back(1.1)),
            useNativeDriver: true,
          }),
          Animated.timing(badgeScaleAnim, {
            toValue: 1,
            duration: 240,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay(Math.max(180, Math.round(counterDuration * 0.22))),
          Animated.timing(badgeScaleAnim, {
            toValue: 1.04,
            duration: 220,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(badgeScaleAnim, {
            toValue: 1,
            duration: 220,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.delay(CLAIM_END_HOLD_MS),
      Animated.parallel([
        Animated.timing(cardScaleAnim, {
          toValue: 0.7,
          duration: CLAIM_OVERLAY_EXIT_MS,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacityAnim, {
          toValue: 0,
          duration: CLAIM_OVERLAY_EXIT_MS - 50,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacityAnim, {
          toValue: 0,
          duration: CLAIM_OVERLAY_EXIT_MS,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]);

    motion.start(({ finished }) => {
      levelAnim.removeListener(levelListenerId);
      coinsAnim.removeListener(coinsListenerId);
      xpAnim.removeListener(xpListenerId);
      if (!finished) {
        return;
      }
      setAnimatedLevel(toLevel);
      setAnimatedCoins(toCoins);
      setAnimatedXp(toXp);
      setShowClaimOverlay(false);
      onClaimRewardAnimationEnd?.();
    });

    return () => {
      levelAnim.stopAnimation();
      coinsAnim.stopAnimation();
      xpAnim.stopAnimation();
      progressAnim.stopAnimation();
      progressScaleAnim.stopAnimation();
      badgeScaleAnim.stopAnimation();
      headingOpacityAnim.stopAnimation();
      headingTranslateAnim.stopAnimation();
      rewardsOpacityAnim.stopAnimation();
      rewardsTranslateAnim.stopAnimation();
      metaOpacityAnim.stopAnimation();
      metaTranslateAnim.stopAnimation();
      overlayOpacityAnim.stopAnimation();
      cardOpacityAnim.stopAnimation();
      cardScaleAnim.stopAnimation();
      levelAnim.removeListener(levelListenerId);
      coinsAnim.removeListener(coinsListenerId);
      xpAnim.removeListener(xpListenerId);
    };
  }, [
    claimRewardAnimation?.id,
    claimRewardAnimation?.fromCoins,
    claimRewardAnimation?.fromXp,
    claimRewardAnimation?.toCoins,
    claimRewardAnimation?.toXp,
    badgeScaleAnim,
    coinsAnim,
    cardOpacityAnim,
    cardScaleAnim,
    headingOpacityAnim,
    headingTranslateAnim,
    levelAnim,
    metaOpacityAnim,
    metaTranslateAnim,
    onClaimRewardAnimationEnd,
    overlayOpacityAnim,
    progressAnim,
    progressScaleAnim,
    rewardsOpacityAnim,
    rewardsTranslateAnim,
    xp,
    coins,
    xpAnim,
  ]);

  if (!showClaimOverlay) {
    return null;
  }

  return (
    <View style={styles.claimOverlayContainer} pointerEvents="auto">
      <Animated.View
        style={[
          styles.claimOverlayBackdrop,
          { opacity: overlayOpacityAnim },
        ]}
      >
        {canUseNativeBlur ? (
          <NativeBlurView
            tint="dark"
            intensity={86}
            blurMethod={Platform.OS === 'android' ? 'dimezisBlurViewSdk31Plus' : undefined}
            blurReductionFactor={Platform.OS === 'android' ? 3 : undefined}
            blurTarget={Platform.OS === 'android' ? blurTargetRef : undefined}
            style={styles.claimOverlayBlur}
          />
        ) : (
          <View style={styles.claimOverlayBlur} />
        )}
        <View style={styles.claimOverlayDimmer} />
      </Animated.View>

      <Animated.View
        style={[
          styles.claimCenterCard,
          {
            opacity: cardOpacityAnim,
            transform: [{ scale: cardScaleAnim }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.claimCenterBadgeWrap,
            { transform: [{ scale: badgeScaleAnim }] },
          ]}
        >
          <View style={styles.claimCenterBadge}>
            <Text style={styles.claimCenterBadgeText}>{t('Abzeichen erhalten')}</Text>
          </View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: headingOpacityAnim,
            transform: [{ translateY: headingTranslateAnim }],
          }}
        >
          <Text style={styles.claimCenterHeading}>{t('Belohnung eingesammelt')}</Text>
        </Animated.View>

        <Animated.View
          style={{
            opacity: rewardsOpacityAnim,
            transform: [{ translateY: rewardsTranslateAnim }],
          }}
        >
          <View style={styles.claimCenterRewardsRow}>
            <View style={[styles.claimCenterRewardChip, styles.claimCenterRewardChipXp]}>
              <Text style={styles.claimCenterRewardChipLabel}>XP</Text>
              <Text style={styles.claimCenterRewardChipValue}>{`+${formatThousands(rewardXpGain)}`}</Text>
            </View>
            <View style={[styles.claimCenterRewardChip, styles.claimCenterRewardChipCoins]}>
              <Text style={styles.claimCenterRewardChipLabel}>{t('Coins')}</Text>
              <Text style={styles.claimCenterRewardChipValue}>{`+${formatThousands(rewardCoinsGain)}`}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: metaOpacityAnim,
            transform: [{ translateY: metaTranslateAnim }],
          }}
        >
          <View style={styles.claimCenterLevelRow}>
            <View style={styles.claimCenterLevelCluster}>
              <Text style={styles.claimCenterLevelLabel}>{t('Level')}</Text>
              <Text style={styles.claimCenterLevelValue}>{`LV ${animatedLevel}`}</Text>
            </View>
            <Text style={styles.claimCenterXpValue}>{`${formatThousands(animatedXp)} XP`}</Text>
          </View>

          <View style={styles.claimCenterProgressWrap}>
            <Text style={styles.claimCenterProgressHint}>{t('Level-Fortschritt')}</Text>
            <View
              style={[
                styles.claimCenterProgressTrack,
                { height: progressBarHeight },
              ]}
            >
              <Animated.View
                style={[
                  styles.claimCenterProgressFill,
                  {
                    width: progressWidth,
                    transform: [{ scaleY: progressScaleAnim }],
                  },
                ]}
              />
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}
