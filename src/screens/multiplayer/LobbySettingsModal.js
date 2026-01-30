import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';

import DifficultyChips from './DifficultyChips';
import QuestionLimitStepper from './QuestionLimitStepper';
import styles from '../styles/MultiplayerLobbyScreen.styles';

export default function LobbySettingsModal({
  visible,
  labels,
  accents,
  difficulty,
  questionLimit,
  min = 1,
  max = 50,
  onChangeDifficulty,
  onDecrement,
  onIncrement,
  onApply,
  isLoading = false,
} = {}) {
  const { t } = useTranslation();

  if (!visible) {
    return null;
  }

  const safeDifficulty = typeof difficulty === 'string' ? difficulty : 'mittel';
  const safeLimit = Number.isFinite(questionLimit) ? questionLimit : min;
  const safeLabels = labels && typeof labels === 'object' ? labels : {};
  const safeAccents = accents && typeof accents === 'object' ? accents : {};
  const accentColor = safeAccents[safeDifficulty] ?? '#60A5FA';
  const range = Math.max(1, max - min);
  const progress = Math.min(1, Math.max(0, (safeLimit - min) / range));
  const progressWidth = `${Math.round(progress * 100)}%`;
  const handleApply = () => {
    if (isLoading) {
      return;
    }
    if (typeof onApply === 'function') {
      onApply();
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <Pressable
        style={styles.modalBackdrop}
        onPress={handleApply}
        disabled={isLoading}
      />
      <View style={[styles.modalCard, styles.settingsModalCard]}>
        <Text style={styles.settingsModalTitle}>{t('Lobby Einstellungen')}</Text>

        <View style={styles.settingsModalSection}>
          <Text style={styles.settingsModalLabel}>{t('Schwierigkeit')}</Text>
          <DifficultyChips
            labels={safeLabels}
            accents={safeAccents}
            selectedKey={safeDifficulty}
            onSelect={onChangeDifficulty}
          />
        </View>

        <View style={styles.settingsModalSection}>
          <Text style={styles.settingsModalLabel}>{t('Fragenanzahl')}</Text>
          <QuestionLimitStepper
            value={safeLimit}
            min={min}
            max={max}
            onDecrement={onDecrement}
            onIncrement={onIncrement}
          />
        </View>

        <Pressable
          onPress={handleApply}
          disabled={isLoading}
          style={[
            styles.settingsApplyButton,
            { borderColor: accentColor },
            isLoading ? styles.actionDisabled : null,
          ]}
        >
          <View
            style={[
              styles.settingsApplyFill,
              {
                width: progressWidth,
                backgroundColor: accentColor,
              },
            ]}
          />
          <Text style={styles.settingsApplyText}>
            {isLoading ? t('Speichern ...') : t('Übernehmen')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
