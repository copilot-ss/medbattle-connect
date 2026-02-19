import { useCallback, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import FriendsSection from './settings/FriendsSection';
import FriendsAddSheet from './settings/FriendsAddSheet';
import SettingsHeader from './settings/SettingsHeader';
import useSettingsController from './settings/useSettingsController';
import styles from './styles/SettingsScreen.styles';
import { useTranslation } from '../i18n/useTranslation';

export default function FriendsScreen({ navigation, route, showClose = true }) {
  const { t } = useTranslation();
  const [showAddSheet, setShowAddSheet] = useState(false);
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
    onlineFriends,
    loadingOnline,
    onRemoveFriend,
    friendsFeedback,
    friendRequestSent,
  } = useSettingsController({ navigation, route });

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [scrollRef])
  );

  const handleOpenAdd = useCallback(() => {
    setShowAddSheet(true);
  }, []);

  const handleCloseAdd = useCallback(() => {
    setShowAddSheet(false);
    setFriendCodeInput('');
  }, [setFriendCodeInput]);

  useEffect(() => {
    if (!showAddSheet || !friendRequestSent || addingFriend) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setShowAddSheet(false);
      setFriendCodeInput('');
    }, 220);
    return () => clearTimeout(timer);
  }, [addingFriend, friendRequestSent, setFriendCodeInput, showAddSheet]);

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
      >
        <FriendsSection
          friends={friends}
          loadingFriends={loadingFriends}
          friendRequests={friendRequests}
          loadingFriendRequests={loadingFriendRequests}
          respondingFriendRequestId={respondingFriendRequestId}
          onAcceptFriendRequest={onAcceptFriendRequest}
          onlineFriends={onlineFriends}
          loadingOnline={loadingOnline}
          onRemoveFriend={onRemoveFriend}
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
    </View>
  );
}
