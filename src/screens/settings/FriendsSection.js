import {
  ActivityIndicator,
  Pressable,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import styles from '../styles/SettingsScreen.styles';

export default function FriendsSection({
  friendRequestsEnabled,
  friendRequestsStatus,
  onToggleFriendRequests,
  friendCode,
  copySuccess,
  onCopyFriendCode,
  friendCodeInput,
  setFriendCodeInput,
  friendInputRef,
  onAddFriend,
  addingFriend,
  onlineFriends,
  loadingOnline,
  onRemoveFriend,
}) {
  return (
    <View style={[styles.card, styles.squadCard]}>
      <View style={[styles.rowBetween, styles.friendToggleRow]}>
        <Text style={styles.cardLabel}>Freundesanfragen</Text>
        <Switch
          value={friendRequestsEnabled}
          onValueChange={onToggleFriendRequests}
          trackColor={{ false: '#1F2937', true: '#0EA5E9' }}
          thumbColor={friendRequestsEnabled ? '#F8FAFC' : '#94A3B8'}
          accessibilityHint={friendRequestsStatus}
        />
      </View>

      <View style={styles.friendHeroRow}>
        <Text style={styles.friendHeroEmoji}></Text>
        <View style={styles.friendHeroTextGroup}>
          <Text style={styles.friendHeroTitle}>Freunde hinzufuegen</Text>
          <Text style={styles.friendHeroSubtitle}>
            Teile deinen Code und hol deine Crew ins Battle.
          </Text>
        </View>
      </View>

      <View style={styles.friendCodeCard}>
        <Text style={styles.friendCodeLabel}>Dein Battle-Code</Text>
        <Pressable
          onPress={onCopyFriendCode}
          style={styles.friendCodeValueWrapper}
          accessibilityLabel="Code kopieren"
        >
          <Text style={styles.friendCodeValue}>
            {friendCode || '------'}
          </Text>
          <Text style={styles.friendCodeCopy}>
            {copySuccess ? 'Kopiert!' : '->'}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.friendInputLabel}>Code von Freund eingeben</Text>
      <View style={styles.fieldGroup}>
        <TextInput
          ref={friendInputRef}
          value={friendCodeInput}
          onChangeText={setFriendCodeInput}
          placeholder="ABC12345"
          placeholderTextColor="#64748B"
          autoCapitalize="characters"
          keyboardType="default"
          style={styles.input}
        />
        <Pressable
          onPress={onAddFriend}
          disabled={addingFriend}
          style={[
            styles.actionButton,
            styles.successButton,
            addingFriend ? styles.disabledButton : null,
          ]}
        >
          {addingFriend ? (
            <ActivityIndicator color="#F8FAFC" />
          ) : (
            <Text style={styles.successButtonText}>Freund hinzufuegen</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.friendList}>
        <View style={styles.friendListHeader}>
          <Text style={styles.friendListTitle}>Freunde online</Text>
          <Text style={styles.friendListCount}>
            {onlineFriends.length ? `${onlineFriends.length}` : ''}
          </Text>
        </View>

        {loadingOnline ? (
          <View style={styles.friendLoading}>
            <ActivityIndicator color="#60A5FA" />
            <Text style={styles.friendLoadingText}>
              Online-Status wird geladen ...
            </Text>
          </View>
        ) : onlineFriends.length ? (
          onlineFriends.map((friend) => (
            <View key={friend.code} style={styles.friendRow}>
              <View>
                <Text style={styles.friendCodeText}>
                  {friend.username ?? 'Freund'}
                </Text>
                <Text style={styles.friendStatusText}>{friend.status ?? 'Online'}</Text>
              </View>
              <Pressable
                onPress={() => onRemoveFriend({ code: friend.code })}
                style={styles.friendRemoveButton}
              >
                <Text style={styles.friendRemoveText}>Entfernen</Text>
              </Pressable>
            </View>
          ))
        ) : (
          <Text style={styles.friendEmptyText}>
            Keine Freunde online. Teile deinen Code und starte!
          </Text>
        )}
      </View>
    </View>
  );
}
