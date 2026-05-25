import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Modal, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../i18n/useTranslation';
import { formatCountdown } from '../shop/shopConfig';
import styles from '../styles/HomeScreen.styles';

export default function EnergyBoostModal({
  visible,
  energy,
  nextEnergyAt,
  coinsAvailable,
  rewardEnergyAmount,
  energyMessage,
  isBoostBusy,
  rewarding,
  coinCost,
  coinEnergyAmount,
  onBuyWithCoins,
  onWatchAd,
  onRefreshEnergy,
  onClose,
}) {
  const { t } = useTranslation();
  const resolvedEnergy = Number.isFinite(energy) ? Math.max(0, energy) : 0;
  const resolvedCoins = Number.isFinite(coinsAvailable) ? Math.max(0, coinsAvailable) : 0;
  const resolvedRewardEnergy =
    Number.isFinite(rewardEnergyAmount) && rewardEnergyAmount > 0 ? rewardEnergyAmount : 5;
  const lightning = '\u26A1';
  const coinEmoji = '\u{1FA99}';
  const [timeLeftMs, setTimeLeftMs] = useState(null);
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(28)).current;
  const titleLift = useRef(new Animated.Value(0)).current;
  const statusOpacity = useRef(new Animated.Value(0)).current;
  const statusTranslateY = useRef(new Animated.Value(22)).current;
  const statusScale = useRef(new Animated.Value(0.96)).current;
  const coinOptionOpacity = useRef(new Animated.Value(0)).current;
  const coinOptionTranslateY = useRef(new Animated.Value(26)).current;
  const coinOptionScale = useRef(new Animated.Value(0.96)).current;
  const adOptionOpacity = useRef(new Animated.Value(0)).current;
  const adOptionTranslateY = useRef(new Animated.Value(26)).current;
  const adOptionScale = useRef(new Animated.Value(0.96)).current;
  const coinsOpacity = useRef(new Animated.Value(0)).current;
  const coinsTranslateY = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    const resolvedNextEnergyAt = Number.isFinite(nextEnergyAt) ? nextEnergyAt : null;
    if (!visible || resolvedNextEnergyAt === null) {
      setTimeLeftMs(null);
      return undefined;
    }

    let didRequestRefresh = false;
    const updateTimeLeft = () => {
      const remaining = Math.max(0, resolvedNextEnergyAt - Date.now());
      setTimeLeftMs(remaining);
      if (remaining <= 0 && !didRequestRefresh) {
        didRequestRefresh = true;
        Promise.resolve(onRefreshEnergy?.()).catch(() => {});
      }
    };

    updateTimeLeft();
    const intervalId = setInterval(updateTimeLeft, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [nextEnergyAt, onRefreshEnergy, visible]);

  const nextEnergyCountdown = useMemo(() => {
    if (timeLeftMs === null) {
      return null;
    }

    return formatCountdown(timeLeftMs);
  }, [timeLeftMs]);

  useEffect(() => {
    titleOpacity.setValue(0);
    titleTranslateY.setValue(28);
    titleLift.setValue(0);
    statusOpacity.setValue(0);
    statusTranslateY.setValue(22);
    statusScale.setValue(0.96);
    coinOptionOpacity.setValue(0);
    coinOptionTranslateY.setValue(26);
    coinOptionScale.setValue(0.96);
    adOptionOpacity.setValue(0);
    adOptionTranslateY.setValue(26);
    adOptionScale.setValue(0.96);
    coinsOpacity.setValue(0);
    coinsTranslateY.setValue(-10);

    if (!visible) {
      return undefined;
    }

    const createBubbleIn = (opacityValue, translateValue, scaleValue) =>
      Animated.parallel([
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(translateValue, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.spring(scaleValue, {
          toValue: 1,
          speed: 15,
          bounciness: 6,
          useNativeDriver: true,
        }),
      ]);

    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.spring(titleTranslateY, {
          toValue: 0,
          speed: 15,
          bounciness: 5,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(titleLift, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        createBubbleIn(statusOpacity, statusTranslateY, statusScale),
      ]),
      Animated.stagger(110, [
        createBubbleIn(coinOptionOpacity, coinOptionTranslateY, coinOptionScale),
        createBubbleIn(adOptionOpacity, adOptionTranslateY, adOptionScale),
      ]),
      Animated.parallel([
        Animated.timing(coinsOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(coinsTranslateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start();
    return () => animation.stop();
  }, [
    adOptionOpacity,
    adOptionScale,
    adOptionTranslateY,
    coinOptionOpacity,
    coinOptionScale,
    coinOptionTranslateY,
    coinsOpacity,
    coinsTranslateY,
    statusOpacity,
    statusScale,
    statusTranslateY,
    titleLift,
    titleOpacity,
    titleTranslateY,
    visible,
  ]);

  if (!visible) {
    return null;
  }

  const titleAnimatedStyle = {
    opacity: titleOpacity,
    transform: [
      { translateY: titleTranslateY },
      {
        translateY: titleLift.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -26],
        }),
      },
      {
        scale: titleLift.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.985],
        }),
      },
    ],
  };

  const statusAnimatedStyle = {
    opacity: statusOpacity,
    transform: [{ translateY: statusTranslateY }, { scale: statusScale }],
  };

  const coinOptionAnimatedStyle = {
    opacity: coinOptionOpacity,
    transform: [{ translateY: coinOptionTranslateY }, { scale: coinOptionScale }],
  };

  const adOptionAnimatedStyle = {
    opacity: adOptionOpacity,
    transform: [{ translateY: adOptionTranslateY }, { scale: adOptionScale }],
  };

  const coinsAnimatedStyle = {
    opacity: coinsOpacity,
    transform: [{ translateY: coinsTranslateY }],
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      transparent
      onRequestClose={() => {
        if (!isBoostBusy) {
          onClose?.();
        }
      }}
    >
      <View style={styles.boostOverlay}>
        <View pointerEvents="none" style={styles.boostGlowTop} />
        <View pointerEvents="none" style={styles.boostGlowBottom} />
        <View style={styles.boostCard}>
          <View style={styles.boostHeader}>
            <Pressable
              onPress={onClose}
              style={[styles.boostBackButton, isBoostBusy ? styles.boostButtonDisabled : null]}
              accessibilityLabel={t('Zur\u00fcck')}
              disabled={isBoostBusy}
            >
              <Ionicons name="chevron-back" size={20} color="#F6F4FF" />
            </Pressable>

            <Animated.View style={coinsAnimatedStyle}>
              <View style={[styles.coinBadge, styles.boostHeaderCoinBadge]}>
                <Text style={styles.coinEmoji}>{'\u{1FA99}'}</Text>
                <Text style={styles.coinBadgeText}>{resolvedCoins.toLocaleString()}</Text>
              </View>
            </Animated.View>
          </View>

          <View style={styles.boostHero}>
            <View style={styles.boostContentStack}>
              <Animated.View style={[styles.boostTitleBlock, titleAnimatedStyle]}>
                <Text style={styles.boostTitle}>{t('Keine Energie mehr')}</Text>
              </Animated.View>

              <Animated.View style={[styles.boostHeroPanel, statusAnimatedStyle]}>
                <View style={styles.boostValueAura}>
                  <View style={styles.boostValueRow}>
                    <Text style={styles.boostValueNumber}>{resolvedEnergy}</Text>
                    <Text style={styles.boostValueIcon}>{lightning}</Text>
                  </View>
                </View>
                {nextEnergyCountdown ? (
                  <View style={styles.boostTimerPill}>
                    <Text style={styles.boostTimerLabel}>{t('Naechste Energie in')}</Text>
                    <Text style={styles.boostTimerValue}>{nextEnergyCountdown}</Text>
                  </View>
                ) : null}
                {energyMessage ? <Text style={styles.boostMessage}>{energyMessage}</Text> : null}
              </Animated.View>

              <View style={styles.boostActions}>
                <Animated.View style={coinOptionAnimatedStyle}>
                  <Pressable
                    onPress={onBuyWithCoins}
                    style={[
                      styles.boostButtonCoin,
                      isBoostBusy ? styles.boostButtonDisabled : null,
                    ]}
                    disabled={isBoostBusy}
                  >
                    <View style={styles.boostActionContent}>
                      <Text style={[styles.boostActionEmoji, styles.boostActionEmojiCoin]}>
                        {coinEmoji}
                      </Text>
                      <View style={styles.boostActionCopy}>
                        <Text style={styles.boostButtonCoinTitle}>
                          {`${coinCost.toLocaleString()} ${t('Coins')}`}
                        </Text>
                        <Text style={styles.boostButtonCoinSubtitle}>
                          {`+${coinEnergyAmount} ${lightning}`}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                </Animated.View>

                <Animated.View style={adOptionAnimatedStyle}>
                  <Pressable
                    onPress={onWatchAd}
                    style={[
                      styles.boostButtonGhost,
                      isBoostBusy ? styles.boostButtonDisabled : null,
                    ]}
                    disabled={isBoostBusy}
                  >
                    <View style={styles.boostActionContent}>
                      <Text style={[styles.boostActionEmoji, styles.boostActionEmojiEnergy]}>
                        {lightning}
                      </Text>
                      <View style={styles.boostActionCopy}>
                        <Text style={styles.boostButtonEnergyTitle}>
                          {`+${resolvedRewardEnergy} ${t('Energie')}`}
                        </Text>
                        <Text style={styles.boostButtonEnergySubtitle}>
                          {rewarding ? t('Werbung l\u00e4dt...') : t('Werbung ansehen')}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                </Animated.View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
