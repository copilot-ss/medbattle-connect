import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import ShopScreen from '../screens/ShopScreen';
import FriendsScreen from '../screens/FriendsScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SwipeToHomeWrapper from '../components/SwipeToHomeWrapper';
import styles from '../styles/AppNavigator.styles';
import { colors } from '../styles/theme';
import { useTranslation } from '../i18n/useTranslation';

const Tab = createBottomTabNavigator();

export default function MainTabs({ onClearSession }) {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          tabBarLabel: t('Start'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      >
        {(props) => (
          <SwipeToHomeWrapper>
            <HomeScreen {...props} />
          </SwipeToHomeWrapper>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Shop"
        options={{
          tabBarLabel: t('Shop'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart" size={size} color={color} />
          ),
        }}
      >
        {(props) => (
          <SwipeToHomeWrapper>
            <ShopScreen {...props} />
          </SwipeToHomeWrapper>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Friends"
        options={{
          tabBarLabel: t('Freunde'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      >
        {(props) => (
          <SwipeToHomeWrapper>
            <FriendsScreen {...props} showClose={false} />
          </SwipeToHomeWrapper>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Profile"
        options={{
          tabBarLabel: t('Profil'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
        }}
      >
        {(props) => (
          <SwipeToHomeWrapper>
            <SettingsScreen
              {...props}
              onClearSession={onClearSession}
              lockedTab="profile"
              showTabs={false}
              showClose={false}
              title={t('Profil')}
            />
          </SwipeToHomeWrapper>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Leaderboard"
        options={{
          tabBarLabel: t('Bestenliste'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={size} color={color} />
          ),
        }}
      >
        {(props) => (
          <SwipeToHomeWrapper>
            <LeaderboardScreen {...props} showClose={false} />
          </SwipeToHomeWrapper>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Settings"
        options={{
          tabBarLabel: t('Einstellungen'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      >
        {(props) => (
          <SwipeToHomeWrapper>
            <SettingsScreen
              {...props}
              onClearSession={onClearSession}
              lockedTab="settings"
              showTabs={false}
              showClose={false}
              title={t('Einstellungen')}
            />
          </SwipeToHomeWrapper>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
