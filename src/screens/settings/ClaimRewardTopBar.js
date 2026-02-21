import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTranslation } from '../../i18n/useTranslation';
import { getTitleLevel } from '../../services/titleService';
import styles from '../styles/SettingsScreen.styles';

const CLAIM_COUNTER_MIN_DURATION = 1200;
const CLAIM_COUNTER_MAX_DURATION = 2600;
const CLAIM_OVERLAY_ENTER_MS = 220;
const CLAIM_OVERLAY_EXIT_MS = 320;
const CLAIM_END_HOLD_MS = 180;

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
  claimRewardAnimation = null,
  onClaimRewardAnimationEnd,
}) {
  const { t } = useTranslation();
  const [showClaimOverlay, setShowClaimOverlay] = useState(false);
  const [animatedLevel, setAnimatedLevel] = useState(userLevel);
  const [animatedCoins, setAnimatedCoins] = useState(coins);
  const overlayOpacityAnim = useRef(new Animated.Value(0)).current;
  const cardOpacityAnim = useRef(new Animated.Value(0)).current;
  const cardScaleAnim = useRef(new Animated.Value(0.72)).current;
  const levelAnim = useRef(new Animated.Value(userLevel)).current;
  const coinsAnim = useRef(new Animated.Value(coins)).current;
  const runningClaimIdRef = useRef(null);
  const safeLiveLevel = Number.isFinite(userLevel) ? Math.max(1, userLevel) : 1;
  const safeLiveCoins = Number.isFinite(coins) ? Math.max(0, coins) : 0;

  useEffect(() => {
    if (showClaimOverlay) {
      return;
    }
    setAnimatedLevel(safeLiveLevel);
    setAnimatedCoins(safeLiveCoins);
    levelAnim.setValue(safeLiveLevel);
    coinsAnim.setValue(safeLiveCoins);
  }, [
    coinsAnim,
    levelAnim,
    safeLiveCoins,
    safeLiveLevel,
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
    const gainMagnitude = Math.abs(toCoins - fromCoins) + Math.abs(toLevel - fromLevel) * 120;
    const counterDuration = Math.min(
      CLAIM_COUNTER_MAX_DURATION,
      Math.max(CLAIM_COUNTER_MIN_DURATION, Math.round(1220 + gainMagnitude * 1.6))
    );

    setShowClaimOverlay(true);
    setAnimatedLevel(fromLevel);
    setAnimatedCoins(fromCoins);
    overlayOpacityAnim.setValue(0);
    cardOpacityAnim.setValue(0);
    cardScaleAnim.setValue(0.72);
    levelAnim.setValue(fromLevel);
    coinsAnim.setValue(fromCoins);

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
          toValue: 1.18,
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
    onClaimRewardAnimationEnd,
    overlayOpacityAnim,
    xp,
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
        <BlurView
          tint="dark"
          intensity={80}
          experimentalBlurMethod="dimezisBlurView"
          style={styles.claimOverlayBlur}
        />
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
        <Text style={styles.claimCenterLevelLabel}>{t('Level')}</Text>
        <Text style={styles.claimCenterLevelValue}>{`LV ${animatedLevel}`}</Text>
        <View style={styles.claimCenterCoinsRow}>
          <Text style={styles.claimCenterCoinEmoji}>{'\u{1FA99}'}</Text>
          <Text style={styles.claimCenterCoinValue}>{formatThousands(animatedCoins)}</Text>
        </View>
        <Text style={styles.claimCenterCoinsLabel}>{t('Coins')}</Text>
      </Animated.View>
    </View>
  );
}
