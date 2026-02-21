import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import FriendsSection from './settings/FriendsSection';
import FriendsAddSheet from './settings/FriendsAddSheet';
import SettingsHeader from './settings/SettingsHeader';
import useSettingsController from './settings/useSettingsController';
import styles from './styles/SettingsScreen.styles';
import { useTranslation } from '../i18n/useTranslation';
import PublicProfileSheet from '../components/PublicProfileSheet';
import usePublicProfileSheet from '../hooks/usePublicProfileSheet';

export default function FriendsScreen({ navigation, route, showClose = true }) {
  const { t } = useTranslation();
  const [showAddSheet, setShowAddSheet] = useState(false);
  const { openProfile, sheetProps } = usePublicProfileSheet();
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
    onAcceptFriendRequest,
    onDeclineFriendRequest,
    onlineFriends,
    onRemoveFriend,
    friendsFeedback,
    clearFriendsFeedback,
    friendRequestSent,
    refreshingFriends,
    onRefreshFriends,
  } = useSettingsController({ navigation, route });

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

  return (
    <View style={styles.container}>
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
          onRemoveFriend={onRemoveFriend}
          onOpenProfile={openProfile}
          onOpenAdd={handleOpenAdd}
          showAddButton
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
      />
    </View>
  );
}
