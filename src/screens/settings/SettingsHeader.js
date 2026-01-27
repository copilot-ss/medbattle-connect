import { Pressable, Text, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/SettingsScreen.styles';

export default function SettingsHeader({
  onClose,
  title = null,
  showClose = true,
}) {
  const canClose = showClose && typeof onClose === 'function';
  const { t } = useTranslation();
  const resolvedTitle = title || t('Einstellungen');

  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{resolvedTitle}</Text>
      {canClose ? (
        <Pressable
          onPress={onClose}
          style={styles.headerCloseButton}
          accessibilityLabel={t('Schließen')}
        >
          <Text style={styles.headerCloseText}>X</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
