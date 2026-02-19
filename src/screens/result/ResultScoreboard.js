import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/ResultScreen.styles';

export default function ResultScoreboard({
  entries,
  selectedEntryKey,
  onSelectEntry,
}) {
  const { t } = useTranslation();
  const isInteractive = typeof onSelectEntry === 'function';

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
            <View style={styles.scoreboardAvatar}>
              {entry.avatarSource ? (
                <Image
                  source={entry.avatarSource}
                  style={styles.scoreboardAvatarImage}
                />
              ) : entry.avatarIcon ? (
                <Ionicons
                  name={entry.avatarIcon}
                  size={20}
                  color={entry.avatarColor || '#9EDCFF'}
                />
              ) : (
                <Text style={styles.scoreboardAvatarText}>{entry.initials}</Text>
              )}
            </View>
            <View style={styles.scoreboardMeta}>
              <Text style={styles.scoreboardName} numberOfLines={1}>
                {entry.name}
              </Text>
              {entry.isSelf ? (
                <Text style={styles.scoreboardTag}>{t('Du')}</Text>
              ) : null}
            </View>
            <View style={styles.scoreboardScoreBox}>
              <Text style={styles.scoreboardScore}>
                {Number.isFinite(entry.score) ? entry.score : '-'}
              </Text>
              <Text style={styles.scoreboardScoreLabel}>{t('Richtig')}</Text>
            </View>
          </Pressable>
        ))}
      </View>
      {isInteractive ? (
        <Text style={styles.multiplayerMeta}>
          {t('Tippe auf einen Spieler, um Antworten zu sehen.')}
        </Text>
      ) : null}
    </View>
  );
}
