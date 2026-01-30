import { Image, Text, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/ResultScreen.styles';

export default function ResultScoreboard({ entries, matchStatusLabel, matchJoinCode }) {
  const { t } = useTranslation();

  return (
    <View style={styles.multiplayerCard}>
      <Text style={styles.multiplayerTitle}>{t('Ranking')}</Text>
      <View style={styles.scoreboardList}>
        {entries.map((entry) => (
          <View
            key={entry.key}
            style={[
              styles.scoreboardRow,
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
          </View>
        ))}
      </View>
      <Text style={styles.multiplayerMeta}>
        {matchStatusLabel}
        {matchJoinCode ? ` - ${t('Code')} ${matchJoinCode}` : ''}
      </Text>
    </View>
  );
}
