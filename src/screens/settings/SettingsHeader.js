import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/SettingsScreen.styles';

export default function SettingsHeader({
  onClose,
  title = null,
  showClose = true,
  actionType = 'close',
  containerStyle = null,
}) {
  const canClose = showClose && typeof onClose === 'function';
  const { t } = useTranslation();
  const resolvedTitle = title || t('Einstellungen');
  const isBackAction = actionType === 'back';
  const accessibilityLabel = isBackAction ? t('Zurueck') : t('Schlie\u00dfen');

  return (
    <View style={[styles.header, containerStyle]}>
      {canClose && isBackAction ? (
        <Pressable
          onPress={onClose}
          style={[styles.headerActionButton, styles.headerBackButton]}
          accessibilityLabel={accessibilityLabel}
        >
          <Ionicons name="chevron-back" size={20} color="#F6F4FF" />
        </Pressable>
      ) : null}

      <Text
        style={[
          styles.headerTitle,
          canClose && isBackAction ? styles.headerTitleWithBack : null,
        ]}
      >
        {resolvedTitle}
      </Text>

      {canClose ? (
        isBackAction ? (
          <View style={styles.headerBackSpacer} />
        ) : (
          <Pressable
            onPress={onClose}
            style={[styles.headerActionButton, styles.headerCloseButton]}
            accessibilityLabel={accessibilityLabel}
          >
            <Text style={styles.headerCloseText}>X</Text>
          </Pressable>
        )
      ) : null}
    </View>
  );
}
