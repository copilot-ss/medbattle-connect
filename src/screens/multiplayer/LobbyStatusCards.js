import { ActivityIndicator, Text, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/MultiplayerLobbyScreen.styles';

export default function LobbyStatusCards({
  loadingUser,
  matchesError,
  creating,
  isCreateOnly,
  currentMatch,
}) {
  const { t } = useTranslation();
  const showProfileLoading = Boolean(loadingUser);
  const showMatchesError = Boolean(matchesError);
  const showCreateOnlyLoading = Boolean(isCreateOnly && !currentMatch);

  return (
    <>
      {showProfileLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#60A5FA" />
          <Text style={styles.loadingText}>{t('Profil wird geladen ...')}</Text>
        </View>
      ) : null}

      {showMatchesError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>{t('Oops!')}</Text>
          <Text style={styles.errorMessage}>
            {t(matchesError.message ?? 'Es ist ein Fehler aufgetreten.')}
          </Text>
        </View>
      ) : null}

      {showCreateOnlyLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#60A5FA" />
          <Text style={styles.loadingText}>
            {creating ? t('Lobby wird erstellt ...') : t('Starte Lobby ...')}
          </Text>
        </View>
      ) : null}
    </>
  );
}
