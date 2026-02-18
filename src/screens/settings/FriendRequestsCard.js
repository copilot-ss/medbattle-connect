import { Switch, Text, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/SettingsScreen.styles';

export default function FriendRequestsCard({
  enabled,
  status,
  onToggle,
}) {
  const { t } = useTranslation();

  return (
    <View style={[styles.card, styles.squadCard]}>
      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.cardLabel}>{t('Freundesanfragen')}</Text>
          <Text style={styles.helperText}>{status}</Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: '#1F2937', true: '#2563EB' }}
          thumbColor={enabled ? '#F8FAFC' : '#94A3B8'}
          accessibilityHint={status}
        />
      </View>
    </View>
  );
}
