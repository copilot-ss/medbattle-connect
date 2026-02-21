import { ActivityIndicator, View } from 'react-native';
import { useCallback, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ConnectivityProvider } from './context/ConnectivityContext';
import { PreferencesProvider } from './context/PreferencesContext';
import useAuthSession from './hooks/useAuthSession';
import useLobbyInviteMonitor from './hooks/useLobbyInviteMonitor';
import useOfflineSync from './hooks/useOfflineSync';
import LobbyInviteOverlay from './components/LobbyInviteOverlay';
import AuthScreen from './screens/AuthScreen';
import AvatarEditScreen from './screens/AvatarEditScreen';
import CategoryDetailScreen from './screens/CategoryDetailScreen';
import FriendsScreen from './screens/FriendsScreen';
import LegalScreen from './screens/LegalScreen';
import MultiplayerLobbyScreen from './screens/MultiplayerLobbyScreen';
import QuizScreen from './screens/QuizScreen';
import ResultScreen from './screens/ResultScreen';
import UsernameSetupScreen from './screens/UsernameSetupScreen';
import MainTabs from './navigation/MainTabs';
import { setGameplayNotificationSuppressed } from './services/notificationsService';
import styles from './styles/AppNavigator.styles';

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

function AppNavigatorInner() {
  const {
    isAuthenticated,
    needsUsernameSetup,
    initializing,
    setGuestSession,
    clearSession,
  } = useAuthSession();
  useOfflineSync();
  const navigationRef = useRef(null);
  const navigatorKey = isAuthenticated
    ? `authenticated-${needsUsernameSetup ? 'username' : 'ready'}`
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
      keepCompleted: true,
      difficulty: match?.difficulty ?? 'mittel',
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

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
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
            <Stack.Screen name="AvatarEdit" component={AvatarEditScreen} />
            <Stack.Screen name="Friends" component={FriendsScreen} />
            <Stack.Screen name="Legal" component={LegalScreen} />
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
