import { Text, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/HomeScreen.styles';

export default function HomeHeader({
  coins = 0,
  energy = 0,
  energyMax = null,
  userName,
  isGuest,
}) {
  const { t } = useTranslation();
  const resolvedName = typeof userName === 'string' ? userName.trim() : '';
  const resolvedEnergy = Number.isFinite(energy) ? energy : 0;
  const resolvedEnergyMax =
    Number.isFinite(energyMax) && energyMax > 0 ? energyMax : null;
  const energyLabel = resolvedEnergyMax
    ? `${resolvedEnergy}/${resolvedEnergyMax}`
    : `${resolvedEnergy}`;
  const displayName = isGuest ? t('Gast') : resolvedName;
  const welcomeLine = displayName
    ? t('Willkommen zurück, {name}', { name: displayName })
    : t('Willkommen zurück');

  return (
    <View style={styles.header}>
      <View style={styles.headerTitle}>
        <Text style={styles.welcomeText} numberOfLines={1}>
          {welcomeLine}
        </Text>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {t("Los geht's!")}
        </Text>
      </View>

      <View style={styles.quickActions}>
        <View style={styles.coinBadge}>
          <Text style={styles.coinEmoji}>{'\u{1FA99}'}</Text>
          <Text style={styles.coinBadgeText}>{coins}</Text>
        </View>
        <View style={styles.energyTopBadge}>
          <Text style={styles.energyTopEmoji}>{'\u26A1'}</Text>
          <Text style={styles.energyTopBadgeText}>{energyLabel}</Text>
        </View>
      </View>
    </View>
  );
}
