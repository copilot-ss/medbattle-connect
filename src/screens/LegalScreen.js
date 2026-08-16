import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import GameBackground from '../components/game/GameBackground';
import { usePreferences } from '../context/PreferencesContext';
import { getSessionUser } from '../lib/supabaseClient';
import { deleteCurrentAccount } from '../services/accountDeletionService';
import { clearActiveLobby } from '../utils/activeLobbyStorage';
import { clearRememberedSession } from '../utils/authPersistence';
import { clearGuestMode } from '../utils/guestProfile';
import { formatUserError } from '../utils/formatUserError';
import { colors, fonts, radii } from '../styles/theme';
import {
  LEGAL_CONTACT_EMAIL,
  getLegalDocs,
} from './legal/legalContent';
import { useTranslation } from '../i18n/useTranslation';

const SECTION_SPACING = 16;
const SUPABASE_URL_HINT = process.env.EXPO_PUBLIC_SUPABASE_URL;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 36,
    gap: SECTION_SPACING,
  },
  card: {
    borderRadius: radii.lg,
    backgroundColor: 'rgba(36, 36, 58, 0.82)',
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 24,
  },
  meta: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: 2,
  },
  intro: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  paragraph: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  bullet: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  singleActionWrap: {
    marginTop: 6,
  },
  actionStack: {
    marginTop: 12,
    gap: 10,
  },
  browserButton: {
    borderRadius: radii.md,
    backgroundColor: colors.accent,
    paddingVertical: 12,
    alignItems: 'center',
  },
  browserButtonText: {
    color: '#001018',
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  destructiveButton: {
    borderRadius: radii.md,
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    alignItems: 'center',
  },
  destructiveButtonDisabled: {
    opacity: 0.7,
  },
  destructiveButtonText: {
    color: '#FFF7F7',
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  helperNote: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
  },
});

