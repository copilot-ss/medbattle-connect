import { useCallback, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { formatUserError } from '../../utils/formatUserError';
import { useTranslation } from '../../i18n/useTranslation';
import { linkOAuth } from '../auth/authOAuth';
import { normalizeEmail } from './utils';

const PASSWORD_RESET_REDIRECT =
  process.env.EXPO_PUBLIC_PASSWORD_RESET_REDIRECT ??
  process.env.EXPO_PUBLIC_EMAIL_CONFIRM_REDIRECT ??
  'medbattle://auth/callback';

const EMAIL_UPDATE_REDIRECT =
  process.env.EXPO_PUBLIC_EMAIL_UPDATE_REDIRECT ??
  process.env.EXPO_PUBLIC_EMAIL_CONFIRM_REDIRECT ??
  'medbattle://auth/callback';
const SUPABASE_URL_HINT = process.env.EXPO_PUBLIC_SUPABASE_URL;

export default function useSettingsAuth({
  navigation,
  onClearSession,
  authUserId,
  isGuest,
}) {
  const { t } = useTranslation();
  const [newEmail, setNewEmail] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loadingReset, setLoadingReset] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [linkingGoogle, setLinkingGoogle] = useState(false);

  const handlePasswordReset = useCallback(async () => {
    const targetEmail = normalizeEmail(resetEmail);

    if (loadingReset || !targetEmail) {
      return;
    }

    setFeedback(null);
    setLoadingReset(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        targetEmail,
        {
          redirectTo: PASSWORD_RESET_REDIRECT,
        }
      );

      if (resetError) {
        throw resetError;
      }

      setFeedback(t('Link zum Zurücksetzen wurde gesendet.'));
      setResetEmail('');
      setShowResetForm(false);
    } catch (err) {
      setFeedback(
        formatUserError(err, {
          supabaseUrl: SUPABASE_URL_HINT,
          fallback: t('Passwort konnte nicht zurückgesetzt werden.'),
        })
      );
    } finally {
      setLoadingReset(false);
    }
  }, [loadingReset, resetEmail]);

  const handleEmailUpdate = useCallback(async () => {
    if (loadingEmail) {
      return;
    }

    const trimmed = normalizeEmail(newEmail);

    if (!trimmed) {
      setFeedback(t('Bitte neue E-Mail-Adresse eingeben.'));
      return;
    }

    if (!authUserId) {
      setFeedback(t('Bitte registriere dich, um eine E-Mail zu hinterlegen.'));
      navigation.navigate('Auth', { mode: 'signUp', emailPreset: trimmed });
      return;
    }

    setLoadingEmail(true);

    try {
      const { error } = await supabase.auth.updateUser({
        email: trimmed,
        emailRedirectTo: EMAIL_UPDATE_REDIRECT,
      });

      if (error) {
        throw error;
      }

      setFeedback(
        t('E-Mail-Update angefordert. Bitte bestätige die neue Adresse über den zugesandten Link.')
      );
      setNewEmail('');
    } catch (err) {
      setFeedback(
        formatUserError(err, {
          supabaseUrl: SUPABASE_URL_HINT,
          fallback: t('E-Mail konnte nicht aktualisiert werden. Bitte versuche es erneut.'),
        })
      );
    } finally {
      setLoadingEmail(false);
    }
  }, [authUserId, loadingEmail, navigation, newEmail]);

  const handleSignOut = useCallback(async () => {
    if (signingOut) {
      return;
    }

    setFeedback(null);
    setSigningOut(true);

    try {
      if (authUserId) {
        // Logouts von OAuth-Providern (z.B. Google) schlagen seltener fehl, wenn nur lokale Session gelöscht wird.
        await supabase.auth.signOut({ scope: 'local' });
        // Fallback: kompletter Logout, falls Remote-Session aktiv ist.
        await supabase.auth.signOut().catch(() => {});
      }
      if (onClearSession) {
        onClearSession();
      }
      navigation.navigate('Auth', isGuest ? { mode: 'signIn' } : undefined);
    } catch (err) {
      setFeedback(
        formatUserError(err, {
          supabaseUrl: SUPABASE_URL_HINT,
          fallback: t('Abmelden fehlgeschlagen.'),
        })
      );
    } finally {
      setSigningOut(false);
    }
  }, [authUserId, isGuest, navigation, onClearSession, signingOut]);

  const handleLinkGoogle = useCallback(async () => {
    if (linkingGoogle) {
      return;
    }

    if (!authUserId) {
      setFeedback(t('Bitte melde dich an, um Google zu verknüpfen.'));
      navigation.navigate('Auth', { mode: 'signIn' });
      return;
    }

    const result = await linkOAuth('google', setFeedback, setLinkingGoogle);
    if (result?.ok) {
      setFeedback(t('Google verbunden. Du kannst dich jetzt mit Google anmelden.'));
    }
  }, [authUserId, linkingGoogle, navigation]);

  const handleToggleResetForm = useCallback(
    () => setShowResetForm((prev) => !prev),
    []
  );

  return {
    newEmail,
    setNewEmail,
    feedback,
    loadingReset,
    loadingEmail,
    resetEmail,
    setResetEmail,
    showResetForm,
    setShowResetForm,
    handleToggleResetForm,
    handlePasswordReset,
    handleEmailUpdate,
    signingOut,
    handleSignOut,
    linkingGoogle,
    handleLinkGoogle,
  };
}
