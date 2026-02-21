import { Animated, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../i18n/useTranslation';
import AvatarView from '../../components/avatar/AvatarView';
import { getAvatarInitials } from '../../utils/avatarUtils';
import styles from '../styles/MultiplayerLobbyScreen.styles';
import LobbyCodeActionsRow from './LobbyCodeActionsRow';
import LobbyOnlineFriendsSection from './LobbyOnlineFriendsSection';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const PARTICIPANT_AVATAR_INNER_STYLE = {
  width: '100%',
  height: '100%',
  alignItems: 'center',
  justifyContent: 'center',
};

export default function LobbyParticipantsCard({
  participants,
  participantCount,
  maxPlayers,
  isHostWaiting,
  onSelectParticipant,
  onOpenParticipantProfile,
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
  difficultyLabel,
  questionLimit,
  categoryLabel,
  friendsLoading,
  onlineFriends,
  invitingFriendCodes,
  onInviteFriend,
}) {
  const { t } = useTranslation();

  return (
    <View style={styles.lobbyCard}>
      <View style={styles.lobbyTitleRow}>
        <Text style={styles.lobbyTitle}>{t('Lobby')}</Text>
        {isHostWaiting ? (
          <Pressable
            onPress={onOpenSettings}
            style={styles.lobbySettingsButton}
            accessibilityRole="button"
            accessibilityLabel={t('Lobby Einstellungen')}
            hitSlop={8}
          >
            <Ionicons name="settings-outline" size={14} color="#94A3B8" />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.participantsHeader}>
        <Text style={styles.participantsTitle}>{t('Spieler')}</Text>
        <Text style={styles.participantsCount}>
          {participantCount}/{maxPlayers}
        </Text>
      </View>

      <View style={styles.participantGrid}>
        {participants.map((participant) => {
          const canKick =
            isHostWaiting && participant.key === 'guest' && !participant.isPending;
          const isSelected = kickCandidateKey === participant.key;
          const canOpenProfile =
            typeof onOpenParticipantProfile === 'function' &&
            !participant.isPlaceholder &&
            Boolean(participant.userId);
          const participantInitials = participant.isPlaceholder
            ? '?'
            : getAvatarInitials(participant.name);
          const participantAvatarUri =
            !participant.isPlaceholder ? participant.avatarUrl ?? null : null;
          const participantAvatarSource =
            !participant.isPlaceholder ? participant.avatarSource ?? null : null;
          const participantAvatarIcon =
            !participant.isPlaceholder ? participant.avatarIcon ?? null : null;
          return (
            <View key={participant.key} style={styles.participantSlot}>
              <Pressable
                onPress={
                  canOpenProfile
                    ? () => onOpenParticipantProfile(participant)
                    : undefined
                }
                onLongPress={
                  canKick ? () => onSelectParticipant(participant.key) : undefined
                }
                delayLongPress={240}
                disabled={!canOpenProfile && !canKick}
                style={[
                  styles.participantAvatarCard,
                  canKick && isSelected ? styles.participantAvatarCardSelected : null,
                ]}
              >
                <View
                  style={[
                    styles.participantAvatar,
                    participant.isPlaceholder ? styles.participantAvatarGhost : null,
                    participant.isPending ? styles.participantAvatarPending : null,
                    canKick && isSelected ? styles.participantAvatarKick : null,
                  ]}
                >
                  {participant.isHost && !participant.isPlaceholder ? (
                    <View style={styles.hostBadge}>
                      <Ionicons name="medkit" size={14} color="#0A0A12" />
                    </View>
                  ) : null}
                  <AvatarView
                    uri={participantAvatarUri}
                    source={participantAvatarSource}
                    icon={participantAvatarIcon}
                    color={participant.avatarColor || '#9EDCFF'}
                    initials={participantInitials}
                    circleStyle={PARTICIPANT_AVATAR_INNER_STYLE}
                    imageStyle={styles.participantAvatarImage}
                    iconSize={24}
                    textStyle={styles.participantAvatarText}
                  />
                </View>
                <Text
                  style={[
                    styles.participantName,
                    participant.isPlaceholder ? styles.participantPlaceholder : null,
                    participant.isPending ? styles.participantPending : null,
                  ]}
                  numberOfLines={1}
                >
                  {participant.name}
                </Text>
                {participant.isPending ? (
                  <Text style={styles.participantPendingLabel}>
                    {t('Wartet auf Rückkehr')}
                  </Text>
                ) : null}
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
        </View>
      ) : null}
      <LobbyCodeActionsRow
        currentJoinCode={currentJoinCode}
        copied={copied}
        onCopyCode={onCopyCode}
        difficultyLabel={difficultyLabel}
        questionLimit={questionLimit}
        categoryLabel={categoryLabel}
      />
      <LobbyOnlineFriendsSection
        isHostWaiting={isHostWaiting}
        friendsLoading={friendsLoading}
        onlineFriends={onlineFriends}
        invitingFriendCodes={invitingFriendCodes}
        onInviteFriend={onInviteFriend}
      />
    </View>
  );
}
