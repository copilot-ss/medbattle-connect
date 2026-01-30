import { Pressable, Text, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/HomeScreen.styles';

export default function OfflineBanner({ isVisible, isChecking, onGoOnline }) {
  const { t } = useTranslation();

  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.offlineBanner}>
      <View style={styles.offlineHeader}>
        <View style={styles.offlineDot} />
        <Text style={styles.offlineTitle}>{t('Offline Modus')}</Text>
      </View>
      <Text style={styles.offlineText}>
        {t(
          'Quick Play bleibt verfügbar. Multiplayer, Freunde, Rangliste und Einstellungen sind offline gesperrt.'
        )}
      </Text>
      <Pressable
        onPress={onGoOnline}
        style={[styles.offlineButton, isChecking ? styles.offlineButtonDisabled : null]}
        disabled={isChecking}
      >
        <Text style={styles.offlineButtonText}>
          {isChecking ? `${t('Verbindung prüfen')}...` : t('Online gehen')}
        </Text>
      </Pressable>
    </View>
  );
}
