import { Switch, Text, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/SettingsScreen.styles';

export default function SettingsPreferencesCard({
  pushEnabled,
  friendRequestsEnabled,
  onPushToggle,
  onFriendRequestsToggle,
  pushStatus,
  friendRequestsStatus,
}) {
  const { t } = useTranslation();

  return (
    <View style={[styles.card, styles.settingsCard]}>
      <View style={styles.rowBetween}>
        <Text style={styles.cardLabel}>{t('Push-Benachrichtigungen')}</Text>
        <Switch
          value={pushEnabled}
          onValueChange={onPushToggle}
          trackColor={{ false: '#1F2937', true: '#2563EB' }}
          thumbColor={pushEnabled ? '#F8FAFC' : '#94A3B8'}
          accessibilityHint={pushStatus}
        />
      </View>
      <View style={[styles.rowBetween, styles.rowBetweenSpaced]}>
        <Text style={styles.cardLabel}>{t('Freundesanfragen')}</Text>
        <Switch
          value={friendRequestsEnabled}
          onValueChange={onFriendRequestsToggle}
          trackColor={{ false: '#1F2937', true: '#2563EB' }}
          thumbColor={friendRequestsEnabled ? '#F8FAFC' : '#94A3B8'}
          accessibilityHint={friendRequestsStatus}
        />
      </View>
    </View>
  );
}
