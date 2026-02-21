import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
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
  const androidKeyboardTranslateY = useRef(new Animated.Value(0)).current;
  const hasInput = Boolean(friendCodeInput.trim());
  const submitDisabled = addingFriend || !hasInput || friendRequestSent;
  const submitLabel = friendRequestSent
    ? t('Freundesanfrage gesendet')
    : t('Freund hinzufügen');

  useEffect(() => {
    if (Platform.OS !== 'android' || !visible) {
      androidKeyboardTranslateY.setValue(0);
      return undefined;
    }

    const animateTo = (toValue, duration = 180) => {
      Animated.timing(androidKeyboardTranslateY, {
        toValue,
        duration: Number.isFinite(duration) ? duration : 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    };

    const handleShow = (event) => {
      const rawHeight = event?.endCoordinates?.height ?? 0;
      const keyboardHeight = Number.isFinite(rawHeight) ? rawHeight : 0;
      const target = -Math.max(0, keyboardHeight - 8);
      animateTo(target, event?.duration);
    };

    const handleHide = (event) => {
      animateTo(0, event?.duration);
    };

    const showSub = Keyboard.addListener('keyboardDidShow', handleShow);
    const hideSub = Keyboard.addListener('keyboardDidHide', handleHide);

    return () => {
      showSub.remove();
      hideSub.remove();
      androidKeyboardTranslateY.stopAnimation();
      androidKeyboardTranslateY.setValue(0);
    };
  }, [androidKeyboardTranslateY, visible]);

  if (!visible) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={styles.friendAddOverlay}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      enabled={Platform.OS === 'ios'}
    >
      <Pressable style={styles.friendAddBackdrop} onPress={onClose} />
      <Animated.View
        style={[
          styles.friendAddCard,
          Platform.OS === 'android'
            ? { transform: [{ translateY: androidKeyboardTranslateY }] }
            : null,
        ]}
      >
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
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
