import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from '../i18n/useTranslation';
import { colors, fonts, radii } from '../styles/theme';

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

  if (!invite) {
    return null;
  }

  const senderName = invite.senderUsername ?? invite.senderCode ?? t('Freund');
  const secondsText = Number.isFinite(remainingSeconds)
    ? t('Laeuft ab in {seconds}s', {
      seconds: Math.max(0, remainingSeconds),
    })
    : null;
  const actionDisabled = acceptingInvite || decliningInvite;

  return (
    <View pointerEvents="box-none" style={styles.overlayWrap}>
      <View style={styles.card}>
        <Text style={styles.title}>{t('Lobby Einladung')}</Text>
        <Text style={styles.message}>
          {t('{name} laedt dich in eine Lobby ein.', { name: senderName })}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.matchCode}>
            {invite.matchCode ?? t('Unbekannt')}
          </Text>
          {secondsText ? (
            <Text style={styles.expiryText}>{secondsText}</Text>
          ) : null}
        </View>

        {inviteError ? (
          <Text style={styles.errorText}>{inviteError}</Text>
        ) : null}

        <View style={styles.actionsRow}>
          <Pressable
            style={[
              styles.actionButton,
              styles.declineButton,
              actionDisabled ? styles.actionButtonDisabled : null,
            ]}
            onPress={onDecline}
            disabled={actionDisabled}
          >
            {decliningInvite ? (
              <ActivityIndicator size="small" color="#FECACA" />
            ) : (
              <Text style={styles.declineButtonText}>{t('Ablehnen')}</Text>
            )}
          </Pressable>
          <Pressable
            style={[
              styles.actionButton,
              styles.acceptButton,
              actionDisabled ? styles.actionButtonDisabled : null,
            ]}
            onPress={onAccept}
            disabled={actionDisabled}
          >
            {acceptingInvite ? (
              <ActivityIndicator size="small" color="#DCFCE7" />
            ) : (
              <Text style={styles.acceptButtonText}>{t('Annehmen')}</Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 86,
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 80,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(87, 199, 255, 0.45)',
    backgroundColor: 'rgba(8, 18, 34, 0.95)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    rowGap: 8,
    shadowColor: colors.accent,
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  title: {
    color: '#DFF3FF',
    fontSize: 15,
    fontFamily: fonts.bold,
  },
  message: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    columnGap: 10,
  },
  matchCode: {
    color: '#9EDCFF',
    fontSize: 13,
    fontFamily: fonts.bold,
    letterSpacing: 0.5,
  },
  expiryText: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  actionsRow: {
    flexDirection: 'row',
    columnGap: 10,
  },
  actionButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionButtonDisabled: {
    opacity: 0.72,
  },
  declineButton: {
    borderColor: 'rgba(248, 113, 113, 0.5)',
    backgroundColor: 'rgba(248, 113, 113, 0.16)',
  },
  declineButtonText: {
    color: '#FECACA',
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  acceptButton: {
    borderColor: 'rgba(74, 222, 128, 0.5)',
    backgroundColor: 'rgba(74, 222, 128, 0.14)',
  },
  acceptButtonText: {
    color: '#DCFCE7',
    fontSize: 14,
    fontFamily: fonts.bold,
  },
});
