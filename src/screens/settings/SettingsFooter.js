import { ActivityIndicator, Linking, Pressable, Text, TextInput, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/SettingsScreen.styles';

export default function SettingsFooter({
  showResetForm,
  onToggleResetForm,
  resetEmail,
  setResetEmail,
  loadingReset,
  onResetPassword,
  signingOut,
  onSignOut,
  showResetActions = true,
  isGuest = false,
  authResolved = false,
  onOpenLegal = null,
}) {
  const { t } = useTranslation();
  const privacyUrl = process.env.EXPO_PUBLIC_PRIVACY_URL;
  const termsUrl = process.env.EXPO_PUBLIC_TERMS_URL;
  const supportUrl = process.env.EXPO_PUBLIC_SUPPORT_URL;
  const resolvedGuest = authResolved ? isGuest : false;
  const signOutLabel = resolvedGuest ? t('Anmelden') : t('Abmelden');
  const signOutButtonStyles = resolvedGuest
    ? [
        styles.actionButton,
        styles.primaryButton,
        signingOut ? styles.disabledButton : null,
      ]
    : [
        styles.actionButton,
        styles.dangerButton,
        signingOut ? styles.dangerButtonDisabled : null,
      ];
  const signOutTextStyle = resolvedGuest
    ? styles.primaryButtonText
    : styles.dangerButtonText;
  const hasNativeLegalScreen = typeof onOpenLegal === 'function';

  const handleOpenUrl = async (url) => {
    if (!url) {
      return;
    }

    try {
      const resolvedUrl =
        url.startsWith('http://') || url.startsWith('https://')
          ? url
          : `https://${url}`;
      if (resolvedUrl.startsWith('http')) {
        await WebBrowser.openBrowserAsync(resolvedUrl, {
          enableBarCollapsing: true,
          showInRecents: true,
        });
        return;
      }
      const supported = await Linking.canOpenURL(resolvedUrl);
      if (!supported) {
        console.warn('Link konnte nicht geÃ¶ffnet werden.');
        return;
      }
      await Linking.openURL(resolvedUrl);
    } catch (err) {
      console.warn('Fehler beim Ã–ffnen des Links:', err);
    }
  };
  const handleOpenLegal = async (doc, url) => {
    if (hasNativeLegalScreen) {
      onOpenLegal(doc);
      return;
    }
    await handleOpenUrl(url);
  };

  const hasPrivacyLink = hasNativeLegalScreen || Boolean(privacyUrl);
  const hasTermsLink = hasNativeLegalScreen || Boolean(termsUrl);
  const hasSupportLink = hasNativeLegalScreen || Boolean(supportUrl);

  return (
    <View style={styles.fixedFooter}>
      {showResetActions ? (
        <Pressable
          onPress={onToggleResetForm}
          style={styles.inlineLink}
          accessibilityRole="button"
          accessibilityLabel={t('Passwort vergessen')}
        >
          <Text style={styles.inlineLinkText}>{t('Passwort vergessen?')}</Text>
        </Pressable>
      ) : null}

      {showResetActions && showResetForm ? (
        <View style={styles.resetContainer}>
          <TextInput
            value={resetEmail}
            onChangeText={setResetEmail}
            placeholder={t('deine@email.com')}
            placeholderTextColor="#64748B"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <Pressable
            onPress={onResetPassword}
            disabled={loadingReset}
            style={[
              styles.actionButton,
              styles.warningButton,
              loadingReset ? styles.warningButtonDisabled : null,
            ]}
          >
            {loadingReset ? (
              <ActivityIndicator color="#0F172A" />
            ) : (
              <Text style={styles.warningButtonText}>{t('Link senden')}</Text>
            )}
          </Pressable>
        </View>
      ) : null}

      <Pressable
        onPress={onSignOut}
        disabled={signingOut}
        style={signOutButtonStyles}
      >
        {signingOut ? (
          <ActivityIndicator color={resolvedGuest ? '#F8FAFC' : '#0F172A'} />
        ) : (
          <Text style={signOutTextStyle}>{signOutLabel}</Text>
        )}
      </Pressable>

      <View style={styles.legalRow}>
        <Pressable
          onPress={() => handleOpenLegal('privacy', privacyUrl)}
          disabled={!hasPrivacyLink}
          style={[
            styles.legalLink,
            !hasPrivacyLink ? styles.legalLinkDisabled : null,
          ]}
          accessibilityRole="link"
          accessibilityLabel={t('Datenschutz')}
        >
          <Text style={styles.legalLinkText}>{t('Datenschutz')}</Text>
        </Pressable>
        <Text style={styles.legalDivider}>|</Text>
        <Pressable
          onPress={() => handleOpenLegal('terms', termsUrl)}
          disabled={!hasTermsLink}
          style={[
            styles.legalLink,
            !hasTermsLink ? styles.legalLinkDisabled : null,
          ]}
          accessibilityRole="link"
          accessibilityLabel={t('AGB')}
        >
          <Text style={styles.legalLinkText}>{t('AGB')}</Text>
        </Pressable>
        <Text style={styles.legalDivider}>|</Text>
        <Pressable
          onPress={() => handleOpenLegal('support', supportUrl)}
          disabled={!hasSupportLink}
          style={[
            styles.legalLink,
            !hasSupportLink ? styles.legalLinkDisabled : null,
          ]}
          accessibilityRole="link"
          accessibilityLabel={t('Support')}
        >
          <Text style={styles.legalLinkText}>{t('Support')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

