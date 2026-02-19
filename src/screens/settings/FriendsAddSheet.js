import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/SettingsScreen.styles';

export default function FriendsAddSheet({
  visible,
  onClose,
  friendCode,
  copySuccess,
  onCopyFriendCode,
  friendCodeInput,
  setFriendCodeInput,
  friendInputRef,
  onAddFriend,
  addingFriend,
  friendsFeedback,
  friendRequestSent = false,
}) {
  const { t } = useTranslation();
  const hasInput = Boolean(friendCodeInput.trim());
  const submitDisabled = addingFriend || !hasInput || friendRequestSent;
  const submitLabel = friendRequestSent
    ? t('Freundesanfrage gesendet')
    : t('Freund hinzufügen');

  if (!visible) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={styles.friendAddOverlay}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
    >
      <Pressable style={styles.friendAddBackdrop} onPress={onClose} />
      <View style={styles.friendAddCard}>
        <View style={styles.friendAddHeader}>
          <Text style={styles.friendAddTitle}>{t('Freunde hinzufügen')}</Text>
          <Pressable
            onPress={onClose}
            style={styles.friendAddClose}
            accessibilityLabel={t('Schließen')}
          >
            <Ionicons name="close" size={18} color="#E2E8F0" />
          </Pressable>
        </View>

        <Text style={styles.friendHeroSubtitle}>
          {t('Teile deinen Code und hol deine Crew ins Battle.')}
        </Text>

        <View style={styles.friendCodeCard}>
          <Pressable
            onPress={onCopyFriendCode}
            style={styles.friendCodeValueWrapper}
            accessibilityLabel={t('Code kopieren')}
          >
            <Text style={styles.friendCodeValue}>
              {friendCode || '------'}
            </Text>
            {copySuccess ? (
              <Text style={styles.friendCodeCopy}>{t('Kopiert!')}</Text>
            ) : (
              <Ionicons
                name="copy-outline"
                size={18}
                color="#93C5FD"
                style={styles.friendCodeCopyIcon}
              />
            )}
          </Pressable>
        </View>

        <Text style={styles.friendInputLabel}>{t('Code von Freund eingeben')}</Text>
        <View style={styles.fieldGroup}>
          <TextInput
            ref={friendInputRef}
            value={friendCodeInput}
            onChangeText={setFriendCodeInput}
            placeholder="ABC12345"
            placeholderTextColor="#64748B"
            autoCapitalize="characters"
            keyboardType="default"
            style={styles.input}
          />
          <Pressable
            onPress={onAddFriend}
            disabled={submitDisabled}
            style={[
              styles.actionButton,
              styles.successButton,
              friendRequestSent ? styles.friendRequestSentButton : null,
              addingFriend ? styles.disabledButton : null,
            ]}
          >
            <Text
              style={[
                styles.successButtonText,
                friendRequestSent ? styles.friendRequestSentButtonText : null,
              ]}
            >
              {submitLabel}
            </Text>
          </Pressable>
        </View>

        {friendsFeedback ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>{friendsFeedback}</Text>
          </View>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}
