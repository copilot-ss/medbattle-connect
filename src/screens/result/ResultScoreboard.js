import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../i18n/useTranslation';
import AvatarView from '../../components/avatar/AvatarView';
import { BubbleReveal } from './ResultWidgets';
import styles from '../styles/ResultScreen.styles';

function renderBoostChip(boostId, entryKey) {
  if (boostId === 'joker_5050') {
    return (
      <View key={`${entryKey}-${boostId}`} style={styles.scoreboardBoostChip}>
        <Text style={styles.scoreboardBoostChipText}>50/50</Text>
      </View>
    );
  }
  if (boostId === 'freeze_time') {
    return (
      <View
        key={`${entryKey}-${boostId}`}
        style={[styles.scoreboardBoostChip, styles.scoreboardBoostChipIconOnly]}
      >
        <Ionicons name="snow" size={14} color="#DFF3FF" />
      </View>
    );
  }
  return null;
}

export default function ResultScoreboard({
  entries,
  selectedEntryKey,
  onSelectEntry,
  onOpenProfile,
  entranceKey = '',
  baseDelay = 0,
}) {
  const { t } = useTranslation();
  const isInteractive = typeof onSelectEntry === 'function';
  const canOpenProfile = typeof onOpenProfile === 'function';

  return (
    <View style={styles.multiplayerCard}>
      <BubbleReveal delay={baseDelay} resetKey={`${entranceKey}:scoreboard-title`}>
        <Text style={styles.multiplayerTitle}>{t('Ranking')}</Text>
      </BubbleReveal>
      <View style={styles.scoreboardList}>
        {entries.map((entry, index) => (
          <BubbleReveal
            key={entry.key}
            delay={baseDelay + 85 * (index + 1)}
            resetKey={`${entranceKey}:scoreboard-row:${index}`}
          >
            <Pressable
              onPress={isInteractive ? () => onSelectEntry(entry.key) : undefined}
              disabled={!isInteractive}
              style={[
                styles.scoreboardRow,
                isInteractive ? styles.scoreboardRowInteractive : null,
                selectedEntryKey === entry.key ? styles.scoreboardRowSelected : null,
                entry.isSelf ? styles.scoreboardRowSelf : null,
              ]}
            >
              <Text style={styles.scoreboardRank}>{entry.rank}.</Text>
              <Pressable
                onPress={
                  canOpenProfile && !entry.isSelf && entry.userId
                    ? () => onOpenProfile(entry)
                    : undefined
                }
                disabled={!canOpenProfile || entry.isSelf || !entry.userId}
                style={styles.scoreboardIdentityPressable}
              >
                <AvatarView
                  uri={entry.avatarUrl ?? null}
                  source={entry.avatarSource ?? null}
                  icon={entry.avatarIcon ?? null}
                  color={entry.avatarColor || '#9EDCFF'}
                  initials={entry.initials}
                  circleStyle={styles.scoreboardAvatar}
                  imageStyle={styles.scoreboardAvatarImage}
                  iconSize={20}
                  textStyle={styles.scoreboardAvatarText}
                />
                <View style={styles.scoreboardMeta}>
                  <View style={styles.scoreboardNameRow}>
                    <Text style={styles.scoreboardName} numberOfLines={1}>
                      {entry.name}
                    </Text>
                    {entry.isSelf ? (
                      <Text style={styles.scoreboardTag}>{t('Du')}</Text>
                    ) : null}
                  </View>
                  {Array.isArray(entry.usedBoostIds) && entry.usedBoostIds.length ? (
                    <View style={styles.scoreboardBoostRow}>
                      {entry.usedBoostIds.map((boostId) => renderBoostChip(boostId, entry.key))}
                    </View>
                  ) : null}
                </View>
              </Pressable>
              <View style={styles.scoreboardScoreBox}>
                <Text style={styles.scoreboardScore}>
                  {Number.isFinite(entry.score) ? entry.score : '-'}
                </Text>
              </View>
            </Pressable>
          </BubbleReveal>
        ))}
      </View>
    </View>
  );
}
