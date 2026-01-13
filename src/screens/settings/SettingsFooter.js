import { ActivityIndicator, Linking, Pressable, Text, TextInput, View } from 'react-native';
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
}) {
  const privacyUrl = process.env.EXPO_PUBLIC_PRIVACY_URL;
  const termsUrl = process.env.EXPO_PUBLIC_TERMS_URL;
  const supportUrl = process.env.EXPO_PUBLIC_SUPPORT_URL;
  const signOutLabel = isGuest ? 'Anmelden' : 'Abmelden';
  const signOutButtonStyles = isGuest
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
  const signOutTextStyle = isGuest ? styles.primaryButtonText : styles.dangerButtonText;

  const handleOpenUrl = async (url) => {
    if (!url) {
      return;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        console.warn('Link konnte nicht geoeffnet werden.');
        return;
      }
      await Linking.openURL(url);
    } catch (err) {
      console.warn('Fehler beim Oeffnen des Links:', err);
    }
  };

  return (
    <View style={styles.fixedFooter}>
      {showResetActions ? (
        <Pressable
          onPress={onToggleResetForm}
          style={styles.inlineLink}
          accessibilityRole="button"
          accessibilityLabel="Passwort vergessen"
        >
          <Text style={styles.inlineLinkText}>Passwort vergessen?</Text>
        </Pressable>
      ) : null}

      {showResetActions && showResetForm ? (
        <View style={styles.resetContainer}>
          <TextInput
            value={resetEmail}
            onChangeText={setResetEmail}
            placeholder="deine@email.com"
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
              <Text style={styles.warningButtonText}>Link senden</Text>
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
          <ActivityIndicator color={isGuest ? '#F8FAFC' : '#0F172A'} />
        ) : (
          <Text style={signOutTextStyle}>{signOutLabel}</Text>
        )}
      </Pressable>

      <View style={styles.legalRow}>
        <Pressable
          onPress={() => handleOpenUrl(privacyUrl)}
          disabled={!privacyUrl}
          style={[
            styles.legalLink,
            !privacyUrl ? styles.legalLinkDisabled : null,
          ]}
          accessibilityRole="link"
          accessibilityLabel="Datenschutz"
        >
          <Text style={styles.legalLinkText}>Datenschutz</Text>
        </Pressable>
        <Text style={styles.legalDivider}>|</Text>
        <Pressable
          onPress={() => handleOpenUrl(termsUrl)}
          disabled={!termsUrl}
          style={[
            styles.legalLink,
            !termsUrl ? styles.legalLinkDisabled : null,
          ]}
          accessibilityRole="link"
          accessibilityLabel="AGB"
        >
          <Text style={styles.legalLinkText}>AGB</Text>
        </Pressable>
        <Text style={styles.legalDivider}>|</Text>
        <Pressable
          onPress={() => handleOpenUrl(supportUrl)}
          disabled={!supportUrl}
          style={[
            styles.legalLink,
            !supportUrl ? styles.legalLinkDisabled : null,
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
