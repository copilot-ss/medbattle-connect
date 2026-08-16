import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radii } from '../../styles/theme';

function RewardChip({ type = 'xp', value, label = null, compact = false }) {
  const isCoin = type === 'coin';
  const accent = isCoin ? colors.highlight : colors.accentViolet;
  const backgroundColor = isCoin
    ? 'rgba(255, 216, 77, 0.12)'
    : 'rgba(168, 85, 247, 0.14)';

  return (
    <View
      style={[
        styles.chip,
        compact ? styles.chipCompact : null,
        { backgroundColor, borderColor: `${accent}70` },
      ]}
      accessibilityLabel={`+${value} ${label || (isCoin ? 'Coins' : 'XP')}`}
    >
      {isCoin ? (
        <Text style={[styles.coin, compact ? styles.coinCompact : null]}>
          {'\u{1FA99}'}
        </Text>
      ) : (
        <Ionicons
          name="sparkles"
          size={compact ? 12 : 14}
          color={accent}
        />
      )}
      <Text style={[styles.label, compact ? styles.labelCompact : null, { color: accent }]}>
        {`+${value}${label ? ` ${label}` : ''}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 30,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
  },
  chipCompact: {
    minHeight: 24,
    paddingHorizontal: 8,
    paddingVertical: 3,
    columnGap: 4,
  },
  coin: {
    fontSize: 15,
  },
  coinCompact: {
    fontSize: 12,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.2,
  },
  labelCompact: {
    fontSize: 10,
  },
});

export default memo(RewardChip);
