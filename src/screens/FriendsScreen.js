import { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import FriendsSection from './settings/FriendsSection';
import FriendsAddSheet from './settings/FriendsAddSheet';
import FriendRemoveConfirmModal from './settings/FriendRemoveConfirmModal';
import SettingsHeader from './settings/SettingsHeader';
import useSettingsController from './settings/useSettingsController';
import styles from './styles/SettingsScreen.styles';
import { useTranslation } from '../i18n/useTranslation';
import PublicProfileSheet from '../components/PublicProfileSheet';
import usePublicProfileSheet from '../hooks/usePublicProfileSheet';
import GameBackground from '../components/game/GameBackground';

export default function FriendsScreen({ navigation, route, showClose = true }) {
  const { t } = useTranslation();
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const {
    openProfile,
    closeProfile,
    selectedProfile,
    sheetProps,
  } = usePublicProfileSheet();
  const {
    scrollRef,
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
    friendRequests,
    loadingFriendRequests,
    respondingFriendRequestId,
    removingFriendCode,
    onAcceptFriendRequest,
    onDeclineFriendRequest,
    onlineFriends,
    onRemoveFriend,
    friendsFeedback,
    clearFriendsFeedback,
    friendRequestSent,
    refreshingFriends,
    onRefreshFriends,
    refreshBlockedUsers,
  } = useSettingsController({ navigation, route });

  const handleRemoveFriendFromProfile = useCallback(async () => {
    const friendCodeToRemove = selectedProfile?.friendCode ?? null;
    if (!friendCodeToRemove) {
      return false;
    }

    const removed = await onRemoveFriend({ code: friendCodeToRemove });
    if (removed) {
      closeProfile();
    }
    return removed;
  }, [closeProfile, onRemoveFriend, selectedProfile?.friendCode]);

  const handleRequestRemoveFriend = useCallback(() => {
    if (!selectedProfile?.friendCode || removingFriendCode === selectedProfile.friendCode) {
      return;
    }
    setShowRemoveConfirm(true);
  }, [removingFriendCode, selectedProfile?.friendCode]);

  const handleCancelRemoveConfirm = useCallback(() => {
    if (removingFriendCode === selectedProfile?.friendCode) {
      return;
    }
    setShowRemoveConfirm(false);
  }, [removingFriendCode, selectedProfile?.friendCode]);

  const handleConfirmRemoveFriend = useCallback(async () => {
    await handleRemoveFriendFromProfile();
    setShowRemoveConfirm(false);
  }, [handleRemoveFriendFromProfile]);

  const handleProfileBlockChange = useCallback(async () => {
    await refreshBlockedUsers?.();
    await onRefreshFriends?.();
  }, [onRefreshFriends, refreshBlockedUsers]);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [scrollRef])
  );

  const handleOpenAdd = useCallback(() => {
    clearFriendsFeedback?.();
    setShowAddSheet(true);
  }, [clearFriendsFeedback]);

  const handleCloseAdd = useCallback(() => {
    setShowAddSheet(false);
    setFriendCodeInput('');
    clearFriendsFeedback?.();
  }, [clearFriendsFeedback, setFriendCodeInput]);

  useEffect(() => {
    if (!showAddSheet || !friendRequestSent || addingFriend) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setShowAddSheet(false);
      setFriendCodeInput('');
      clearFriendsFeedback?.();
    }, 220);
    return () => clearTimeout(timer);
  }, [
    addingFriend,
    clearFriendsFeedback,
    friendRequestSent,
    setFriendCodeInput,
    showAddSheet,
  ]);

  useEffect(() => {
    if (!selectedProfile && showRemoveConfirm) {
      setShowRemoveConfirm(false);
    }
  }, [selectedProfile, showRemoveConfirm]);

  const removeConfirmName =
    selectedProfile?.name
    ?? selectedProfile?.displayName
    ?? selectedProfile?.username
    ?? t('Freund');

  const removeConfirmLoading =
    Boolean(selectedProfile?.friendCode)
    && removingFriendCode === selectedProfile.friendCode;

  return (
    <View style={styles.container}>
      <GameBackground intensity="subtle" />
      <View style={styles.backgroundGlowTop} pointerEvents="none" />
      <View style={styles.backgroundGlowBottom} pointerEvents="none" />
      <SettingsHeader
        title={t('Freunde')}
        onClose={() => navigation.goBack()}
        showClose={showClose}
      />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={(
          <RefreshControl
            refreshing={refreshingFriends}
            onRefresh={onRefreshFriends}
            tintColor="#60A5FA"
            colors={['#60A5FA']}
          />
        )}
      >
        <FriendsSection
          friends={friends}
          loadingFriends={loadingFriends}
          friendRequests={friendRequests}
          loadingFriendRequests={loadingFriendRequests}
          respondingFriendRequestId={respondingFriendRequestId}
          onAcceptFriendRequest={onAcceptFriendRequest}
          onDeclineFriendRequest={onDeclineFriendRequest}
          onlineFriends={onlineFriends}
          onOpenProfile={openProfile}
          onOpenAdd={handleOpenAdd}
          showAddButton
          friendCode={friendCode}
          copySuccess={copySuccess}
          onCopyFriendCode={handleCopyFriendCode}
        />

      </ScrollView>

      <FriendsAddSheet
        visible={showAddSheet}
        onClose={handleCloseAdd}
        friendCode={friendCode}
        copySuccess={copySuccess}
        onCopyFriendCode={handleCopyFriendCode}
        friendCodeInput={friendCodeInput}
        setFriendCodeInput={setFriendCodeInput}
        friendInputRef={friendInputRef}
        onAddFriend={onAddFriend}
        addingFriend={addingFriend}
        friendsFeedback={friendsFeedback}
        friendRequestSent={friendRequestSent}
      />
      <PublicProfileSheet
        {...sheetProps}
        onBlockChange={handleProfileBlockChange}
        footerActionLabel={selectedProfile?.canRemoveFriend ? t('Entfernen') : null}
        onFooterAction={selectedProfile?.canRemoveFriend ? handleRequestRemoveFriend : null}
        footerActionLoading={
          selectedProfile?.canRemoveFriend
          && removingFriendCode === selectedProfile?.friendCode
        }
        footerActionDisabled={
          selectedProfile?.canRemoveFriend
          && removingFriendCode === selectedProfile?.friendCode
        }
      />
      <FriendRemoveConfirmModal
        visible={showRemoveConfirm}
        friendName={removeConfirmName}
        loading={removeConfirmLoading}
        onCancel={handleCancelRemoveConfirm}
        onConfirm={() => {
          void handleConfirmRemoveFriend();
        }}
      />
    </View>
  );
}
