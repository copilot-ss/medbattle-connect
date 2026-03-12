import { Pressable, Text, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/HomeScreen.styles';

export default function EnergyBoostModal({
  visible,
  energyMessage,
  isBoostBusy,
  rewarding,
  onOpenShop,
  onWatchAd,
  onClose,
}) {
  const { t } = useTranslation();

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.boostOverlay}>
      <View style={styles.boostCard}>
        <Text style={styles.boostTitle}>{t('Energie auffüllen')}</Text>
        <Text style={styles.boostText}>
          {t('Du brauchst Energie für ein weiteres Spiel. Öffne den Shop oder sieh dir Werbung für Energie an.')}
        </Text>
        {energyMessage ? <Text style={styles.boostMessage}>{energyMessage}</Text> : null}
        <View style={styles.boostActions}>
          <Pressable
            onPress={onOpenShop}
            style={[styles.boostButton, isBoostBusy ? styles.boostButtonDisabled : null]}
            disabled={isBoostBusy}
          >
            <Text style={styles.boostButtonText}>{t('Shop öffnen')}</Text>
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
