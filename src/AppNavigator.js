import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ConnectivityProvider } from './context/ConnectivityContext';
import { PreferencesProvider, usePreferences } from './context/PreferencesContext';
import {
  clearGuestPreferencesStorage,
  clearPendingGuestAccountTransfer,
  loadPendingGuestAccountTransfer,
} from './context/preferences/storage';
import useAuthCallbackLinking from './hooks/useAuthCallbackLinking';
import useAuthSession from './hooks/useAuthSession';
import useLobbyInviteMonitor from './hooks/useLobbyInviteMonitor';
import useOfflineSync from './hooks/useOfflineSync';
import LobbyInviteOverlay from './components/LobbyInviteOverlay';
import GameBackground from './components/game/GameBackground';
import AuthScreen from './screens/AuthScreen';
import AvatarEditScreen from './screens/AvatarEditScreen';
import CategoryDetailScreen from './screens/CategoryDetailScreen';
import FriendsScreen from './screens/FriendsScreen';
import LegalScreen from './screens/LegalScreen';
import MultiplayerLobbyScreen from './screens/MultiplayerLobbyScreen';
import QuizScreen from './screens/QuizScreen';
import ResultScreen from './screens/ResultScreen';
import SettingsHelpScreen from './screens/SettingsHelpScreen';
import UsernameSetupScreen from './screens/UsernameSetupScreen';
import MainTabs from './navigation/MainTabs';
import {
  applyGuestPreferencesToAccount,
  fetchAccountPreferences,
  hasMeaningfulAccountProgress,
  hasRemoteUserProgress,
} from './services/accountPreferencesService';
import { setGameplayNotificationSuppressed } from './services/notificationsService';
import { useTranslation } from './i18n/useTranslation';
import styles from './screens/styles/AppNavigator.styles';

const Stack = createNativeStackNavigator();

function getActiveRouteName(state) {
  if (!state?.routes?.length) {
    return null;
  }
  const activeRoute = state.routes[state.index ?? 0];
  if (activeRoute?.state) {
    return getActiveRouteName(activeRoute.state);
  }
  return activeRoute?.name ?? null;
}

function getPreferencesOwnerForAuth(session, isGuestSession) {
  if (!session?.user?.id || isGuestSession) {
    return { type: 'guest' };
  }
  return { type: 'user', userId: session.user.id };
}

function getPreferencesOwnerKey(owner) {
  return owner?.type === 'user' && owner.userId
    ? `user:${owner.userId}`
    : 'guest';
}

