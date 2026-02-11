import { Pressable, Text, View } from 'react-native';
import styles, {
  getOptionButtonStyle,
  getOptionTextStyle,
} from '../styles/QuizScreen.styles';

export default function OptionsList({
  currentQuestion,
  selectedOption,
  hiddenOptions,
  timedOut,
  isAnswerLocked,
  isMultiplayer,
  matchIsActive,
  onSelectOption,
}) {
  const hiddenSet = new Set(Array.isArray(hiddenOptions) ? hiddenOptions : []);
  const visibleOptions = Array.isArray(currentQuestion.options)
    ? currentQuestion.options.filter((opt) => !hiddenSet.has(opt))
    : [];

  return (
    <View style={styles.optionsList}>
      {visibleOptions.map((opt, i) => {
        const optionKey = `${i}-${opt}`;
        const isOptionSelected = selectedOption === opt;
        const isCorrectOption = opt === currentQuestion.correct_answer;
        const showFeedback =
          isAnswerLocked && (selectedOption !== null || timedOut);

        let backgroundColor = '#111827';
        let borderColor = 'rgba(148, 163, 184, 0.25)';
        let textColor = '#E2E8F0';
        let extraOpacity = 1;

        if (showFeedback) {
          if (isCorrectOption) {
            backgroundColor = 'rgba(34, 197, 94, 0.25)';
            borderColor = 'rgba(34, 197, 94, 0.6)';
            textColor = '#BBF7D0';
          } else if (isOptionSelected) {
            backgroundColor = 'rgba(248, 113, 113, 0.25)';
            borderColor = 'rgba(248, 113, 113, 0.6)';
            textColor = '#FCA5A5';
          } else {
            backgroundColor = '#111827';
            borderColor = 'rgba(148, 163, 184, 0.15)';
            textColor = '#E2E8F0';
            extraOpacity = 0.85;
          }
        } else if (isOptionSelected) {
          backgroundColor = 'rgba(59, 130, 246, 0.18)';
          borderColor = 'rgba(59, 130, 246, 0.5)';
          textColor = '#BFDBFE';
        }

        return (
          <Pressable
            key={optionKey}
            onPress={() => onSelectOption(opt)}
            disabled={
              isAnswerLocked || (isMultiplayer && !matchIsActive)
            }
            style={getOptionButtonStyle({
              backgroundColor,
              borderColor,
              opacity: extraOpacity,
            })}
          >
            <Text style={getOptionTextStyle(textColor)}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
