import { Switch, Text, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/SettingsScreen.styles';

export default function AudioSettingsCard({
  soundEnabled,
  vibrationEnabled,
  pushEnabled,
  onSoundToggle,
  onVibrationToggle,
  onPushToggle,
  soundStatus,
  vibrationStatus,
  pushStatus,
}) {
  const { t } = useTranslation();

  return (
    <View style={[styles.card, styles.audioCard]}>
      <View style={styles.rowBetween}>
        <Text style={styles.cardLabel}>{t('Audio')}</Text>
        <Switch
          value={soundEnabled}
          onValueChange={onSoundToggle}
          trackColor={{ false: '#1F2937', true: '#2563EB' }}
          thumbColor={soundEnabled ? '#F8FAFC' : '#94A3B8'}
          accessibilityHint={soundStatus}
        />
      </View>
      <View style={[styles.rowBetween, { marginTop: 14 }]}>
        <Text style={styles.cardLabel}>{t('Vibration')}</Text>
        <Switch
          value={vibrationEnabled}
          onValueChange={onVibrationToggle}
          trackColor={{ false: '#1F2937', true: '#2563EB' }}
          thumbColor={vibrationEnabled ? '#F8FAFC' : '#94A3B8'}
          accessibilityHint={vibrationStatus}
        />
      </View>
      <View style={[styles.rowBetween, { marginTop: 14 }]}>
        <Text style={styles.cardLabel}>{t('Push-Benachrichtigungen')}</Text>
        <Switch
          value={pushEnabled}
          onValueChange={onPushToggle}
          trackColor={{ false: '#1F2937', true: '#2563EB' }}
          thumbColor={pushEnabled ? '#F8FAFC' : '#94A3B8'}
          accessibilityHint={pushStatus}
        />
      </View>
    </View>
  );
}
