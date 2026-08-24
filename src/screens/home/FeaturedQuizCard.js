import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '../../styles/theme';
import styles from '../styles/HomeScreen.styles';

function FeaturedQuizCard({
  title,
  subtitle,
  buttonLabel,
  onPress,
  disabled,
  showAnimation,
  artStyle = null,
  buttonStyle = null,
  buttonTextStyle = null,
  cardStyle = null,
  rewardIconStyle = null,
  rewardTextStyle = null,
  titleStyle = null,
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.featuredCard,
        cardStyle,
        pressed && !disabled ? styles.featuredCardPressed : null,
        disabled ? styles.featuredCardDisabled : null,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${buttonLabel}`}
      accessibilityState={{ disabled }}
    >
      <LinearGradient
        colors={gradients.surfaceAccent}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
        style={styles.featuredCardGradient}
      />
      <View style={styles.featuredCardTop}>
        <View style={styles.featuredCardCopy}>
          <Text style={[styles.featuredCardTitle, titleStyle]}>{title}</Text>
          {subtitle ? (
            <View style={styles.featuredCardRewardRow}>
              <Text style={[styles.featuredCardRewardText, rewardTextStyle]}>
                {subtitle}
              </Text>
              <Text style={[styles.featuredCardRewardIcon, rewardIconStyle]}>
                {'\u{1FA99}'}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
      <View style={styles.featuredCardBottom}>
        <LinearGradient
          colors={gradients.play}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.featuredCardButton,
            buttonStyle,
            disabled ? styles.featuredCardButtonDisabled : null,
          ]}
        >
          <Ionicons name="play" size={16} color="#211500" />
          <Text style={[styles.featuredCardButtonText, buttonTextStyle]}>
            {buttonLabel}
          </Text>
        </LinearGradient>
      </View>
      {showAnimation ? (
        <View
          style={[
            styles.featuredCardArt,
            artStyle,
          ]}
          pointerEvents="none"
        >
          <Ionicons name="medkit" size={94} color="rgba(255, 255, 255, 0.9)" />
        </View>
      ) : null}
    </Pressable>
  );
}

export default memo(FeaturedQuizCard);
