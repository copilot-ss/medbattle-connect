import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../i18n/useTranslation';
import { formatCountdown } from '../shop/shopConfig';
import styles from '../styles/HomeScreen.styles';

export default function EnergyBoostModal({
  visible,
  energy,
  nextEnergyAt,
  coinsAvailable,
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
  const lightning = '\u26A1';
  const [timeLeftMs, setTimeLeftMs] = useState(null);

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

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      transparent={false}
      statusBarTranslucent
      onRequestClose={() => {
        if (!isBoostBusy) {
          onClose?.();
        }
      }}
    >
      <View style={styles.boostOverlay}>
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

            <View style={styles.coinBadge}>
              <Text style={styles.coinEmoji}>{'\u{1FA99}'}</Text>
              <Text style={styles.coinBadgeText}>{resolvedCoins.toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.boostHero}>
            <View style={styles.boostHeroPanel}>
              <Text style={styles.boostTitle}>{t('Keine Energie mehr')}</Text>
              <View style={styles.boostValueRow}>
                <Text style={styles.boostValueNumber}>{resolvedEnergy}</Text>
                <Text style={styles.boostValueIcon}>{lightning}</Text>
              </View>
              {nextEnergyCountdown ? (
                <View style={styles.boostTimerPill}>
                  <Text style={styles.boostTimerLabel}>{t('Naechste Energie in')}</Text>
                  <Text style={styles.boostTimerValue}>{nextEnergyCountdown}</Text>
                </View>
              ) : null}
              {energyMessage ? <Text style={styles.boostMessage}>{energyMessage}</Text> : null}
            </View>
          </View>

          <View style={styles.boostActions}>
            <Pressable
              onPress={onBuyWithCoins}
              style={[styles.boostButtonCoin, isBoostBusy ? styles.boostButtonDisabled : null]}
              disabled={isBoostBusy}
            >
              <Text style={styles.boostButtonCoinText}>
                {t('{coins} Coins f\u00fcr +{energy} Energie', {
                  coins: coinCost,
                  energy: coinEnergyAmount,
                })}
              </Text>
            </Pressable>

            <Pressable
              onPress={onWatchAd}
              style={[styles.boostButtonGhost, isBoostBusy ? styles.boostButtonDisabled : null]}
              disabled={isBoostBusy}
            >
              <Text style={styles.boostGhostText}>
                {rewarding ? t('Werbung l\u00e4dt...') : t('Werbung ansehen (5 Energie)')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
