import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';

import styles from '../styles/MultiplayerLobbyScreen.styles';

export default function DifficultyChips({
  labels,
  accents,
  selectedKey,
  onSelect,
} = {}) {
  const { t } = useTranslation();
  const entries = labels ? Object.keys(labels) : [];

  if (!entries.length) {
    return null;
  }

  return (
    <View style={styles.difficultyChips}>
      {entries.map((key) => {
        const active = key === selectedKey;
        const accent = accents?.[key] ?? '#60A5FA';
        return (
          <Pressable
            key={key}
            onPress={() => onSelect?.(key)}
            style={[
              styles.difficultyChip,
              active
                ? [
                    styles.difficultyChipActive,
                    {
                      borderColor: accent,
                      backgroundColor: `${accent}22`,
                    },
                  ]
                : { borderColor: 'rgba(148, 163, 184, 0.3)' },
            ]}
          >
            <Text
              style={[
                styles.difficultyChipText,
                active
                  ? [styles.difficultyChipTextActive, { color: accent }]
                  : { color: '#E2E8F0' },
              ]}
            >
              {t(labels[key])}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
