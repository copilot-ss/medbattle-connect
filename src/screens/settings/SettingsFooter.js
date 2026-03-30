import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/SettingsScreen.styles';

export default function SettingsFooter({
  signingOut,
  onSignOut,
  isGuest = false,
  authResolved = false,
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

  return (
    <View style={styles.footerStack}>
      <Pressable
        onPress={onSignOut}
        disabled={signingOut}
        style={[signOutButtonStyles, styles.footerPrimary]}
      >
        {signingOut ? (
          <ActivityIndicator color={resolvedGuest ? '#F8FAFC' : '#0F172A'} />
        ) : (
          <Text style={signOutTextStyle}>{signOutLabel}</Text>
        )}
      </Pressable>
    </View>
  );
}
