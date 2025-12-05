import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
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
}) {
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
        style={[
          styles.actionButton,
          styles.dangerButton,
          signingOut ? styles.dangerButtonDisabled : null,
        ]}
      >
        {signingOut ? (
          <ActivityIndicator color="#0F172A" />
        ) : (
          <Text style={styles.dangerButtonText}>Abmelden</Text>
        )}
      </Pressable>
    </View>
  );
}
