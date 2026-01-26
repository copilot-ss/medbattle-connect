import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/HomeScreen.styles';

function CategoryTile({ label, icon, accent, onPress, disabled, selected = false }) {
  const accentBackground = accent ? `${accent}1A` : undefined;
  const accentBorder = accent ? `${accent}55` : undefined;
  const selectedBackground = selected && accent ? `${accent}22` : undefined;
  const selectedBorder = selected && accent ? accent : undefined;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.categoryCard,
        selected ? { backgroundColor: selectedBackground, borderColor: selectedBorder } : null,
        pressed && !disabled ? styles.categoryCardPressed : null,
        disabled ? styles.categoryCardDisabled : null,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View
        style={[
          styles.categoryIconWrap,
          accentBackground ? { backgroundColor: accentBackground } : null,
          accentBorder ? { borderColor: accentBorder } : null,
          selected ? { backgroundColor: selectedBackground, borderColor: selectedBorder } : null,
        ]}
      >
        <Ionicons name={icon} size={20} color={accent} />
      </View>
      <Text style={styles.categoryLabel}>{label}</Text>
    </Pressable>
  );
}

export default memo(CategoryTile);
