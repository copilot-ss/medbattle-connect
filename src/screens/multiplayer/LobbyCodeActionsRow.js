import { Pressable, Text, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/MultiplayerLobbyScreen.styles';

export default function LobbyCodeActionsRow({
  currentJoinCode,
  copied,
  onCopyCode,
  difficultyLabel,
  questionLimit,
  categoryLabel,
}) {
  const { t } = useTranslation();

  return (
    <View style={styles.codeActionsRow}>
      <Pressable
        onPress={onCopyCode}
        style={[
          styles.codeBadge,
          copied ? styles.codeBadgeSuccess : null,
        ]}
      >
        <Text style={styles.codeBadgeText}>{currentJoinCode}</Text>
        <Text style={copied ? styles.codeHintSuccess : styles.codeHint}>
          {copied ? t('Kopiert!') : t('Tippen zum Kopieren')}
        </Text>
      </Pressable>
      <View style={styles.codeSettingsWrap}>
        <Text style={styles.codeSettingText}>
          {t('Schwierigkeit')}: {difficultyLabel}
        </Text>
        <Text style={styles.codeSettingText}>
          {t('Fragenanzahl')}: {questionLimit}
        </Text>
        <Text style={styles.codeSettingText}>
          {t('Kategorie')}: {categoryLabel ? t(categoryLabel) : '-'}
        </Text>
      </View>
    </View>
  );
}
