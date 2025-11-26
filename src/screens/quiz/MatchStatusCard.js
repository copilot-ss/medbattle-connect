import { Text, View } from 'react-native';
import styles from '../styles/QuizScreen.styles';

export default function MatchStatusCard({
  matchPlayerState,
  matchOpponentState,
  activeIndex,
  totalQuestions,
  matchJoinCode,
  initialJoinCode,
  resolvedMatchStatus,
}) {
  return (
    <View style={styles.matchStatusCard}>
      <View style={styles.matchPlayersRow}>
        <View style={styles.playerPanel}>
          <Text style={styles.playerPanelLabel}>Du</Text>
          <Text style={styles.playerPanelName}>
            {matchPlayerState?.username ?? 'Du'}
          </Text>
          <Text style={styles.playerPanelScore}>
            {matchPlayerState?.score ?? 0}
          </Text>
        </View>
        <View style={styles.vsDivider}>
          <Text style={styles.vsDividerText}>VS</Text>
        </View>
        <View style={styles.playerPanel}>
          <Text style={styles.playerPanelLabel}>Gegner</Text>
          <Text style={styles.playerPanelName}>
            {matchOpponentState?.username ?? 'Unbekannt'}
          </Text>
          <Text style={styles.playerPanelScore}>
            {matchOpponentState?.score ?? 0}
          </Text>
        </View>
      </View>
      <View style={styles.matchMetaRow}>
        <Text style={styles.matchMetaLeft}>
          Runde {Math.min(activeIndex + 1, totalQuestions)}/{totalQuestions}
        </Text>
        <Text style={styles.matchMetaRight}>
          Code {matchJoinCode ?? initialJoinCode ?? '-'}
        </Text>
      </View>
      {resolvedMatchStatus === 'waiting' ? (
        <Text style={styles.matchWaitingHint}>
          Warte auf Gegner - Fragen starten sobald beide bereit sind.
        </Text>
      ) : null}
    </View>
  );
}
