import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Platform, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/MultiplayerLobbyScreen.styles';

export default function LobbyStartCountdownOverlay({
  visible = false,
  countdownValue = 3,
}) {
  const { t } = useTranslation();
  const useNativeBlur = Platform.OS !== 'android';
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
          <BlurView
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
        <Text style={styles.startCountdownText}>{countdownLabel}</Text>
        <Text style={styles.startCountdownHint}>{t('Fragen werden geladen ...')}</Text>
      </Animated.View>
    </View>
  );
}
