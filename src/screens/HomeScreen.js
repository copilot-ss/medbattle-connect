import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, Text, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import styles, {
  getModeCardContainerStyle,
  getModeCardTitleStyle,
} from './styles/HomeScreen.styles';
import { usePreferences } from '../context/PreferencesContext';
import { getInAppPurchases } from '../lib/inAppPurchases';
import usePremiumStatus from '../hooks/usePremiumStatus';
import AdBanner from '../components/AdBanner';

const DEFAULT_DIFFICULTY = 'mittel';
const doctorAnimation = require('../../assets/animations/doctor/doctor.json');
const BOOST_PRODUCT_ID = 'energy_boost_20';



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

function ModeCard({ title, subtitle, accent, onPress, disabled = false }) {
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
        style={[styles.modeCardPressable, disabled ? styles.modeCardDisabled : null]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
      >
        <Text style={getModeCardTitleStyle(accent)}>{title}</Text>
        {subtitle ? <Text style={styles.modeCardSubtitle}>{subtitle}</Text> : null}
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen({ navigation, route }) {
  const activeLobby = route?.params?.activeLobby ?? null;
  const hasActiveLobby = Boolean(activeLobby?.code);
  const {
    energy,
    energyMax,
    nextEnergyAt,
    consumeEnergy,
    boostEnergy,
    refreshEnergy,
  } = usePreferences();
  const { premium } = usePremiumStatus();
  const [energyMessage, setEnergyMessage] = useState(null);
  const [boosting, setBoosting] = useState(false);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const iapModule = useMemo(() => getInAppPurchases(), []);
  const iapAvailable = Boolean(iapModule && typeof iapModule.connectAsync === 'function');
  const [iapReady, setIapReady] = useState(iapAvailable && Platform.OS !== 'android');
  const [nextEnergyCountdown, setNextEnergyCountdown] = useState('');

  useEffect(() => {
    refreshEnergy();
    const intervalId = setInterval(() => {
      refreshEnergy();
    }, 30000);
    return () => clearInterval(intervalId);
  }, [refreshEnergy]);

  useEffect(() => {
    if (!nextEnergyAt) {
      setNextEnergyCountdown('');
      return undefined;
    }

    const formatCountdown = (target) => {
      const diff = Math.max(0, target - Date.now());
      const totalSeconds = Math.floor(diff / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    setNextEnergyCountdown(formatCountdown(nextEnergyAt));

    const timerId = setInterval(() => {
      const diff = nextEnergyAt - Date.now();
      if (diff <= 0) {
        refreshEnergy();
        setNextEnergyCountdown('');
        clearInterval(timerId);
        return;
      }
      setNextEnergyCountdown(formatCountdown(nextEnergyAt));
    }, 1000);

    return () => clearInterval(timerId);
  }, [nextEnergyAt, refreshEnergy]);

  useEffect(() => {
    if (Platform.OS !== 'android' || !iapAvailable) {
      return undefined;
    }

    let cancelled = false;

    iapModule.setPurchaseListener(async ({ responseCode, results, errorCode }) => {
      if (responseCode === iapModule.IAPResponseCode.OK) {
        for (const purchase of results) {
          if (purchase.productId === BOOST_PRODUCT_ID && !purchase.acknowledged) {
            try {
              await iapModule.finishTransactionAsync(purchase, false);
              await boostEnergy();
              setEnergyMessage('⚡ Energie aufgefuellt!');
              setShowBoostModal(false);
            } catch (err) {
              setEnergyMessage('Boost konnte nicht abgeschlossen werden.');
            }
          }
        }
      } else if (responseCode === iapModule.IAPResponseCode.USER_CANCELED) {
        setEnergyMessage('Boost abgebrochen.');
      } else if (errorCode) {
        setEnergyMessage('Boost fehlgeschlagen. Bitte spaeter erneut.');
      }
      setBoosting(false);
    });

    async function initIap() {
      try {
        await iapModule.connectAsync();
        await iapModule.getProductsAsync([BOOST_PRODUCT_ID]);
        if (!cancelled) {
          setIapReady(true);
        }
      } catch (err) {
        console.warn('IAP nicht verfuegbar:', err);
        if (!cancelled) {
          setEnergyMessage('Boost im Moment nicht verfuegbar.');
        }
      }
    }

    initIap();

    return () => {
      cancelled = true;
      iapModule.disconnectAsync().catch(() => {});
    };
  }, [boostEnergy, iapAvailable, iapModule]);

  const quickPlayDisabled = !premium && energy <= 0;
  const quickPlaySubtitle = premium
    ? 'Premium: unbegrenzt spielen'
    : `⚡ ${energy}/${energyMax}${nextEnergyCountdown ? ` • ${nextEnergyCountdown}` : ''}`;

  function handleCreateLobby() {
    if (hasActiveLobby) {
      navigation.navigate('MultiplayerLobby');
      return;
    }
    navigation.navigate('MultiplayerLobby', {
      difficulty: DEFAULT_DIFFICULTY,
      mode: 'create',
    });
  }

  function handleJoinLobby() {
    if (hasActiveLobby) {
      navigation.navigate('MultiplayerLobby');
      return;
    }
    navigation.navigate('MultiplayerLobby', {
      difficulty: DEFAULT_DIFFICULTY,
      mode: 'join',
    });
  }

  async function startQuickPlay() {
    setEnergyMessage(null);
    if (!premium) {
      const result = await consumeEnergy();
      if (!result.ok) {
        setShowBoostModal(true);
      setEnergyMessage('Keine Energie. Warte auf Aufladung oder nutze einen ⚡ Boost.');
        return;
      }
    }
    navigation.navigate('Quiz', {
      difficulty: DEFAULT_DIFFICULTY,
      mode: 'quick',
      questionLimit: 6,
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MedBattle</Text>

        <View style={styles.quickActions}>
          <Pressable
            onPress={() => navigation.navigate('Leaderboard')}
            style={styles.leaderboardButton}
          >
            <Ionicons name="trophy" size={22} color="#FACC15" style={styles.leaderboardIcon} />
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('Settings', { focus: 'audio' })}
            style={styles.menuButton}
          >
            <Ionicons name="settings" size={28} color="#E2E8F0" style={styles.menuIcon} />
          </Pressable>
        </View>
      </View>

      {hasActiveLobby ? (
        <Pressable
          style={styles.activeLobbyBanner}
          onPress={() =>
            navigation.navigate('MultiplayerLobby', {
              existingMatch: activeLobby.existingMatch ?? null,
              mode: 'create',
            })
          }
        >
          <Text style={styles.activeLobbyTitle}>Lobby {activeLobby.players ?? 1}/{activeLobby.capacity ?? 2}</Text>
          <Text style={styles.activeLobbyCode}>{activeLobby.code ?? ''}</Text>
        </Pressable>
      ) : null}

      <View style={styles.animationWrapper} pointerEvents="none">
        <LottieView
          source={doctorAnimation}
          style={styles.animationView}
          autoPlay
          loop
        />
      </View>

      <View
        style={[
          styles.modeSection,
          hasActiveLobby ? styles.modeSectionCompact : null,
        ]}
      >
        <ModeCard title="Create Lobby" accent="#38E4AE" onPress={handleCreateLobby} disabled={hasActiveLobby} />
        <ModeCard title="Join Lobby" accent="#60A5FA" onPress={handleJoinLobby} disabled={hasActiveLobby} />
        <ModeCard
          title="Quick Play"
          subtitle={quickPlaySubtitle}
          accent="#FDE68A"
          onPress={startQuickPlay}
          disabled={quickPlayDisabled}
        />
      </View>

      {energyMessage ? (
        <Text style={styles.energyMessage}>{energyMessage}</Text>
      ) : null}

      <View style={styles.flexSpacer} />
      <AdBanner style={styles.adSlot} />

      {!premium && showBoostModal ? (
        <View style={styles.boostOverlay}>
          <View style={styles.boostCard}>
            <Text style={styles.boostTitle}>⚡ Energie leer</Text>
            <Text style={styles.boostText}>
              Warte 30 Minuten pro Blitz oder lade sofort auf.
            </Text>
            <View style={styles.boostActions}>
              <Pressable
                onPress={() => setShowBoostModal(false)}
                style={[styles.boostButtonGhost]}
                disabled={boosting}
              >
                <Text style={styles.boostGhostText}>Schliessen</Text>
              </Pressable>
              <Pressable
                onPress={async () => {
                  if (boosting) return;
                  if (!iapReady || !iapAvailable || !iapModule) {
                    setEnergyMessage('Boost im Moment nicht verfuegbar.');
                    return;
                  }
                  setBoosting(true);
                  try {
                    await iapModule.requestPurchaseAsync({ sku: BOOST_PRODUCT_ID });
                  } catch (err) {
                    setEnergyMessage('Boost fehlgeschlagen. Bitte spaeter erneut versuchen.');
                    setBoosting(false);
                  }
                }}
                style={[styles.boostButton, boosting ? styles.boostButtonDisabled : null]}
                disabled={boosting}
              >
                <Text style={styles.boostButtonText}>
                  {boosting ? 'Lade...' : 'Boost (99ct) auf 20/20'}
                </Text>
              </Pressable>
            </View>
            <Text style={styles.boostHint}>Blitze laden auch automatisch auf.</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}


