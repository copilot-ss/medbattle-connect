import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { PreferencesProvider } from './context/PreferencesContext';
import useAuthSession from './hooks/useAuthSession';
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import MultiplayerLobbyScreen from './screens/MultiplayerLobbyScreen';
import QuizScreen from './screens/QuizScreen';
import ResultScreen from './screens/ResultScreen';
import SettingsScreen from './screens/SettingsScreen';
import UsernameSetupScreen from './screens/UsernameSetupScreen';
import styles from './styles/AppNavigator.styles';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const {
    isAuthenticated,
    needsUsernameSetup,
    initializing,
    setGuestSession,
    clearSession,
  } = useAuthSession();
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
    <PreferencesProvider>
      <NavigationContainer key={navigatorKey}>
        <Stack.Navigator
          key={navigatorKey}
          initialRouteName={
            isAuthenticated
              ? needsUsernameSetup
                ? 'UsernameSetup'
                : 'Home'
              : 'Auth'
          }
          screenOptions={{ headerShown: false }}
        >
          {isAuthenticated ? (
            <>
              {needsUsernameSetup ? (
                <Stack.Screen name="UsernameSetup" component={UsernameSetupScreen} />
              ) : null}
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
              <Stack.Screen name="MultiplayerLobby" component={MultiplayerLobbyScreen} />
              <Stack.Screen name="Quiz" component={QuizScreen} />
              <Stack.Screen name="Result" component={ResultScreen} />
              <Stack.Screen name="Settings">
                {(props) => (
                  <SettingsScreen
                    {...props}
                    onClearSession={clearSession}
                  />
                )}
              </Stack.Screen>
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
    </PreferencesProvider>
  );
}
