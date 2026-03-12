import { useCallback, useRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import styles from './styles/SettingsScreen.styles';
import AudioSettingsCard from './settings/AudioSettingsCard';
import ClaimRewardTopBar from './settings/ClaimRewardTopBar';
import LanguageSettingsCard from './settings/LanguageSettingsCard';
import ProfileSection from './settings/ProfileSection';
import SettingsFooter from './settings/SettingsFooter';
import SettingsHeader from './settings/SettingsHeader';
import SettingsTabs from './settings/SettingsTabs';
import useSettingsController from './settings/useSettingsController';
import { useTranslation } from '../i18n/useTranslation';

const ClaimBlurTargetView = (() => {
  try {
    return require('expo-blur').BlurTargetView;
  } catch (_error) {
    return View;
  }
})();

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
    friendRequestsEnabled,
    language,
    soundStatus,
    vibrationStatus,
    pushStatus,
    friendRequestsStatus,
    handleSoundToggle,
    handleVibrationToggle,
    handlePushToggle,
    handleFriendRequestsToggle,
    handleLanguageChange,
    userName,
    userLevel,
    totalStreak,
    levelBadgeHeat,
    avatarInitials,
    currentAvatar,
    avatarUri,
    quizzesCompleted,
    accuracyPercent,
    xp,
    coins,
    streakShieldCount,
    freezeTimeCount,
    jokerCount,
    doubleXpExpiresAt,
    titleProgress,
    achievements,
    claimingAchievement,
    handleClaimAchievement,
    claimRewardAnimation,
    handleClaimRewardAnimationDone,
    leaderboardRank,
    loadingRank,
    isGuest,
    authResolved,
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
  const { t } = useTranslation();

  const resolvedTab = lockedTab || activeTab;
  const showTabRow = showTabs && !lockedTab;
  const showAudioSection = resolvedTab === 'settings';
  const showProfileSection = resolvedTab === 'profile';
  const showSignOutSection = resolvedTab === 'settings';
  const headerMovesWithScroll = showProfileSection;
  const headerTitle = title || (resolvedTab === 'profile' ? t('Profil') : t('Einstellungen'));
  const claimBlurTargetRef = useRef(null);
  const showHeaderBack = showProfileSection;
  const showHeaderAction = showClose || showHeaderBack;

  const handleOpenAvatarEdit = useCallback(() => {
    const parentNavigation = navigation?.getParent?.();
    if (parentNavigation && typeof parentNavigation.navigate === 'function') {
      parentNavigation.navigate('AvatarEdit');
      return;
    }
    navigation.navigate('AvatarEdit');
  }, [navigation]);

  const handleHeaderBack = useCallback(() => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Home');
  }, [navigation]);

  return (
    <View style={styles.screenRoot}>
      <ClaimBlurTargetView
        ref={claimBlurTargetRef}
        style={[
          styles.container,
          headerMovesWithScroll ? styles.containerProfileTop : null,
        ]}
      >
        <View style={styles.backgroundGlowTop} pointerEvents="none" />
        <View style={styles.backgroundGlowBottom} pointerEvents="none" />
        {!headerMovesWithScroll ? (
          <SettingsHeader
            onClose={showHeaderBack ? handleHeaderBack : showClose ? () => navigation.goBack() : null}
            showClose={showHeaderAction}
            actionType={showHeaderBack ? 'back' : 'close'}
            title={headerTitle}
          />
        ) : null}

        {showTabRow && !headerMovesWithScroll ? (
          <SettingsTabs activeTab={activeTab} onChange={setActiveTab} />
        ) : null}

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.scrollContent,
            headerMovesWithScroll ? styles.scrollContentProfile : null,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {headerMovesWithScroll ? (
            <SettingsHeader
              onClose={showHeaderBack ? handleHeaderBack : showClose ? () => navigation.goBack() : null}
              showClose={showHeaderAction}
              actionType={showHeaderBack ? 'back' : 'close'}
              title={headerTitle}
              containerStyle={styles.headerProfile}
            />
          ) : null}
          {showTabRow && headerMovesWithScroll ? (
            <SettingsTabs activeTab={activeTab} onChange={setActiveTab} />
          ) : null}

          {showAudioSection ? (
            <AudioSettingsCard
              soundEnabled={soundEnabled}
              vibrationEnabled={vibrationEnabled}
              pushEnabled={pushEnabled}
              friendRequestsEnabled={friendRequestsEnabled}
              onSoundToggle={handleSoundToggle}
              onVibrationToggle={handleVibrationToggle}
              onPushToggle={handlePushToggle}
              onFriendRequestsToggle={handleFriendRequestsToggle}
              soundStatus={soundStatus}
              vibrationStatus={vibrationStatus}
              pushStatus={pushStatus}
              friendRequestsStatus={friendRequestsStatus}
            />
          ) : null}
          {showAudioSection ? (
            <LanguageSettingsCard
              language={language}
              onSelectLanguage={handleLanguageChange}
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
              avatarUri={avatarUri}
              onEditAvatar={handleOpenAvatarEdit}
              quizzesCompleted={quizzesCompleted}
              accuracyPercent={accuracyPercent}
              xp={xp}
              coins={coins}
              streakShieldCount={streakShieldCount}
              freezeTimeCount={freezeTimeCount}
              jokerCount={jokerCount}
              doubleXpExpiresAt={doubleXpExpiresAt}
              titleProgress={titleProgress}
              achievements={achievements}
              claimingAchievement={claimingAchievement}
              onClaimAchievement={handleClaimAchievement}
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
            authResolved={authResolved}
            onOpenLegal={(doc) => navigation.navigate('Legal', { doc })}
          />
        ) : null}
      </ClaimBlurTargetView>
      <ClaimRewardTopBar
        userLevel={userLevel}
        xp={xp}
        coins={coins}
        blurTargetRef={claimBlurTargetRef}
        claimRewardAnimation={claimRewardAnimation}
        onClaimRewardAnimationEnd={handleClaimRewardAnimationDone}
      />
    </View>
  );
}
