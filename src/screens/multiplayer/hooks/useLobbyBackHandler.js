import { useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

export default function useLobbyBackHandler({ currentMatch, onLeaveLobby }) {
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (currentMatch) {
          onLeaveLobby();
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => {
        subscription.remove();
      };
    }, [currentMatch, onLeaveLobby])
  );
}
