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
  leadingIcon = null,
  onLeadingPress = null,
  leadingAccessibilityLabel = null,
  trailingIcon = null,
  onTrailingPress = null,
  trailingAccessibilityLabel = null,
}) {
  const canClose = showClose && typeof onClose === 'function';
  const { t } = useTranslation();
  const resolvedTitle = title || t('Einstellungen');
  const isBackAction = actionType === 'back';
  const accessibilityLabel = isBackAction ? t('Zurück') : t('Schlie\u00dfen');
  const hasLeadingAction =
    typeof onLeadingPress === 'function' && typeof leadingIcon === 'string' && leadingIcon.trim();
  const resolvedLeadingAccessibilityLabel = leadingAccessibilityLabel || t('Info');
  const hasTrailingAction =
    typeof onTrailingPress === 'function' && typeof trailingIcon === 'string' && trailingIcon.trim();
  const resolvedTrailingAccessibilityLabel = trailingAccessibilityLabel || t('Info');

  return (
    <View style={[styles.header, containerStyle]}>
      <View style={[styles.headerSide, styles.headerSideLeft]}>
        {canClose && isBackAction ? (
          <Pressable
            onPress={onClose}
            style={[styles.headerActionButton, styles.headerBackButton]}
            accessibilityLabel={accessibilityLabel}
          >
            <Ionicons name="chevron-back" size={20} color="#F6F4FF" />
          </Pressable>
        ) : hasLeadingAction ? (
          <Pressable
            onPress={onLeadingPress}
            style={[styles.headerActionButton, styles.headerLeadingButton]}
            accessibilityLabel={resolvedLeadingAccessibilityLabel}
          >
            <Ionicons name={leadingIcon} size={18} color="#F6F4FF" />
          </Pressable>
        ) : null}
      </View>

      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        adjustsFontSizeToFit
        minimumFontScale={0.82}
        style={[
          styles.headerTitle,
          styles.headerTitleCentered,
        ]}
      >
        {resolvedTitle}
      </Text>

      <View style={[styles.headerSide, styles.headerSideRight]}>
        {hasTrailingAction ? (
          <Pressable
            onPress={onTrailingPress}
            style={[styles.headerActionButton, styles.headerTrailingButton]}
            accessibilityLabel={resolvedTrailingAccessibilityLabel}
          >
            <Ionicons name={trailingIcon} size={18} color="#F6F4FF" />
          </Pressable>
        ) : null}

        {canClose && !isBackAction ? (
          <Pressable
            onPress={onClose}
            style={[styles.headerActionButton, styles.headerCloseButton]}
            accessibilityLabel={accessibilityLabel}
          >
            <Text style={styles.headerCloseText}>X</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
