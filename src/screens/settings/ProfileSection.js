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
  newEmail,
  setNewEmail,
  emailCtaLabel,
  emailCtaHint,
  loadingEmail,
  onEmailUpdate,
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
              {`Level ${userLevel}${totalStreak > 0 ? ` 🔥 ${totalStreak}x` : ''}`}
            </Text>
          </View>
        </View>
      </View>

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
                <View style={styles.avatarTileFooter}>
                  <Text style={styles.avatarTileLabel}>{item.label}</Text>
                  <Text style={styles.avatarTileLevel}>
                    {locked ? `Level ${item.level}` : 'Frei'}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : null}

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
    </View>
  );
}
