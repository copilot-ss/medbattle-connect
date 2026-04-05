import { useCallback, useRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import styles from './styles/SettingsScreen.styles';
import ClaimRewardTopBar from './settings/ClaimRewardTopBar';
import ProfileSection from './settings/ProfileSection';
import SettingsFooter from './settings/SettingsFooter';
import SettingsHeader from './settings/SettingsHeader';
import SettingsPreferencesCard from './settings/SettingsPreferencesCard';
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
    pushEnabled,
    friendRequestsEnabled,
    pushStatus,
    friendRequestsStatus,
    handlePushToggle,
    handleFriendRequestsToggle,
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
    levelProgress,
    achievements,
    claimingAchievement,
    handleClaimAchievement,
    claimRewardAnimation,
    handleClaimRewardAnimationDone,
    leaderboardRank,
    loadingRank,
    isGuest,
    authResolved,
    showLinkGoogle,
    linkGoogleLabel,
    linkGoogleHint,
    linkingGoogle,
    handleLinkGoogle,
    friendCode,
    copySuccess,
    handleCopyFriendCode,
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
  const showSettingsSection = resolvedTab === 'settings';
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

  const handleOpenSettingsHelp = useCallback(() => {
    navigation.navigate('SettingsHelp');
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
            trailingIcon={showSettingsSection ? 'help-circle-outline' : null}
            onTrailingPress={showSettingsSection ? handleOpenSettingsHelp : null}
            trailingAccessibilityLabel={t('Info')}
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
              trailingIcon={showSettingsSection ? 'help-circle-outline' : null}
              onTrailingPress={showSettingsSection ? handleOpenSettingsHelp : null}
              trailingAccessibilityLabel={t('Info')}
            />
          ) : null}
          {showTabRow && headerMovesWithScroll ? (
            <SettingsTabs activeTab={activeTab} onChange={setActiveTab} />
          ) : null}

          {showSettingsSection ? (
            <SettingsPreferencesCard
              pushEnabled={pushEnabled}
              friendRequestsEnabled={friendRequestsEnabled}
              onPushToggle={handlePushToggle}
              onFriendRequestsToggle={handleFriendRequestsToggle}
              pushStatus={pushStatus}
              friendRequestsStatus={friendRequestsStatus}
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
              levelProgress={levelProgress}
              achievements={achievements}
              claimingAchievement={claimingAchievement}
              onClaimAchievement={handleClaimAchievement}
              leaderboardRank={leaderboardRank}
              loadingRank={loadingRank}
              showLinkGoogle={showLinkGoogle}
              linkGoogleLabel={linkGoogleLabel}
              linkGoogleHint={linkGoogleHint}
              linkingGoogle={linkingGoogle}
              onLinkGoogle={handleLinkGoogle}
              friendCode={friendCode}
              copySuccess={copySuccess}
              onCopyFriendCode={handleCopyFriendCode}
            />
          ) : null}

          {feedback && (showProfileSection || showSignOutSection) ? (
            <View style={styles.banner}>
              <Text style={styles.bannerText}>{feedback}</Text>
            </View>
          ) : null}

          {showSettingsSection && showSignOutSection ? (
            <View style={styles.settingsFooterSpacer} />
          ) : null}

          {showSignOutSection ? (
            <SettingsFooter
              signingOut={signingOut}
              onSignOut={handleSignOut}
              isGuest={isGuest}
              authResolved={authResolved}
            />
          ) : null}
        </ScrollView>
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
