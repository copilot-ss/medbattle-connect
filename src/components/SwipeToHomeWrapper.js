import { useMemo } from 'react';
import { PanResponder, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function SwipeToHomeWrapper({ children }) {
  const navigation = useNavigation();
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          const { dx, dy } = gestureState;
          return dx > 20 && Math.abs(dx) > Math.abs(dy) * 1.4;
        },
        onPanResponderRelease: (_, gestureState) => {
          const { dx, vx } = gestureState;
          if (dx > 80 || vx > 0.6) {
            navigation.navigate('Home');
          }
        },
      }),
    [navigation]
  );

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      {children}
    </View>
  );
}
