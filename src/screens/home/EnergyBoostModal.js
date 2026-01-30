import { Pressable, Text, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/HomeScreen.styles';

export default function EnergyBoostModal({
  visible,
  energyMessage,
  isBoostBusy,
  boosting,
  rewarding,
  coinPurchasing,
  coinsAvailable = 0,
  coinsCost = 0,
  coinsEnergy = 0,
  isEnergyFull = false,
  onBuyWithCoins,
  onPurchase,
  onWatchAd,
  onClose,
}) {
  const { t } = useTranslation();

  if (!visible) {
    return null;
  }

  const canBuyWithCoins =
    typeof onBuyWithCoins === 'function' &&
    coinsCost > 0 &&
    coinsEnergy > 0 &&
    coinsAvailable >= coinsCost &&
    !isEnergyFull;
  const coinLabel = coinPurchasing
    ? t('Coins werden eingelöst...')
    : isEnergyFull
    ? t('Energie ist bereits voll')
    : coinsAvailable >= coinsCost
    ? t('{coins} Coins für +{energy} Energie', {
        coins: coinsCost,
        energy: coinsEnergy,
      })
    : t('Nicht genug Coins');

  return (
    <View style={styles.boostOverlay}>
      <View style={styles.boostCard}>
        <Text style={styles.boostTitle}>{t('Energie auffüllen')}</Text>
        <Text style={styles.boostText}>
          {t(
            'Du brauchst Energie für ein weiteres Spiel. Wähle Coins, Kauf oder Werbung für Energie.'
          )}
        </Text>
        {energyMessage ? <Text style={styles.boostMessage}>{energyMessage}</Text> : null}
        <View style={styles.boostActions}>
          <Pressable
            onPress={onBuyWithCoins}
            style={[
              styles.boostButtonCoin,
              isBoostBusy || !canBuyWithCoins ? styles.boostButtonDisabled : null,
            ]}
            disabled={isBoostBusy || !canBuyWithCoins}
          >
            <Text style={styles.boostButtonCoinText}>{coinLabel}</Text>
          </Pressable>
          <Pressable
            onPress={onPurchase}
            style={[styles.boostButton, isBoostBusy ? styles.boostButtonDisabled : null]}
            disabled={isBoostBusy}
          >
            <Text style={styles.boostButtonText}>
              {boosting ? t('Zahlung läuft...') : t('Energie voll (1,99 EUR)')}
            </Text>
          </Pressable>
          <Pressable
            onPress={onWatchAd}
            style={[styles.boostButtonGhost, isBoostBusy ? styles.boostButtonDisabled : null]}
            disabled={isBoostBusy}
          >
            <Text style={styles.boostGhostText}>
              {rewarding ? t('Werbung lädt...') : t('Werbung ansehen (5 Energie)')}
            </Text>
          </Pressable>
        </View>
        <Pressable
          onPress={onClose}
          style={styles.boostCancel}
          disabled={isBoostBusy}
        >
          <Text style={styles.boostCancelText}>{t('Später')}</Text>
        </Pressable>
      </View>
    </View>
  );
}
