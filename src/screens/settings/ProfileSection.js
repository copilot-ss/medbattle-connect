import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import styles from '../styles/SettingsScreen.styles';

export default function ProfileSection({
  userName,
  userLevel,
  totalStreak,
  levelBadgeHeat,
  avatarInitials,
  currentAvatar,
  avatarId,
  avatars,
  showAvatarPicker,
  onToggleAvatarPicker,
  onSelectAvatar,
  quizzesCompleted = 0,
  accuracyPercent = 0,
  xp = 0,
  titleProgress = null,
  unlockedAchievements = [],
  leaderboardRank = null,
  loadingRank = false,
  newEmail,
  setNewEmail,
  emailCtaLabel,
  emailCtaHint,
  loadingEmail,
  onEmailUpdate,
  showEmailActions = true,
}) {
  return (
    <View style={[styles.card, styles.profileCard]}>
      <Text style={styles.cardTitle}>Profil</Text>

      <View style={styles.profileRow}>
        <Pressable
          onPress={onToggleAvatarPicker}
          style={[
            styles.avatarFrame,
            currentAvatar?.color
              ? { borderColor: currentAvatar.color, shadowColor: currentAvatar.color }
              : null,
          ]}
        >
          <View
            style={[
              styles.avatarCircle,
              currentAvatar?.color ? { backgroundColor: `${currentAvatar.color}30` } : null,
            ]}
          >
            {currentAvatar?.source ? (
              <Image
                source={currentAvatar.source}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.avatarText}>{avatarInitials}</Text>
            )}
          </View>
        </Pressable>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{userName}</Text>
          <View style={[styles.levelBadge, levelBadgeHeat]}>
            <Text style={styles.levelBadgeText}>
              {`Level ${userLevel}${totalStreak > 0 ? ` x${totalStreak}` : ''}`}
            </Text>
          </View>
          <View style={styles.profileTitleRow}>
            <Text style={styles.profileTitleLabel}>Titel</Text>
            <Text style={styles.profileTitleValue}>
              {titleProgress?.current?.label ?? 'Med Rookie'}
            </Text>
          </View>
          <Text style={styles.profileXpText}>
            {`XP ${xp}`}
          </Text>
        </View>
      </View>

      <View style={styles.profileStatsRow}>
        <View style={styles.profileStatCard}>
          <Text style={styles.profileStatLabel}>Leaderboard</Text>
          <Text style={styles.profileStatValue}>
            {loadingRank ? '...' : leaderboardRank ? `#${leaderboardRank}` : '-'}
          </Text>
        </View>
        <View style={styles.profileStatCard}>
          <Text style={styles.profileStatLabel}>Quizzes</Text>
          <Text style={styles.profileStatValue}>{quizzesCompleted}</Text>
        </View>
        <View style={styles.profileStatCard}>
          <Text style={styles.profileStatLabel}>Trefferquote</Text>
          <Text style={styles.profileStatValue}>{accuracyPercent}%</Text>
        </View>
      </View>

      {unlockedAchievements.length ? (
        <View style={styles.achievementRow}>
          {unlockedAchievements.map((achievement) => (
            <View key={achievement.key} style={styles.achievementPill}>
              <Text style={styles.achievementText}>{achievement.label}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {showAvatarPicker ? (
        <View style={styles.avatarGrid}>
          {avatars.map((item) => {
            const locked = userLevel < item.level;
            const selected =
              avatarId === item.id || (!avatarId && item.id === currentAvatar?.id);
            return (
              <Pressable
                key={item.id}
                onPress={() => onSelectAvatar(item)}
                disabled={locked}
                style={[
                  styles.avatarTile,
                  { borderColor: locked ? 'rgba(148,163,184,0.35)' : item.color },
                  selected ? styles.avatarTileSelected : null,
                  locked ? styles.avatarTileLocked : null,
                ]}
              >
                <Image
                  source={item.source}
                  style={styles.avatarTileImage}
                  resizeMode="cover"
                />
                {locked ? (
                  <View style={styles.avatarTileLockBanner}>
                    <Text style={styles.avatarTileLevel}>Level {item.level}</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {showEmailActions ? (
        <View style={styles.fieldGroup}>
          <TextInput
            value={newEmail}
            onChangeText={setNewEmail}
            placeholder="name@example.com"
            placeholderTextColor="#64748B"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <Text style={styles.helperText}>{emailCtaHint}</Text>
          <Pressable
            onPress={onEmailUpdate}
            disabled={loadingEmail}
            style={[
              styles.actionButton,
              styles.primaryButton,
              loadingEmail ? styles.disabledButton : null,
            ]}
          >
            {loadingEmail ? (
              <ActivityIndicator color="#F8FAFC" />
            ) : (
              <Text style={styles.primaryButtonText}>{emailCtaLabel}</Text>
            )}
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
