import { ActivityIndicator, Text, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import { formatUserError } from '../../utils/formatUserError';
import styles from '../styles/MultiplayerLobbyScreen.styles';

const SUPABASE_URL_HINT = process.env.EXPO_PUBLIC_SUPABASE_URL;

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
  const showCreateOnlyLoading = Boolean(
    isCreateOnly && !currentMatch && !showProfileLoading && !showMatchesError && creating
  );
  const matchesErrorMessage = showMatchesError
    ? formatUserError(matchesError, {
        supabaseUrl: SUPABASE_URL_HINT,
        fallback: t('Es ist ein Fehler aufgetreten.'),
      })
    : null;

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
          <Text style={styles.errorMessage}>{matchesErrorMessage}</Text>
        </View>
      ) : null}

      {showCreateOnlyLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#60A5FA" />
          <Text style={styles.loadingText}>{t('Lobby wird erstellt ...')}</Text>
        </View>
      ) : null}
    </>
  );
}
