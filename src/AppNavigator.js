import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ConnectivityProvider } from './context/ConnectivityContext';
import { PreferencesProvider } from './context/PreferencesContext';
import useAuthSession from './hooks/useAuthSession';
import useOfflineSync from './hooks/useOfflineSync';
import AuthScreen from './screens/AuthScreen';
import CategoryDetailScreen from './screens/CategoryDetailScreen';
import FriendsScreen from './screens/FriendsScreen';
import MultiplayerLobbyScreen from './screens/MultiplayerLobbyScreen';
import QuizScreen from './screens/QuizScreen';
import ResultScreen from './screens/ResultScreen';
import UsernameSetupScreen from './screens/UsernameSetupScreen';
import MainTabs from './navigation/MainTabs';
import styles from './styles/AppNavigator.styles';

const Stack = createNativeStackNavigator();

function AppNavigatorInner() {
  const {
    isAuthenticated,
    needsUsernameSetup,
    initializing,
    setGuestSession,
    clearSession,
  } = useAuthSession();
  useOfflineSync();
  const navigatorKey = isAuthenticated
    ? `authenticated-${needsUsernameSetup ? 'username' : 'ready'}`
    : 'unauthenticated';

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <NavigationContainer key={navigatorKey}>
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
            <Stack.Screen name="Friends" component={FriendsScreen} />
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
