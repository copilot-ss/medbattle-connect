import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from '../i18n/useTranslation';
import { fonts } from '../styles/theme';

const FADE_IN_MS = 180;
const FADE_OUT_MS = 900;

export default function LobbyInviteOverlay({
  invite,
  remainingSeconds = null,
  acceptingInvite = false,
  decliningInvite = false,
  inviteError = null,
  onAccept,
  onDecline,
}) {
  const { t } = useTranslation();
  const [renderedInvite, setRenderedInvite] = useState(invite);
  const opacity = useRef(new Animated.Value(invite ? 1 : 0)).current;
  const translateY = opacity.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });

  useEffect(() => {
    if (invite) {
      opacity.stopAnimation();
      setRenderedInvite(invite);
      opacity.setValue(0);
      Animated.timing(opacity, {
        toValue: 1,
        duration: FADE_IN_MS,
        useNativeDriver: true,
      }).start();
      return undefined;
    }

    if (!renderedInvite) {
      return undefined;
    }

    opacity.stopAnimation();
    const animation = Animated.timing(opacity, {
      toValue: 0,
      duration: FADE_OUT_MS,
      useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (finished) {
        setRenderedInvite(null);
      }
    });

    return () => {
      animation.stop();
    };
  }, [invite, opacity, renderedInvite]);

  const displayInvite = invite ?? renderedInvite;

  if (!displayInvite) {
    return null;
  }

  const senderName =
    displayInvite.senderUsername ?? displayInvite.senderCode ?? t('Freund');
  const secondsText = Number.isFinite(remainingSeconds)
    ? `${Math.max(0, remainingSeconds)}s`
    : null;
  const actionDisabled = acceptingInvite || decliningInvite || !invite;

  return (
    <Animated.View
      pointerEvents={invite ? 'box-none' : 'none'}
      style={[
        styles.overlayWrap,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View pointerEvents="none" style={styles.glow} />
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{t('Lobby Einladung')}</Text>
          {secondsText ? (
            <Text style={styles.expiryText}>{secondsText}</Text>
          ) : null}
        </View>

        <Text numberOfLines={1} style={styles.message}>
          {senderName}
        </Text>

        {inviteError ? (
          <Text style={styles.errorText}>{inviteError}</Text>
        ) : null}

        <View style={styles.actionsRow}>
          <Pressable
            accessibilityLabel={t('Ablehnen')}
            style={[
              styles.actionButton,
              styles.declineButton,
              actionDisabled ? styles.actionButtonDisabled : null,
            ]}
            onPress={onDecline}
            disabled={actionDisabled}
          >
            {decliningInvite ? (
              <ActivityIndicator size="small" color="#FFE4E6" />
            ) : (
              <Ionicons name="close" size={30} color="#FFE4E6" />
            )}
          </Pressable>
          <Pressable
            accessibilityLabel={t('Annehmen')}
            style={[
              styles.actionButton,
              styles.acceptButton,
              actionDisabled ? styles.actionButtonDisabled : null,
            ]}
            onPress={onAccept}
            disabled={actionDisabled}
          >
            {acceptingInvite ? (
              <ActivityIndicator size="small" color="#ECFDF5" />
            ) : (
              <Ionicons name="checkmark" size={32} color="#ECFDF5" />
            )}
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlayWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 92,
    alignItems: 'center',
    paddingHorizontal: 14,
    zIndex: 120,
  },
  glow: {
    position: 'absolute',
    left: 14,
    right: 14,
    top: -10,
    bottom: -10,
    maxWidth: 460,
    borderRadius: 24,
    backgroundColor: 'rgba(34, 211, 238, 0.22)',
  },
  card: {
    width: '100%',
    maxWidth: 460,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(34, 211, 238, 0.95)',
    backgroundColor: 'rgba(5, 13, 31, 0.98)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    rowGap: 10,
    shadowColor: '#22D3EE',
    shadowOpacity: 0.55,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: 12,
  },
  title: {
    color: '#F8FDFF',
    fontSize: 15,
    fontFamily: fonts.bold,
  },
  message: {
    color: '#7DD3FC',
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  expiryText: {
    minWidth: 42,
    textAlign: 'right',
    color: '#FDE68A',
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  errorText: {
    color: '#FDA4AF',
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  actionsRow: {
    flexDirection: 'row',
    columnGap: 12,
  },
  actionButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  actionButtonDisabled: {
    opacity: 0.72,
  },
  declineButton: {
    borderColor: 'rgba(251, 113, 133, 0.95)',
    backgroundColor: 'rgba(225, 29, 72, 0.4)',
  },
  acceptButton: {
    borderColor: 'rgba(74, 222, 128, 0.95)',
    backgroundColor: 'rgba(22, 163, 74, 0.45)',
  },
});
