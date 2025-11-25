import { useMemo, useRef, useState, useCallback } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import styles, {
  getModeCardContainerStyle,
  getModeCardTitleStyle,
} from './styles/HomeScreen.styles';

const DEFAULT_DIFFICULTY = 'mittel';
const MENU_GROUPS = [
  {
    title: 'Einstellungen',
    items: [{ label: 'Audio', action: 'settingsAudio' }],
  },
  {
    title: 'Profil',
    items: [
      { label: 'Passwort vergessen', action: 'profilePassword' },
      { label: 'Abmelden', action: 'profileLogout' },
    ],
  },
  {
    title: 'Freunde',
    items: [{ label: 'Freunde hinzufügen', action: 'friendsAdd' }],
  },
];

function parseHex(hex) {
  const normalized = hex.replace('#', '');
  const isShort = normalized.length === 3;
  const full = isShort
    ? normalized
        .split('')
        .map((char) => char + char)
        .join('')
    : normalized;

  const parsed = Number.parseInt(full, 16);
  const r = (parsed >> 16) & 255;
  const g = (parsed >> 8) & 255;
  const b = parsed & 255;

  return { r, g, b };
}

function hexToRgba(hex, alpha = 1) {
  const { r, g, b } = parseHex(hex);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function ModeCard({ title, accent, onPress }) {
  const glow = useRef(new Animated.Value(0)).current;
  const glowColors = useMemo(
    () => ({
      inactive: hexToRgba(accent, 0.7),
      active: hexToRgba(accent, 1),
    }),
    [accent]
  );

  function handlePressIn() {
    Animated.timing(glow, {
      toValue: 1,
      duration: 160,
      useNativeDriver: false,
    }).start();
  }

  function handlePressOut() {
    Animated.timing(glow, {
      toValue: 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }

  return (
    <Animated.View
      style={getModeCardContainerStyle(accent, glow, glowColors)}
    >
      <Pressable
        style={styles.modeCardPressable}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <Text style={getModeCardTitleStyle(accent)}>{title}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen({ navigation }) {
  const [menuOpen, setMenuOpen] = useState(false);

  function handleCreateLobby() {
    navigation.navigate('MultiplayerLobby', {
      difficulty: DEFAULT_DIFFICULTY,
      mode: 'create',
    });
  }

  function handleJoinLobby() {
    navigation.navigate('MultiplayerLobby', {
      difficulty: DEFAULT_DIFFICULTY,
      mode: 'join',
    });
  }

  function startCampaign() {
    navigation.navigate('Quiz', {
      difficulty: DEFAULT_DIFFICULTY,
    });
  }

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const handleMenuSelect = useCallback(
    (action) => {
      closeMenu();

      const focusMap = {
        settingsAudio: 'audio',
        profilePassword: 'password',
        profileLogout: 'logout',
        friendsAdd: 'friendsAdd',
      };

      const focus = focusMap[action];

      if (focus) {
        navigation.navigate('Settings', { focus });
      }
    },
    [closeMenu, navigation]
  );

  return (
    <View style={styles.container}>
      {menuOpen ? (
        <>
          <Pressable style={styles.menuOverlay} onPress={closeMenu} />
          <View pointerEvents="box-none" style={styles.menuContainer}>
            <View style={styles.menuCard}>
              {MENU_GROUPS.map((group, index) => (
                <View
                  key={group.title}
                  style={[
                    styles.menuGroup,
                    index + 1 < MENU_GROUPS.length ? styles.menuGroupSpacing : null,
                  ]}
                >
                  <Text style={styles.menuGroupTitle}>{group.title}</Text>
                  {group.items.map((item) => (
                    <Pressable
                      key={item.action}
                      onPress={() => handleMenuSelect(item.action)}
                      style={styles.menuItem}
                    >
                      <Text style={styles.menuItemLabel}>{item.label}</Text>
                    </Pressable>
                  ))}
                </View>
              ))}
            </View>
          </View>
        </>
      ) : null}
      <View style={styles.header}>
        <Text style={styles.title}>MedBattle</Text>

        <View style={styles.quickActions}>
          <Pressable
            onPress={() => navigation.navigate('Leaderboard')}
            style={styles.leaderboardButton}
          >
            <Ionicons name="trophy" size={22} color="#FACC15" style={styles.leaderboardIcon} />
          </Pressable>

          <Pressable onPress={toggleMenu} style={styles.menuButton}>
            <Ionicons name="menu" size={24} color="#E2E8F0" style={styles.menuIcon} />
          </Pressable>
        </View>
      </View>

      <View style={styles.modeSection}>
        <ModeCard title="Create Lobby" accent="#38E4AE" onPress={handleCreateLobby} />
        <ModeCard title="Join Lobby" accent="#60A5FA" onPress={handleJoinLobby} />
        <ModeCard title="Campaign" accent="#FDE68A" onPress={startCampaign} />
      </View>

      <View style={styles.flexSpacer} />
    </View>
  );
}
