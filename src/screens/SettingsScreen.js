import { ScrollView, Text, View } from 'react-native';
import styles from './styles/SettingsScreen.styles';
import AudioSettingsCard from './settings/AudioSettingsCard';
import FriendsSection from './settings/FriendsSection';
import ProfileSection from './settings/ProfileSection';
import SettingsFooter from './settings/SettingsFooter';
import SettingsHeader from './settings/SettingsHeader';
import SettingsTabs from './settings/SettingsTabs';
import AVATARS from './settings/avatars';
import useSettingsController from './settings/useSettingsController';

export default function SettingsScreen({ navigation, route, onClearSession }) {
  const {
    activeTab,
    setActiveTab,
    showAudioSection,
    showFriendsSection,
    showProfileSection,
    showSignOutSection,
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
    friendRequestsEnabled,
    friendRequestsStatus,
    handleFriendRequestsToggle,
    friendCode,
    copySuccess,
    handleCopyFriendCode,
    friendCodeInput,
    setFriendCodeInput,
    friendInputRef,
    onAddFriend,
    addingFriend,
    friends,
    loadingFriends,
    onlineFriends,
    loadingOnline,
    onRemoveFriend,
    friendsFeedback,
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
    leaderboardRank,
    loadingRank,
    newEmail,
    setNewEmail,
    emailCtaLabel,
    emailCtaHint,
    loadingEmail,
    handleEmailUpdate,
    showEmailActions,
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

  return (
    <View style={styles.container}>
      <SettingsHeader onClose={() => navigation.goBack()} />

      <SettingsTabs activeTab={activeTab} onChange={setActiveTab} />

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

        {showFriendsSection ? (
          <FriendsSection
            friendRequestsEnabled={friendRequestsEnabled}
            friendRequestsStatus={friendRequestsStatus}
            onToggleFriendRequests={handleFriendRequestsToggle}
            friendCode={friendCode}
            copySuccess={copySuccess}
            onCopyFriendCode={handleCopyFriendCode}
            friendCodeInput={friendCodeInput}
            setFriendCodeInput={setFriendCodeInput}
            friendInputRef={friendInputRef}
            onAddFriend={onAddFriend}
            addingFriend={addingFriend}
            onlineFriends={onlineFriends}
            loadingOnline={loadingOnline}
            onRemoveFriend={onRemoveFriend}
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
            leaderboardRank={leaderboardRank}
            loadingRank={loadingRank}
            newEmail={newEmail}
            setNewEmail={setNewEmail}
            emailCtaLabel={emailCtaLabel}
            emailCtaHint={emailCtaHint}
            loadingEmail={loadingEmail}
            onEmailUpdate={handleEmailUpdate}
            showEmailActions={showEmailActions}
          />
        ) : null}

        {friendsFeedback && showFriendsSection ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>{friendsFeedback}</Text>
          </View>
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
        />
      ) : null}
    </View>
  );
}
