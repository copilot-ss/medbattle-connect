import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import LottieView from 'lottie-react-native';
import styles from '../styles/HomeScreen.styles';
import EnergyBadge from './EnergyBadge';

function FeaturedQuizCard({
  title,
  subtitle,
  buttonLabel,
  onPress,
  disabled,
  energy,
  energyMax,
  nextEnergyAt,
  isPremium,
  isLocked,
  onRefreshEnergy,
  showAnimation,
  animationSource,
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.featuredCard,
        pressed && !disabled ? styles.featuredCardPressed : null,
        disabled ? styles.featuredCardDisabled : null,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.featuredCardTop}>
        <View style={styles.featuredCardCopy}>
          <Text style={styles.featuredCardTitle}>{title}</Text>
          <Text style={styles.featuredCardSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.featuredCardBadge}>
          <EnergyBadge
            energy={energy}
            energyMax={energyMax}
            nextEnergyAt={nextEnergyAt}
            isPremium={isPremium}
            isLocked={isLocked}
            onRefreshEnergy={onRefreshEnergy}
          />
        </View>
      </View>
      <View style={styles.featuredCardBottom}>
        <View
          style={[
            styles.featuredCardButton,
            disabled ? styles.featuredCardButtonDisabled : null,
          ]}
        >
          <Text style={styles.featuredCardButtonText}>{buttonLabel}</Text>
        </View>
      </View>
      {showAnimation && animationSource ? (
        <View style={styles.featuredCardArt} pointerEvents="none">
          <LottieView
            source={animationSource}
            style={styles.featuredCardAnimation}
            autoPlay
            loop
          />
        </View>
      ) : null}
    </Pressable>
  );
}

export default memo(FeaturedQuizCard);
