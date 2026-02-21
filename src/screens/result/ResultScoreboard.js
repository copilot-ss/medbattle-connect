import { Pressable, Text, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import AvatarView from '../../components/avatar/AvatarView';
import styles from '../styles/ResultScreen.styles';

export default function ResultScoreboard({
  entries,
  selectedEntryKey,
  onSelectEntry,
  onOpenProfile,
}) {
  const { t } = useTranslation();
  const isInteractive = typeof onSelectEntry === 'function';
  const canOpenProfile = typeof onOpenProfile === 'function';

  return (
    <View style={styles.multiplayerCard}>
      <Text style={styles.multiplayerTitle}>{t('Ranking')}</Text>
      <View style={styles.scoreboardList}>
        {entries.map((entry) => (
          <Pressable
            key={entry.key}
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
                <Text style={styles.scoreboardName} numberOfLines={1}>
                  {entry.name}
                </Text>
                {entry.isSelf ? (
                  <Text style={styles.scoreboardTag}>{t('Du')}</Text>
                ) : null}
              </View>
            </Pressable>
            <View style={styles.scoreboardScoreBox}>
              <Text style={styles.scoreboardScore}>
                {Number.isFinite(entry.score) ? entry.score : '-'}
              </Text>
              <Text style={styles.scoreboardScoreLabel}>{t('Richtig')}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
