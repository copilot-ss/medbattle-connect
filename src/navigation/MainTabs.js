import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import ShopScreen from '../screens/ShopScreen';
import FriendsScreen from '../screens/FriendsScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SwipeToHomeWrapper from '../components/SwipeToHomeWrapper';
import useFriendRequestMonitor from '../hooks/useFriendRequestMonitor';
import styles from '../styles/AppNavigator.styles';
import { colors } from '../styles/theme';
import { useTranslation } from '../i18n/useTranslation';
import {
  isDailyCoinsClaimAvailable,
  loadDailyCoinsClaimDate,
  subscribeDailyCoinsClaimDate,
} from '../services/dailyRewardsService';

const Tab = createBottomTabNavigator();
const SHOP_BADGE_REFRESH_INTERVAL_MS = 60 * 1000;

function useShopRewardBadge() {
  const [showShopRewardBadge, setShowShopRewardBadge] = useState(false);

  useEffect(() => {
    let active = true;

    const refreshIfActive = async () => {
      const claimDate = await loadDailyCoinsClaimDate();
      if (!active) {
        return;
      }
      setShowShopRewardBadge(isDailyCoinsClaimAvailable(claimDate));
    };

    void refreshIfActive();

    const unsubscribeClaimDate = subscribeDailyCoinsClaimDate((claimDate) => {
      if (!active) {
        return;
      }
      setShowShopRewardBadge(isDailyCoinsClaimAvailable(claimDate));
    });

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void refreshIfActive();
      }
    });

    const intervalId = setInterval(() => {
      void refreshIfActive();
    }, SHOP_BADGE_REFRESH_INTERVAL_MS);

    return () => {
      active = false;
      clearInterval(intervalId);
      appStateSubscription.remove();
      unsubscribeClaimDate();
    };
  }, []);

  return showShopRewardBadge;
}

export default function MainTabs({ onClearSession }) {
  const { t } = useTranslation();
  const { pendingRequestCount } = useFriendRequestMonitor();
  const showShopRewardBadge = useShopRewardBadge();

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
          tabBarBadge: showShopRewardBadge ? '' : undefined,
          tabBarBadgeStyle: showShopRewardBadge ? styles.tabBarDotBadge : undefined,
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
          tabBarBadge: pendingRequestCount > 0 ? pendingRequestCount : undefined,
          tabBarBadgeStyle: styles.tabBarBadge,
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
