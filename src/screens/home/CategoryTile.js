import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import styles from '../styles/HomeScreen.styles';

function CategoryTile({
  label,
  icon,
  iconFamily = 'ion',
  accent,
  style,
  emojiStyle = null,
  iconSize = 20,
  iconWrapStyle = null,
  labelStyle = null,
  onPress,
  disabled,
  selected = false,
}) {
  const accentBackground = accent ? `${accent}1A` : undefined;
  const accentBorder = accent ? `${accent}55` : undefined;
  const selectedBackground = selected && accent ? `${accent}22` : undefined;
  const selectedBorder = selected && accent ? accent : undefined;
  const cardBorder = accent ? `${accent}${selected ? 'B8' : '55'}` : undefined;
  const cardGradient = accent
    ? [`${accent}${selected ? '38' : '22'}`, 'rgba(17, 20, 44, 0.98)']
    : ['rgba(56, 189, 248, 0.12)', 'rgba(17, 20, 44, 0.98)'];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.categoryCard,
        style,
        cardBorder ? { borderColor: cardBorder, shadowColor: accent } : null,
        selected ? { backgroundColor: selectedBackground, borderColor: selectedBorder } : null,
        pressed && !disabled ? styles.categoryCardPressed : null,
        disabled ? styles.categoryCardDisabled : null,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, selected }}
    >
      <LinearGradient
        colors={cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
        style={styles.categoryCardGradient}
      />
      <View
        style={[
          styles.categoryIconWrap,
          iconWrapStyle,
          accentBackground ? { backgroundColor: accentBackground } : null,
          accentBorder ? { borderColor: accentBorder } : null,
          selected ? { backgroundColor: selectedBackground, borderColor: selectedBorder } : null,
        ]}
      >
        {iconFamily === 'emoji' ? (
          <Text
            style={[styles.categoryEmoji, emojiStyle]}
            allowFontScaling={false}
          >
            {icon}
          </Text>
        ) : iconFamily === 'fa5' ? (
          <FontAwesome5 name={icon} size={iconSize} color={accent} />
        ) : (
          <Ionicons name={icon} size={iconSize} color={accent} />
        )}
      </View>
      <Text
        style={[styles.categoryLabel, labelStyle]}
        numberOfLines={1}
        ellipsizeMode="tail"
        adjustsFontSizeToFit
        minimumFontScale={0.85}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default memo(CategoryTile);
