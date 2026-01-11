import { ScrollView, Text, View } from 'react-native';
import FriendsSection from './settings/FriendsSection';
import SettingsHeader from './settings/SettingsHeader';
import useSettingsController from './settings/useSettingsController';
import styles from './styles/SettingsScreen.styles';

export default function FriendsScreen({ navigation, route }) {
  const {
    scrollRef,
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
  } = useSettingsController({ navigation, route });

  return (
    <View style={styles.container}>
      <SettingsHeader title="Freunde" onClose={() => navigation.goBack()} />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
          friends={friends}
          loadingFriends={loadingFriends}
          onlineFriends={onlineFriends}
          loadingOnline={loadingOnline}
          onRemoveFriend={onRemoveFriend}
        />

        {friendsFeedback ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>{friendsFeedback}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
