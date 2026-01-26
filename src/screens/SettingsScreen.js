import { ScrollView, Text, View } from 'react-native';
import styles from './styles/SettingsScreen.styles';
import AudioSettingsCard from './settings/AudioSettingsCard';
import ProfileSection from './settings/ProfileSection';
import SettingsFooter from './settings/SettingsFooter';
import SettingsHeader from './settings/SettingsHeader';
import SettingsTabs from './settings/SettingsTabs';
import AVATARS from './settings/avatars';
import useSettingsController from './settings/useSettingsController';

export default function SettingsScreen({
  navigation,
  route,
  onClearSession,
  lockedTab = null,
  showTabs = true,
  showClose = true,
  title,
}) {
  const {
    activeTab,
    setActiveTab,
    scrollRef,
    soundEnabled,
    vibrationEnabled,
    pushEnabled,
    soundStatus,
    vibrationStatus,
    pushStatus,
    handleSoundToggle,
    handleVibrationToggle,
    handlePushToggle,
    userName,
    userLevel,
    totalStreak,
    levelBadgeHeat,
    avatarInitials,
    currentAvatar,
    avatarId,
    showAvatarPicker,
    handleToggleAvatarPicker,
    handleSelectAvatar,
    quizzesCompleted,
    accuracyPercent,
    xp,
    coins,
    titleProgress,
    unlockedAchievements,
    leaderboardRank,
    loadingRank,
    isGuest,
    newEmail,
    setNewEmail,
    emailCtaLabel,
    emailCtaHint,
    loadingEmail,
    handleEmailUpdate,
    showEmailActions,
    showLinkGoogle,
    linkGoogleLabel,
    linkGoogleHint,
    linkingGoogle,
    handleLinkGoogle,
    feedback,
    showResetForm,
    handleToggleResetForm,
    resetEmail,
    setResetEmail,
    loadingReset,
    handlePasswordReset,
    signingOut,
    handleSignOut,
    showResetActions,
  } = useSettingsController({ navigation, route, onClearSession });

  const resolvedTab = lockedTab || activeTab;
  const showTabRow = showTabs && !lockedTab;
  const showAudioSection = resolvedTab === 'settings';
  const showProfileSection = resolvedTab === 'profile';
  const showSignOutSection = resolvedTab === 'settings';
  const headerTitle = title || (resolvedTab === 'profile' ? 'Profil' : 'Einstellungen');

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGlowTop} pointerEvents="none" />
      <View style={styles.backgroundGlowBottom} pointerEvents="none" />
      <SettingsHeader
        onClose={showClose ? () => navigation.goBack() : null}
        showClose={showClose}
        title={headerTitle}
      />

      {showTabRow ? (
        <SettingsTabs activeTab={activeTab} onChange={setActiveTab} />
      ) : null}

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {showAudioSection ? (
          <AudioSettingsCard
            soundEnabled={soundEnabled}
            vibrationEnabled={vibrationEnabled}
            pushEnabled={pushEnabled}
            onSoundToggle={handleSoundToggle}
            onVibrationToggle={handleVibrationToggle}
            onPushToggle={handlePushToggle}
            soundStatus={soundStatus}
            vibrationStatus={vibrationStatus}
            pushStatus={pushStatus}
          />
        ) : null}

        {showProfileSection ? (
          <ProfileSection
            userName={userName}
            userLevel={userLevel}
            totalStreak={totalStreak}
            levelBadgeHeat={levelBadgeHeat}
            avatarInitials={avatarInitials}
            currentAvatar={currentAvatar}
            avatarId={avatarId}
            avatars={AVATARS}
            showAvatarPicker={showAvatarPicker}
            onToggleAvatarPicker={handleToggleAvatarPicker}
            onSelectAvatar={handleSelectAvatar}
            quizzesCompleted={quizzesCompleted}
            accuracyPercent={accuracyPercent}
            xp={xp}
            coins={coins}
            titleProgress={titleProgress}
            unlockedAchievements={unlockedAchievements}
            leaderboardRank={leaderboardRank}
            loadingRank={loadingRank}
            newEmail={newEmail}
            setNewEmail={setNewEmail}
            emailCtaLabel={emailCtaLabel}
            emailCtaHint={emailCtaHint}
            loadingEmail={loadingEmail}
            onEmailUpdate={handleEmailUpdate}
            showEmailActions={showEmailActions}
            showLinkGoogle={showLinkGoogle}
            linkGoogleLabel={linkGoogleLabel}
            linkGoogleHint={linkGoogleHint}
            linkingGoogle={linkingGoogle}
            onLinkGoogle={handleLinkGoogle}
          />
        ) : null}

        {feedback && (showProfileSection || showSignOutSection) ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>{feedback}</Text>
          </View>
        ) : null}

      </ScrollView>

      {showSignOutSection ? (
        <SettingsFooter
          showResetForm={showResetForm}
          onToggleResetForm={handleToggleResetForm}
          resetEmail={resetEmail}
          setResetEmail={setResetEmail}
          loadingReset={loadingReset}
          onResetPassword={handlePasswordReset}
          signingOut={signingOut}
          onSignOut={handleSignOut}
          showResetActions={showResetActions}
          isGuest={isGuest}
        />
      ) : null}
    </View>
  );
}
