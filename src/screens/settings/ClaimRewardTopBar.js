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

const CLAIM_COUNTER_MIN_DURATION = 1600;
const CLAIM_COUNTER_MAX_DURATION = 3200;
const CLAIM_OVERLAY_ENTER_MS = 220;
const CLAIM_OVERLAY_EXIT_MS = 320;
const CLAIM_END_HOLD_MS = 420;
const CLAIM_BAR_BASE_HEIGHT = 18;
const CLAIM_BAR_MAX_HEIGHT = 42;
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
  const [rewardCoinsGain, setRewardCoinsGain] = useState(0);
  const [progressBarHeight, setProgressBarHeight] = useState(CLAIM_BAR_BASE_HEIGHT);
  const overlayOpacityAnim = useRef(new Animated.Value(0)).current;
  const cardOpacityAnim = useRef(new Animated.Value(0)).current;
  const cardScaleAnim = useRef(new Animated.Value(0.72)).current;
  const levelAnim = useRef(new Animated.Value(userLevel)).current;
  const coinsAnim = useRef(new Animated.Value(coins)).current;
  const progressAnim = useRef(
    new Animated.Value(getTitleProgress(xp).progress)
  ).current;
  const progressScaleAnim = useRef(new Animated.Value(1)).current;
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
    setRewardCoinsGain(0);
    setProgressBarHeight(CLAIM_BAR_BASE_HEIGHT);
    levelAnim.setValue(safeLiveLevel);
    coinsAnim.setValue(safeLiveCoins);
    progressAnim.setValue(safeLiveProgress);
    progressScaleAnim.setValue(1);
    rewardsOpacityAnim.setValue(0);
    rewardsTranslateAnim.setValue(14);
    metaOpacityAnim.setValue(0);
    metaTranslateAnim.setValue(16);
  }, [
    coinsAnim,
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
    showClaimOverlay,
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
      Math.max(CLAIM_COUNTER_MIN_DURATION, Math.round(1450 + gainMagnitude * 0.68))
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
    setRewardCoinsGain(rewardCoins);
    setProgressBarHeight(nextBarHeight);
    overlayOpacityAnim.setValue(0);
    cardOpacityAnim.setValue(0);
    cardScaleAnim.setValue(0.72);
    levelAnim.setValue(fromLevel);
    coinsAnim.setValue(fromCoins);
    progressAnim.setValue(normalizedFromProgress);
    progressScaleAnim.setValue(0.94);
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
      if (!finished) {
        return;
      }
      setAnimatedLevel(toLevel);
      setAnimatedCoins(toCoins);
      setShowClaimOverlay(false);
      onClaimRewardAnimationEnd?.();
    });

    return () => {
      levelAnim.stopAnimation();
      coinsAnim.stopAnimation();
      progressAnim.stopAnimation();
      progressScaleAnim.stopAnimation();
      rewardsOpacityAnim.stopAnimation();
      rewardsTranslateAnim.stopAnimation();
      metaOpacityAnim.stopAnimation();
      metaTranslateAnim.stopAnimation();
      overlayOpacityAnim.stopAnimation();
      cardOpacityAnim.stopAnimation();
      cardScaleAnim.stopAnimation();
      levelAnim.removeListener(levelListenerId);
      coinsAnim.removeListener(coinsListenerId);
    };
  }, [
    claimRewardAnimation?.id,
    claimRewardAnimation?.fromCoins,
    claimRewardAnimation?.fromXp,
    claimRewardAnimation?.toCoins,
    claimRewardAnimation?.toXp,
    coinsAnim,
    cardOpacityAnim,
    cardScaleAnim,
    levelAnim,
    metaOpacityAnim,
    metaTranslateAnim,
    onClaimRewardAnimationEnd,
    overlayOpacityAnim,
    progressAnim,
    progressScaleAnim,
    rewardsOpacityAnim,
    rewardsTranslateAnim,
    coins,
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
          style={{
            opacity: rewardsOpacityAnim,
            transform: [{ translateY: rewardsTranslateAnim }],
          }}
        >
          <View style={styles.claimCenterHero}>
            <Text style={styles.claimCenterCoinsLabel}>{t('Coins')}</Text>
            <View style={styles.claimCenterHeroRow}>
              <Text style={styles.claimCenterCoinsValue}>{formatThousands(animatedCoins)}</Text>
              <View style={styles.claimCenterMiniLevelBadge}>
                <Text style={styles.claimCenterMiniLevelLabel}>{t('Level')}</Text>
                <Text style={styles.claimCenterMiniLevelValue}>{animatedLevel}</Text>
              </View>
            </View>
            <Text style={styles.claimCenterCoinsGain}>{`+${formatThousands(rewardCoinsGain)}`}</Text>
          </View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: metaOpacityAnim,
            transform: [{ translateY: metaTranslateAnim }],
          }}
        >
          <View style={styles.claimCenterProgressWrap}>
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
