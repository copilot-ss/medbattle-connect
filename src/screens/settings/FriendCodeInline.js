import { Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/SettingsScreen.styles';

export default function FriendCodeInline({
  friendCode,
  copySuccess = false,
  onCopyFriendCode,
  containerStyle = null,
  textStyle = null,
}) {
  const { t } = useTranslation();

  if (!friendCode || typeof onCopyFriendCode !== 'function') {
    return null;
  }

  return (
    <Pressable
      onPress={onCopyFriendCode}
      style={[styles.subtleFriendCodeButton, containerStyle]}
      accessibilityRole="button"
      accessibilityLabel={t('Code kopieren')}
    >
      <Text
        style={[
          styles.subtleFriendCodeText,
          copySuccess ? styles.subtleFriendCodeTextCopied : null,
          textStyle,
        ]}
        numberOfLines={1}
      >
        {t('Code')} {friendCode}
      </Text>
      <Ionicons
        name={copySuccess ? 'checkmark' : 'copy-outline'}
        size={12}
        color={copySuccess ? '#9EDCFF' : 'rgba(148, 163, 184, 0.82)'}
        style={styles.subtleFriendCodeIcon}
      />
    </Pressable>
  );
}
