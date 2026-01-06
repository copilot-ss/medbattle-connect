import React from 'react';
import { Pressable, Text, View } from 'react-native';

import styles from '../styles/MultiplayerLobbyScreen.styles';

export default function QuestionLimitStepper({
  value,
  min = 1,
  max = 50,
  onDecrement,
  onIncrement,
  containerStyle,
} = {}) {
  const normalizedValue = Number.isFinite(value) ? value : min;
  const disableDecrement = normalizedValue <= min;
  const disableIncrement = normalizedValue >= max;
  const container = containerStyle ?? styles.questionStepper;

  return (
    <View style={container}>
      <Pressable
        onPress={onDecrement}
        style={[
          styles.stepperButton,
          disableDecrement ? styles.stepperButtonDisabled : null,
        ]}
        disabled={disableDecrement}
      >
        <Text style={styles.stepperButtonText}>-</Text>
      </Pressable>
      <Text style={styles.stepperValue}>{normalizedValue}</Text>
      <Pressable
        onPress={onIncrement}
        style={[
          styles.stepperButton,
          disableIncrement ? styles.stepperButtonDisabled : null,
        ]}
        disabled={disableIncrement}
      >
        <Text style={styles.stepperButtonText}>+</Text>
      </Pressable>
    </View>
  );
}
