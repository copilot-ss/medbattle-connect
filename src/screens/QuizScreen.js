import { useMemo } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import styles from './styles/QuizScreen.styles';
import { colors } from '../styles/theme';
import QuizHeader from './quiz/QuizHeader';
import TimerBar from './quiz/TimerBar';
import QuestionCard from './quiz/QuestionCard';
import OptionsList from './quiz/OptionsList';
import BoostRow from './quiz/BoostRow';
import TimeoutBanner from './quiz/TimeoutBanner';
import ExitConfirmModal from './quiz/ExitConfirmModal';
import useQuizController from './quiz/useQuizController';
import { useConnectivity } from '../context/ConnectivityContext';
import { useTranslation } from '../i18n/useTranslation';

export default function QuizScreen({ navigation, route }) {
  const { t } = useTranslation();
  const { isOnline, isChecking, checkOnline } = useConnectivity();
  const isOffline = isOnline === false;
  const {
    activeIndex,
    answer,
    category,
    currentQuestion,
    difficultyLabel,
    handleExitCancel,
    handleExitConfirm,
    handleExitRequest,
    hasQuestions,
    isAnswerLocked,
    isMultiplayer,
    isQuickPlay,
    matchIsActive,
    progressPercent,
    questionLimit,
    resolvedError,
    selectedOption,
    showExitConfirm,
    showLoading,
    timeLeftMs,
    timedOut,
    totalQuestions,
    boostInventory,
    hiddenOptions,
    usedBoosts,
    isTimerFrozen,
    handleUseFreezeTime,
    handleUseFiftyFifty,
  } = useQuizController({ navigation, route });

  const boostItems = useMemo(() => {
    const isBoostDisabled = isAnswerLocked || timedOut || !matchIsActive;
    const items = [
      {
        id: 'joker_5050',
        label: t('Joker 50/50'),
        icon: 'help-circle',
        count: boostInventory.joker_5050,
        active: Boolean(usedBoosts?.joker_5050),
        disabled: isBoostDisabled || Boolean(usedBoosts?.joker_5050),
        onPress: handleUseFiftyFifty,
      },
      {
        id: 'freeze_time',
        label: t('Zeit einfrieren'),
        icon: 'time',
        count: boostInventory.freeze_time,
        active: Boolean(usedBoosts?.freeze_time) || isTimerFrozen,
        disabled:
          isBoostDisabled || Boolean(usedBoosts?.freeze_time) || isTimerFrozen,
        onPress: handleUseFreezeTime,
      },
    ];

    return items.filter((item) => item.count > 0 || item.active);
  }, [
    boostInventory.freeze_time,
    boostInventory.joker_5050,
    handleUseFiftyFifty,
    handleUseFreezeTime,
    isAnswerLocked,
    isTimerFrozen,
    matchIsActive,
    t,
    timedOut,
    usedBoosts,
  ]);

  async function handleGoOnline() {
    await checkOnline({ force: true });
  }

  if (showLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>{t('Fragen werden geladen ...')}</Text>
      </View>
    );
  }

  if (resolvedError || !hasQuestions) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {resolvedError ? t(resolvedError) : t('Keine Fragen verfügbar. Bitte versuche es später erneut.')}
        </Text>
        <Pressable
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
          style={styles.errorButton}
        >
          <Text style={styles.errorButtonText}>{t('Zurück zur Basis')}</Text>
        </Pressable>
      </View>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const categoryLabel = isQuickPlay
    ? t('Quick Play')
    : category
    ? t(category)
    : t('Quiz');

  return (
    <View style={styles.screen}>
      <QuizHeader
        difficultyLabel={difficultyLabel}
        totalQuestions={totalQuestions}
        questionLimit={questionLimit}
        activeIndex={activeIndex}
        onExit={handleExitRequest}
        showMeta={isMultiplayer}
        showProgress={!isMultiplayer}
        categoryLabel={categoryLabel}
      />

      {isOffline ? (
        <View style={styles.offlineBanner}>
          <View style={styles.offlineBannerRow}>
            <Text style={styles.offlineBannerTitle}>{t('Offline Modus')}</Text>
            <Pressable
              onPress={handleGoOnline}
              style={[styles.offlineButton, isChecking ? styles.offlineButtonDisabled : null]}
              disabled={isChecking}
            >
              <Text style={styles.offlineButtonText}>
                {isChecking ? `${t('Verbindung prüfen')}...` : t('Online gehen')}
              </Text>
            </Pressable>
          </View>
          <Text style={styles.offlineBannerText}>
            {t('Du spielst offline. Dein Score wird synchronisiert, sobald du online bist.')}
          </Text>
        </View>
      ) : null}

      <TimerBar
        matchIsActive={matchIsActive}
        timeLeftMs={timeLeftMs}
        progressPercent={progressPercent}
        timedOut={timedOut}
      />

      <QuestionCard
        activeIndex={activeIndex}
        totalQuestions={totalQuestions}
        question={currentQuestion.question}
        showProgress={!isMultiplayer}
      />

      {boostItems.length ? <BoostRow items={boostItems} /> : null}

      <OptionsList
        currentQuestion={currentQuestion}
        selectedOption={selectedOption}
        hiddenOptions={hiddenOptions}
        timedOut={timedOut}
        isAnswerLocked={isAnswerLocked}
        isMultiplayer={isMultiplayer}
        matchIsActive={matchIsActive}
        onSelectOption={answer}
      />

      <TimeoutBanner timedOut={timedOut} isAnswerLocked={isAnswerLocked} />

      <ExitConfirmModal
        visible={showExitConfirm}
        onCancel={handleExitCancel}
        onConfirm={handleExitConfirm}
      />
    </View>
  );
}
