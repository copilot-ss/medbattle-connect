import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Platform, Text, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/MultiplayerLobbyScreen.styles';

const NativeBlurView = (() => {
  if (Platform.OS === 'android') {
    return null;
  }
  try {
    return require('expo-blur').BlurView;
  } catch (_error) {
    return null;
  }
})();

export default function LobbyStartCountdownOverlay({
  visible = false,
  countdownValue = 3,
}) {
  const { t } = useTranslation();
  const useNativeBlur = NativeBlurView != null;
  const textScale = useRef(new Animated.Value(0.75)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const didRunEntryRef = useRef(false);

  useEffect(() => {
    if (!visible) {
      didRunEntryRef.current = false;
      textScale.setValue(0.75);
      textOpacity.setValue(0);
      overlayOpacity.setValue(0);
      return;
    }

    if (didRunEntryRef.current) {
      return;
    }

    didRunEntryRef.current = true;
    Animated.timing(overlayOpacity, {
      toValue: 1,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [overlayOpacity, textOpacity, textScale, visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    textScale.setValue(0.68);
    textOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 160,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(textScale, {
        toValue: 1,
        tension: 110,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [countdownValue, textOpacity, textScale, visible]);

  const countdownLabel = useMemo(() => {
    if (countdownValue === 'go') {
      return t('Los!');
    }
    return String(countdownValue ?? '');
  }, [countdownValue, t]);

  const countdownPalette = useMemo(() => {
    if (countdownValue === 'go') {
      return {
        primary: '#52FF9B',
        secondary: '#00D4FF',
        border: 'rgba(82, 255, 155, 0.92)',
        glow: 'rgba(82, 255, 155, 0.72)',
        card: 'rgba(8, 28, 20, 0.9)',
      };
    }

    switch (Number(countdownValue)) {
      case 3:
        return {
          primary: '#FF6B6B',
          secondary: '#FFD166',
          border: 'rgba(255, 125, 102, 0.94)',
          glow: 'rgba(255, 107, 107, 0.7)',
          card: 'rgba(42, 14, 18, 0.9)',
        };
      case 2:
        return {
          primary: '#FFB703',
          secondary: '#FF4D6D',
          border: 'rgba(255, 196, 61, 0.94)',
          glow: 'rgba(255, 183, 3, 0.72)',
          card: 'rgba(44, 24, 6, 0.9)',
        };
      case 1:
      default:
        return {
          primary: '#7CFF6B',
          secondary: '#27C2FF',
          border: 'rgba(124, 255, 107, 0.94)',
          glow: 'rgba(124, 255, 107, 0.7)',
          card: 'rgba(10, 34, 20, 0.9)',
        };
    }
  }, [countdownValue]);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.startCountdownOverlay} pointerEvents="auto">
      <Animated.View
        style={[
          styles.startCountdownBackdrop,
          { opacity: overlayOpacity },
        ]}
      >
        {useNativeBlur ? (
          <NativeBlurView
            tint="dark"
            intensity={75}
            style={styles.startCountdownBlur}
          />
        ) : (
          <View style={styles.startCountdownBlur} />
        )}
        <View style={styles.startCountdownDimmer} />
      </Animated.View>

      <Animated.View
        style={[
          styles.startCountdownContent,
          {
            opacity: textOpacity,
            transform: [{ scale: textScale }],
          },
        ]}
      >
        <Text
          style={[
            styles.startCountdownText,
            {
              color: countdownPalette.primary,
              textShadowColor: countdownPalette.glow,
            },
          ]}
        >
          {countdownLabel}
        </Text>
        <Text
          style={[
            styles.startCountdownTextAccent,
            {
              color: countdownPalette.secondary,
            },
          ]}
        >
          {countdownLabel}
        </Text>
      </Animated.View>
    </View>
  );
}
