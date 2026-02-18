import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/QuizScreen.styles';

export default function BoostRow({ items }) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <View style={styles.boostRow}>
      {items.map((item) => {
        const disabled = item.disabled || item.count <= 0;
        const active = Boolean(item.active);
        const freezeActive = item.id === 'freeze_time' && active;
        if (freezeActive) {
          return null;
        }
        const iconColor = active ? '#0A0A12' : '#E2E8F0';
        const showCountBadge = item.count > 0;
        return (
          <Pressable
            key={item.id}
            onPress={item.onPress}
            disabled={disabled}
            style={[
              styles.boostButton,
              active ? styles.boostButtonActive : null,
              disabled ? styles.boostButtonDisabled : null,
            ]}
          >
            <Ionicons name={item.icon} size={16} color={iconColor} />
            <Text
              style={[
                styles.boostButtonText,
                active ? styles.boostButtonTextActive : null,
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.label}
            </Text>
            {showCountBadge ? (
              <View style={styles.boostCountBadge}>
                <Text style={styles.boostCountText}>{item.count}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
