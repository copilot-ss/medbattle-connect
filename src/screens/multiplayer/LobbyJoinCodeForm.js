import { Animated, Pressable, Text, TextInput, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/MultiplayerLobbyScreen.styles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function LobbyJoinCodeForm({
  joinCode,
  onChangeJoinCode,
  onJoinByCode,
  onJoinPressIn,
  onJoinPressOut,
  joinPressStyle,
  joining,
  isJoinOnly,
}) {
  const { t } = useTranslation();

  return (
    <View style={styles.joinSection}>
      <Text style={styles.joinLabel}>{t('Match-Code eingeben')}</Text>
      <View style={styles.joinRow}>
        <TextInput
          value={joinCode}
          onChangeText={(value) =>
            onChangeJoinCode(value.toUpperCase().slice(0, 6))
          }
          style={styles.joinInput}
          placeholder="ABC12"
          placeholderTextColor="#64748B"
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={6}
          autoFocus={isJoinOnly}
        />
        <AnimatedPressable
          onPress={onJoinByCode}
          onPressIn={onJoinPressIn}
          onPressOut={onJoinPressOut}
          style={[
            styles.joinButton,
            joinPressStyle,
            joining ? styles.actionDisabled : null,
          ]}
          disabled={joining || !joinCode.trim()}
        >
          <Text style={styles.joinButtonText}>
            {joining ? t('Beitreten...') : t('Go')}
          </Text>
        </AnimatedPressable>
      </View>
    </View>
  );
}
