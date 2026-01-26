import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import styles from './styles/QuizScreen.styles';
import { colors } from '../styles/theme';
import QuizHeader from './quiz/QuizHeader';
import TimerBar from './quiz/TimerBar';
import QuestionCard from './quiz/QuestionCard';
import OptionsList from './quiz/OptionsList';
import TimeoutBanner from './quiz/TimeoutBanner';
import ExitConfirmModal from './quiz/ExitConfirmModal';
import useQuizController from './quiz/useQuizController';
import { useConnectivity } from '../context/ConnectivityContext';

export default function QuizScreen({ navigation, route }) {
  const { isOnline, isChecking, checkOnline } = useConnectivity();
  const isOffline = isOnline === false;
  const {
    activeIndex,
    answer,
    currentQuestion,
    difficultyLabel,
    handleExitCancel,
    handleExitConfirm,
    handleExitRequest,
    hasQuestions,
    isAnswerLocked,
    isMultiplayer,
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
  } = useQuizController({ navigation, route });

  async function handleGoOnline() {
    await checkOnline({ force: true });
  }

  if (showLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Fragen werden geladen ...</Text>
      </View>
    );
  }

  if (resolvedError || !hasQuestions) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {resolvedError ?? 'Keine Fragen verf\u00fcgbar. Bitte versuche es sp\u00e4ter erneut.'}
        </Text>
        <Pressable
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
          style={styles.errorButton}
        >
          <Text style={styles.errorButtonText}>Zur\u00fcck zur Basis</Text>
        </Pressable>
      </View>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <View style={styles.screen}>
      <View style={styles.backgroundGlowTop} pointerEvents="none" />
      <View style={styles.backgroundGlowBottom} pointerEvents="none" />
      <QuizHeader
        difficultyLabel={difficultyLabel}
        totalQuestions={totalQuestions}
        questionLimit={questionLimit}
        activeIndex={activeIndex}
        onExit={handleExitRequest}
        showProgress={!isMultiplayer}
      />

      {isOffline ? (
        <View style={styles.offlineBanner}>
          <View style={styles.offlineBannerRow}>
            <Text style={styles.offlineBannerTitle}>Offline Modus</Text>
            <Pressable
              onPress={handleGoOnline}
              style={[styles.offlineButton, isChecking ? styles.offlineButtonDisabled : null]}
              disabled={isChecking}
            >
              <Text style={styles.offlineButtonText}>
                {isChecking ? 'Verbindung pr\u00fcfen...' : 'Online gehen'}
              </Text>
            </Pressable>
          </View>
          <Text style={styles.offlineBannerText}>
            Du spielst offline. Dein Score wird synchronisiert, sobald du online bist.
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

      <OptionsList
        currentQuestion={currentQuestion}
        selectedOption={selectedOption}
        timedOut={timedOut}
        isAnswerLocked={isAnswerLocked}
        isMultiplayer={isMultiplayer}
        matchIsActive={matchIsActive}
        onSelectOption={answer}
      />

      <TimeoutBanner timedOut={timedOut} isAnswerLocked={isAnswerLocked} />

      <ExitConfirmModal
        visible={showExitConfirm}
        isMultiplayer={isMultiplayer}
        onCancel={handleExitCancel}
        onConfirm={handleExitConfirm}
      />
    </View>
  );
}