export default function LegalScreen({ navigation, route, onClearSession = null }) {
  const { locale } = useTranslation();
  const { resetAccountData } = usePreferences();
  const requestedDoc = route?.params?.doc;
  const docKey = typeof requestedDoc === 'string' ? requestedDoc : 'privacy';
  const legalDocs = getLegalDocs(locale);
  const legalDoc = legalDocs[docKey] || legalDocs.privacy;
  const updatedLabel = 'Updated';
  const supportButtonLabel = 'Contact support';
  const supportEmailLabel = 'Support email';
  const deleteRequestButtonLabel = 'Request deletion by email';
  const deleteRequestEmailLabel = 'Request account deletion by email';
  const deleteActionLabel = 'Delete account permanently';
  const deleteActionLoadingLabel = 'Deleting account...';
  const deleteAvailabilityHint =
    'If you are signed in, you can delete your account here directly. You can also use the public deletion page by email as a fallback.';
  const deleteUnavailableHint =
    'There is no cloud account active in this session right now. Use the email deletion request in that case.';
  const deleteConfirmTitle = 'Delete account now?';
  const deleteConfirmMessage =
    'Your account and associated data will be deleted permanently. This cannot be undone.';
  const deleteErrorTitle = 'Deletion failed';

  const mountedRef = useRef(true);
  const [deleteAvailable, setDeleteAvailable] = useState(false);
  const [deleteAvailabilityResolved, setDeleteAvailabilityResolved] = useState(
    docKey !== 'deleteAccount'
  );
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (docKey !== 'deleteAccount') {
      setDeleteAvailable(false);
      setDeleteAvailabilityResolved(true);
      return undefined;
    }

    let active = true;

    async function resolveDeleteAvailability() {
      setDeleteAvailabilityResolved(false);
      try {
        const user = await getSessionUser();
        if (!active) {
          return;
        }
        setDeleteAvailable(Boolean(user?.id));
      } catch (error) {
        if (active) {
          console.warn('Could not determine delete-account availability:', error);
          setDeleteAvailable(false);
        }
      } finally {
        if (active) {
          setDeleteAvailabilityResolved(true);
        }
      }
    }

    resolveDeleteAvailability();

    return () => {
      active = false;
    };
  }, [docKey]);

  const handleContact = useCallback(async () => {
    const mailto = `mailto:${LEGAL_CONTACT_EMAIL}`;
    try {
      const canOpen = await Linking.canOpenURL(mailto);
      if (canOpen) {
        await Linking.openURL(mailto);
      }
    } catch (error) {
      console.warn('Support email could not be opened:', error);
    }
  }, []);

  const handleDeleteAccountRequest = useCallback(async () => {
    const subject = 'DSAR - Deletion - <account email>';
    const body = [
      'Please delete my MedQuiz account and the associated data.',
      '',
      'Account email:',
      'Username (optional):',
      'Notes (optional):',
    ].join('\n');
    const mailto =
      `mailto:${LEGAL_CONTACT_EMAIL}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;
    try {
      const canOpen = await Linking.canOpenURL(mailto);
      if (canOpen) {
        await Linking.openURL(mailto);
      }
    } catch (error) {
      console.warn('Delete account email could not be opened:', error);
    }
  }, []);

  const runDeleteAccount = useCallback(async () => {
    if (deletingAccount) {
      return;
    }

    setDeletingAccount(true);

    try {
      const deleteResult = await deleteCurrentAccount();
      if (!deleteResult.ok) {
        throw deleteResult.error;
      }

      const cleanupResults = await Promise.allSettled([
        resetAccountData(),
        clearActiveLobby(),
        clearRememberedSession(),
        clearGuestMode(),
      ]);

      cleanupResults.forEach((result) => {
        if (result.status === 'rejected') {
          console.warn('Local delete-account cleanup failed:', result.reason);
        }
      });

      await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
      await supabase.auth.signOut().catch(() => {});

      onClearSession?.();

      if (!onClearSession) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        });
      }
    } catch (error) {
      if (!mountedRef.current) {
        return;
      }
      Alert.alert(
        deleteErrorTitle,
        formatUserError(error, {
          supabaseUrl: SUPABASE_URL_HINT,
          fallback:
            'The account could not be deleted. Please try again or use the email deletion request.',
        })
      );
    } finally {
      if (mountedRef.current) {
        setDeletingAccount(false);
      }
    }
  }, [
    deleteErrorTitle,
    deletingAccount,
    navigation,
    onClearSession,
    resetAccountData,
  ]);

  const handleDeleteAccountPress = useCallback(() => {
    Alert.alert(deleteConfirmTitle, deleteConfirmMessage, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          runDeleteAccount();
        },
      },
    ]);
  }, [deleteConfirmMessage, deleteConfirmTitle, runDeleteAccount]);

  return (
    <View style={styles.container}>
      <GameBackground intensity="subtle" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
            </Pressable>
          </View>
          <Text style={styles.title}>{legalDoc.title}</Text>
          <Text style={styles.meta}>
            {updatedLabel}: {legalDoc.updatedAt}
          </Text>
          <Text style={styles.intro}>{legalDoc.intro}</Text>
        </View>

        <View style={styles.card}>
          {legalDoc.sections.map((section) => (
            <View key={section.heading} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.heading}</Text>
              {section.paragraphs
                ? section.paragraphs.map((paragraph) => (
                    <Text key={paragraph} style={styles.paragraph}>
                      {paragraph}
                    </Text>
                  ))
                : null}
              {section.bullets
                ? section.bullets.map((bullet) => (
                    <Text key={bullet} style={styles.bullet}>
                      {'\u2022'} {bullet}
                    </Text>
                  ))
                : null}
            </View>
          ))}

          {legalDoc.id === 'support' ? (
            <View style={styles.singleActionWrap}>
              <Pressable
                style={styles.browserButton}
                onPress={handleContact}
                accessibilityRole="button"
                accessibilityLabel={supportEmailLabel}
              >
                <Text style={styles.browserButtonText}>{supportButtonLabel}</Text>
              </Pressable>
            </View>
          ) : null}

          {legalDoc.id === 'deleteAccount' ? (
            <View style={styles.actionStack}>
              <Text style={styles.helperNote}>
                {deleteAvailable ? deleteAvailabilityHint : deleteUnavailableHint}
              </Text>

              {deleteAvailabilityResolved ? (
                deleteAvailable ? (
                  <Pressable
                    style={[
                      styles.destructiveButton,
                      deletingAccount ? styles.destructiveButtonDisabled : null,
                    ]}
                    onPress={handleDeleteAccountPress}
                    disabled={deletingAccount}
                    accessibilityRole="button"
                    accessibilityLabel={deleteActionLabel}
                  >
                    {deletingAccount ? (
                      <ActivityIndicator color="#FFF7F7" />
                    ) : (
                      <Text style={styles.destructiveButtonText}>
                        {deletingAccount ? deleteActionLoadingLabel : deleteActionLabel}
                      </Text>
                    )}
                  </Pressable>
                ) : null
              ) : (
                <ActivityIndicator color={colors.accent} />
              )}

              <Pressable
                style={styles.browserButton}
                onPress={handleDeleteAccountRequest}
                accessibilityRole="button"
                accessibilityLabel={deleteRequestEmailLabel}
              >
                <Text style={styles.browserButtonText}>{deleteRequestButtonLabel}</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
