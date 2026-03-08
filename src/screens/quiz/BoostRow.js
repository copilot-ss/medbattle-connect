import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/QuizScreen.styles';

const JOKER_GLYPH = '🃏';

export default function BoostRow({ items }) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <View style={styles.boostRow}>
      {items.map((item) => {
        const disabled = Boolean(item.disabled);
        const active = Boolean(item.active);
        const isJoker = item.id === 'joker_5050';
        const iconColor = active
          ? '#7F8696'
          : isJoker
            ? '#FFE6F3'
            : '#D6F4FF';
        return (
          <Pressable
            key={item.id}
            onPress={item.onPress}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityState={{ disabled, selected: active }}
            style={[
              styles.boostButton,
              isJoker ? styles.boostButtonJoker : styles.boostButtonFreeze,
              active ? styles.boostButtonConsumed : null,
              disabled && !active ? styles.boostButtonDisabled : null,
            ]}
          >
            <View
              style={[
                styles.boostGlyphWrap,
                isJoker
                  ? styles.boostGlyphWrapJoker
                  : styles.boostGlyphWrapFreeze,
                active ? styles.boostGlyphWrapConsumed : null,
              ]}
            >
              {isJoker ? (
                <Text style={styles.boostJokerGlyph}>{JOKER_GLYPH}</Text>
              ) : (
                <Ionicons name={item.icon || 'snow'} size={26} color={iconColor} />
              )}
            </View>

            {isJoker ? (
              <View style={styles.boostTypeBadge}>
                <Text style={styles.boostTypeBadgeText}>50/50</Text>
              </View>
            ) : null}

            {!item.hideCount && Number.isFinite(item.count) && item.count > 0 ? (
              <View style={styles.boostCountBadge}>
                <Text style={styles.boostCountBadgeText}>{item.count}</Text>
              </View>
            ) : null}

            {active ? (
              <View style={styles.boostUsedBadge}>
                <Ionicons name="checkmark" size={11} color="#0B1020" />
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
