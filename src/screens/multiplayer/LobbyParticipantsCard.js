import { ActivityIndicator, Animated, Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/MultiplayerLobbyScreen.styles';
import { getInitials } from './lobbyUtils';

const SHARE_ANIM = require('../../../assets/animations/share_6172544.gif');
const HOST_BADGE_ICON = require('../../../assets/icons_profile/caduceus_1839855.png');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function LobbyParticipantsCard({
  participants,
  participantCount,
  maxPlayers,
  isHostWaiting,
  onSelectParticipant,
  kickCandidateKey,
  onKickGuest,
  kickingPlayer,
  onStartMatch,
  hasEnoughPlayers,
  startingMatch,
  startPulseStyle,
  onOpenSettings,
  currentJoinCode,
  copied,
  onCopyCode,
  onShareCode,
  friendsLoading,
  onlineFriends,
  onInviteFriend,
}) {
  const { t } = useTranslation();

  return (
    <View style={styles.lobbyCard}>
      <Text style={styles.lobbyTitle}>{t('Lobby')}</Text>

      <View style={styles.participantsHeader}>
        <Text style={styles.participantsTitle}>{t('Spieler')}</Text>
        <Text style={styles.participantsCount}>
          {participantCount}/{maxPlayers}
        </Text>
      </View>

      <View style={styles.participantGrid}>
        {participants.map((participant) => {
          const canKick = isHostWaiting && participant.key === 'guest';
          const isSelected = kickCandidateKey === participant.key;
          return (
            <View key={participant.key} style={styles.participantSlot}>
              <Pressable
                onPress={() => onSelectParticipant(participant.key)}
                disabled={!canKick}
                style={[
                  styles.participantAvatarCard,
                  canKick && isSelected ? styles.participantAvatarCardSelected : null,
                ]}
              >
                <View
                  style={[
                    styles.participantAvatar,
                    participant.isPlaceholder ? styles.participantAvatarGhost : null,
                    canKick && isSelected ? styles.participantAvatarKick : null,
                  ]}
                >
                  {participant.role === 'Host' && !participant.isPlaceholder ? (
                    <Image source={HOST_BADGE_ICON} style={styles.hostBadge} />
                  ) : null}
                  {participant.avatarSource && !participant.isPlaceholder ? (
                    <Image source={participant.avatarSource} style={styles.participantAvatarImage} />
                  ) : participant.avatarUrl && !participant.isPlaceholder ? (
                    <Image source={{ uri: participant.avatarUrl }} style={styles.participantAvatarImage} />
                  ) : (
                    <Text style={styles.participantAvatarText}>
                      {participant.isPlaceholder ? '?' : getInitials(participant.name)}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.participantName,
                    participant.isPlaceholder ? styles.participantPlaceholder : null,
                  ]}
                  numberOfLines={1}
                >
                  {participant.name}
                </Text>
              </Pressable>
              {canKick && isSelected ? (
                <Pressable
                  onPress={onKickGuest}
                  disabled={kickingPlayer}
                  style={[
                    styles.kickButton,
                    kickingPlayer ? styles.kickButtonDisabled : null,
                  ]}
                >
                  <Ionicons name="close" size={14} color="#FCA5A5" />
                  <Text style={styles.kickButtonText}>{t('Entfernen')}</Text>
                </Pressable>
              ) : null}
            </View>
          );
        })}
      </View>

      {isHostWaiting ? (
        <View style={styles.startRow}>
          <AnimatedPressable
            onPress={onStartMatch}
            style={[
              styles.primaryAction,
              styles.startButton,
              startPulseStyle,
              !hasEnoughPlayers || startingMatch ? styles.actionDisabled : null,
            ]}
            disabled={!hasEnoughPlayers || startingMatch}
          >
            <Text style={[styles.primaryActionText, styles.startButtonText]}>
              {startingMatch ? t('Starte ...') : t('Start')}
            </Text>
          </AnimatedPressable>
          <Pressable
            onPress={onOpenSettings}
            style={styles.lobbySettingsButton}
            accessibilityLabel={t('Lobby Einstellungen')}
          >
            <Ionicons name="settings-outline" size={18} color="#93C5FD" />
          </Pressable>
        </View>
      ) : null}
      <View style={styles.codeActionsRow}>
        <Pressable
          onPress={onCopyCode}
          style={[
            styles.codeBadge,
            copied ? styles.codeBadgeSuccess : null,
          ]}
        >
          <Text style={styles.codeBadgeText}>{currentJoinCode}</Text>
          <Text style={copied ? styles.codeHintSuccess : styles.codeHint}>
            {copied ? t('Kopiert!') : t('Tippen zum Kopieren')}
          </Text>
        </Pressable>
        <Pressable onPress={onShareCode} style={styles.shareButton}>
          <Image source={SHARE_ANIM} style={styles.shareIconAnim} />
        </Pressable>
      </View>

      <View style={styles.onlineFriendsSection}>
        <Text style={styles.onlineFriendsTitle}>{t('Freunde online')}</Text>

        {friendsLoading ? (
          <View style={styles.loadingInline}>
            <ActivityIndicator size="small" color="#60A5FA" />
            <Text style={styles.loadingInlineText}>{t('Suche Freunde ...')}</Text>
          </View>
        ) : null}

        {!friendsLoading && onlineFriends.length ? (
          <View style={styles.onlineFriendList}>
            {onlineFriends.map((friend) => (
              <Pressable
                key={friend.code}
                onPress={() => onInviteFriend(friend)}
                style={styles.onlineFriendCard}
              >
                <Text style={styles.onlineFriendName}>
                  {friend.username ?? t('Freund:in')}
                </Text>
                {friend.title ? (
                  <Text style={styles.onlineFriendTitle}>{friend.title}</Text>
                ) : null}
                <Text style={styles.onlineFriendCode}>{friend.code}</Text>
                <Text style={styles.onlineFriendHint}>{t('Einladen')}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {!friendsLoading && !onlineFriends.length ? (
          <Text style={styles.onlineFriendEmpty}>
            {t('Keine Freunde online.')}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