function AppNavigatorInner() {
  const { t } = useTranslation();
  const {
    session,
    isAuthenticated,
    isGuestSession,
    needsUsernameSetup,
    initializing,
    setGuestSession,
    clearSession,
  } = useAuthSession();
  const {
    switchAccountOwner,
    accountOwnerKey,
    loading: preferencesLoading,
  } = usePreferences();
  useOfflineSync();
  const navigationRef = useRef(null);
  const [preferencesSwitching, setPreferencesSwitching] = useState(false);
  const [preferencesSwitchError, setPreferencesSwitchError] = useState(null);
  const [preferencesSwitchRetry, setPreferencesSwitchRetry] = useState(0);
  const [guestTransferLoading, setGuestTransferLoading] = useState(false);
  const transferInFlightRef = useRef(false);
  const targetOwner = useMemo(
    () => getPreferencesOwnerForAuth(session, isGuestSession),
    [isGuestSession, session?.user?.id]
  );
  const targetOwnerKey = useMemo(
    () => getPreferencesOwnerKey(targetOwner),
    [targetOwner]
  );
  const navigatorKey = isAuthenticated
    ? `authenticated-${needsUsernameSetup ? 'username' : 'ready'}-${targetOwnerKey}`
    : 'unauthenticated';

  const handleInviteAccepted = useCallback((match) => {
    if (!match) {
      return;
    }
    const navigation = navigationRef.current;
    if (!navigation) {
      return;
    }
    navigation.navigate('MultiplayerLobby', {
      existingMatch: match,
      mode: 'join',
    });
  }, []);

  const {
    activeInvite,
    remainingSeconds,
    acceptingInvite,
    decliningInvite,
    inviteError,
    acceptInvite,
    declineInvite,
  } = useLobbyInviteMonitor({
    onInviteAccepted: handleInviteAccepted,
  });
  useAuthCallbackLinking({ navigationRef });

  useEffect(() => {
    if (initializing || accountOwnerKey === targetOwnerKey) {
      return undefined;
    }

    let active = true;
    setPreferencesSwitching(true);
    setPreferencesSwitchError(null);

    switchAccountOwner(targetOwner)
      .then((result) => {
        if (!result?.ok) {
          throw result?.error ?? new Error('Account-Speicher konnte nicht gewechselt werden.');
        }
      })
      .catch((err) => {
        console.warn('Konnte Account-Speicher nicht wechseln:', err);
        if (active) {
          setPreferencesSwitchError(err);
        }
      })
      .finally(() => {
        if (active) {
          setPreferencesSwitching(false);
        }
      });

    return () => {
      active = false;
    };
  }, [
    accountOwnerKey,
    initializing,
    preferencesSwitchRetry,
    switchAccountOwner,
    targetOwner,
    targetOwnerKey,
  ]);

  useEffect(() => {
    if (
      initializing ||
      isGuestSession ||
      !session?.user?.id ||
      accountOwnerKey !== targetOwnerKey ||
      transferInFlightRef.current
    ) {
      return undefined;
    }

    let active = true;
    const userId = session.user.id;
    transferInFlightRef.current = true;

    async function processPendingGuestTransfer() {
      const pendingTransfer = await loadPendingGuestAccountTransfer();
      const guestSnapshot = pendingTransfer?.snapshot;

      if (!hasMeaningfulAccountProgress(guestSnapshot)) {
        await clearPendingGuestAccountTransfer();
        return;
      }

      setGuestTransferLoading(true);

      try {
        const remote = await fetchAccountPreferences(userId);
        if (!remote.ok) {
          throw remote.error ?? new Error('Account progress could not be loaded.');
        }

        const accountAlreadyHasProgress =
          hasRemoteUserProgress(remote.progress) ||
          hasMeaningfulAccountProgress(remote.state);

        if (!accountAlreadyHasProgress) {
          const transferResult = await applyGuestPreferencesToAccount(
            userId,
            guestSnapshot
          );
          if (!transferResult.ok) {
            throw transferResult.error ?? new Error('Guest progress could not be transferred.');
          }
        }

        await clearGuestPreferencesStorage();
        await clearPendingGuestAccountTransfer();
        await switchAccountOwner({ type: 'user', userId }, { force: true });
      } catch (err) {
        console.warn('Gastfortschritt konnte nicht verarbeitet werden:', err);
      } finally {
        if (active) {
          setGuestTransferLoading(false);
        }
      }
    }

    processPendingGuestTransfer()
      .finally(() => {
        transferInFlightRef.current = false;
      });

    return () => {
      active = false;
    };
  }, [
    accountOwnerKey,
    initializing,
    isGuestSession,
    session?.user?.id,
    switchAccountOwner,
    targetOwnerKey,
  ]);

  const handleNavigationStateChange = useCallback((state) => {
    const activeRouteName = getActiveRouteName(state);
    const isGameplayRoute = activeRouteName === 'Quiz';
    setGameplayNotificationSuppressed(isGameplayRoute);
  }, []);

  useEffect(() => {
    return () => {
      setGameplayNotificationSuppressed(false);
    };
  }, []);

  if (preferencesSwitchError && accountOwnerKey !== targetOwnerKey) {
    return (
      <View style={styles.loadingContainer}>
        <GameBackground intensity="subtle" />
        <View style={styles.initializationErrorCard}>
          <Text style={styles.initializationErrorTitle}>
            {t('Daten konnten nicht geladen werden')}
          </Text>
          <Text style={styles.initializationErrorText}>
            {t('Bitte versuche es erneut oder melde dich ab.')}
          </Text>
          <Pressable
            onPress={() => setPreferencesSwitchRetry((value) => value + 1)}
            style={styles.initializationRetryButton}
            accessibilityRole="button"
          >
            <Text style={styles.initializationRetryButtonText}>
              {t('Erneut versuchen')}
            </Text>
          </Pressable>
          <Pressable
            onPress={clearSession}
            style={styles.initializationSignOutButton}
            accessibilityRole="button"
          >
            <Text style={styles.initializationSignOutButtonText}>
              {t('Abmelden')}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (
    initializing ||
    preferencesLoading ||
    preferencesSwitching ||
    guestTransferLoading ||
    accountOwnerKey !== targetOwnerKey
  ) {
    return (
      <View style={styles.loadingContainer}>
        <GameBackground intensity="subtle" />
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <NavigationContainer
      key={navigatorKey}
      ref={navigationRef}
      onStateChange={handleNavigationStateChange}
    >
      <Stack.Navigator
        key={navigatorKey}
        initialRouteName={
          isAuthenticated
            ? needsUsernameSetup
              ? 'UsernameSetup'
              : 'MainTabs'
            : 'Auth'
        }
        screenOptions={{ headerShown: false }}
      >
        {isAuthenticated ? (
          <>
            {needsUsernameSetup ? (
              <Stack.Screen name="UsernameSetup" component={UsernameSetupScreen} />
            ) : null}
            <Stack.Screen name="MainTabs">
              {(props) => (
                <MainTabs
                  {...props}
                  onClearSession={clearSession}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
            <Stack.Screen
              name="AvatarEdit"
              component={AvatarEditScreen}
              options={{
                gestureEnabled: true,
                fullScreenGestureEnabled: true,
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen name="Friends" component={FriendsScreen} />
            <Stack.Screen name="Legal">
              {(props) => (
                <LegalScreen
                  {...props}
                  onClearSession={clearSession}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="SettingsHelp" component={SettingsHelpScreen} />
            <Stack.Screen name="MultiplayerLobby" component={MultiplayerLobbyScreen} />
            <Stack.Screen name="Quiz" component={QuizScreen} />
            <Stack.Screen name="Result" component={ResultScreen} />
            <Stack.Screen name="Auth">
              {(props) => (
                <AuthScreen
                  {...props}
                  onGuest={setGuestSession}
                />
              )}
            </Stack.Screen>
          </>
        ) : (
          <Stack.Screen name="Auth">
            {(props) => (
              <AuthScreen
                {...props}
                onGuest={setGuestSession}
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
      <LobbyInviteOverlay
        invite={activeInvite}
        remainingSeconds={remainingSeconds}
        acceptingInvite={acceptingInvite}
        decliningInvite={decliningInvite}
        inviteError={inviteError}
        onAccept={acceptInvite}
        onDecline={declineInvite}
      />
    </NavigationContainer>
  );
}

export default function AppNavigator() {
  return (
    <ConnectivityProvider>
      <PreferencesProvider>
        <AppNavigatorInner />
      </PreferencesProvider>
    </ConnectivityProvider>
  );
}
