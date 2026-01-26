import { Pressable, Text, View } from 'react-native';
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
    ? 'Coins werden eingel\u00f6st...'
    : isEnergyFull
    ? 'Energie ist bereits voll'
    : coinsAvailable >= coinsCost
    ? `${coinsCost} Coins f\u00fcr +${coinsEnergy} Energie`
    : 'Nicht genug Coins';

  return (
    <View style={styles.boostOverlay}>
      <View style={styles.boostCard}>
        <Text style={styles.boostTitle}>Energie auff\u00fcllen</Text>
        <Text style={styles.boostText}>
          Du brauchst Energie f\u00fcr ein weiteres Spiel. W\u00e4hle Coins, Kauf oder Werbung f\u00fcr Energie.
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
              {boosting ? 'Zahlung l\u00e4uft...' : 'Energie voll (1,99 EUR)'}
            </Text>
          </Pressable>
          <Pressable
            onPress={onWatchAd}
            style={[styles.boostButtonGhost, isBoostBusy ? styles.boostButtonDisabled : null]}
            disabled={isBoostBusy}
          >
            <Text style={styles.boostGhostText}>
              {rewarding ? 'Werbung l\u00e4dt...' : 'Werbung ansehen (5 Energie)'}
            </Text>
          </Pressable>
        </View>
        <Pressable
          onPress={onClose}
          style={styles.boostCancel}
          disabled={isBoostBusy}
        >
          <Text style={styles.boostCancelText}>Sp\u00e4ter</Text>
        </Pressable>
      </View>
    </View>
  );
}
