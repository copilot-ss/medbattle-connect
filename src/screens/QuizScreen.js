import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import styles from './styles/QuizScreen.styles';
import QuizHeader from './quiz/QuizHeader';
import MatchStatusCard from './quiz/MatchStatusCard';
import TimerBar from './quiz/TimerBar';
import QuestionCard from './quiz/QuestionCard';
import OptionsList from './quiz/OptionsList';
import TimeoutBanner from './quiz/TimeoutBanner';
import ExitConfirmModal from './quiz/ExitConfirmModal';
import useQuizController from './quiz/useQuizController';

export default function QuizScreen({ navigation, route }) {
  const {
    activeIndex,
    answer,
    currentQuestion,
    difficultyLabel,
    handleExitCancel,
    handleExitConfirm,
    handleExitRequest,
    hasQuestions,
    initialJoinCode,
    isAnswerLocked,
    isMultiplayer,
    matchIsActive,
    matchJoinCode,
    matchOpponentState,
    matchPlayerState,
    progressPercent,
    questionLimit,
    resolvedError,
    resolvedMatchStatus,
    selectedOption,
    showExitConfirm,
    showLoading,
    timeLeftMs,
    timedOut,
    totalQuestions,
  } = useQuizController({ navigation, route });

  if (showLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#60A5FA" />
        <Text style={styles.loadingText}>Fragen werden geladen ...</Text>
      </View>
    );
  }

  if (resolvedError || !hasQuestions) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {resolvedError ?? 'Keine Fragen verfuegbar. Bitte versuche es spaeter erneut.'}
        </Text>
        <Pressable
          onPress={() => navigation.navigate('Home')}
          style={styles.errorButton}
        >
          <Text style={styles.errorButtonText}>Zurueck zur Basis</Text>
        </Pressable>
      </View>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <View style={styles.screen}>
      <QuizHeader
        difficultyLabel={difficultyLabel}
        totalQuestions={totalQuestions}
        questionLimit={questionLimit}
        activeIndex={activeIndex}
        onExit={handleExitRequest}
      />

      {isMultiplayer ? (
        <MatchStatusCard
          matchPlayerState={matchPlayerState}
          matchOpponentState={matchOpponentState}
          activeIndex={activeIndex}
          totalQuestions={totalQuestions}
          matchJoinCode={matchJoinCode}
          initialJoinCode={initialJoinCode}
          resolvedMatchStatus={resolvedMatchStatus}
        />
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
