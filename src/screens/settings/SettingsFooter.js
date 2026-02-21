import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
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

  const handleOpenLegal = (doc) => {
    if (hasNativeLegalScreen) {
      onOpenLegal(doc);
    }
  };

  const hasPrivacyLink = hasNativeLegalScreen;
  const hasTermsLink = hasNativeLegalScreen;
  const hasSupportLink = hasNativeLegalScreen;

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
          onPress={() => handleOpenLegal('privacy')}
          disabled={!hasPrivacyLink}
          style={[
            styles.legalLink,
            !hasPrivacyLink ? styles.legalLinkDisabled : null,
          ]}
          accessibilityRole="link"
          accessibilityLabel="Privacy"
        >
          <Text style={styles.legalLinkText}>Privacy</Text>
        </Pressable>
        <Text style={styles.legalDivider}>|</Text>
        <Pressable
          onPress={() => handleOpenLegal('terms')}
          disabled={!hasTermsLink}
          style={[
            styles.legalLink,
            !hasTermsLink ? styles.legalLinkDisabled : null,
          ]}
          accessibilityRole="link"
          accessibilityLabel="Terms"
        >
          <Text style={styles.legalLinkText}>Terms</Text>
        </Pressable>
        <Text style={styles.legalDivider}>|</Text>
        <Pressable
          onPress={() => handleOpenLegal('support')}
          disabled={!hasSupportLink}
          style={[
            styles.legalLink,
            !hasSupportLink ? styles.legalLinkDisabled : null,
          ]}
          accessibilityRole="link"
          accessibilityLabel="Support"
        >
          <Text style={styles.legalLinkText}>Support</Text>
        </Pressable>
      </View>
    </View>
  );
}
