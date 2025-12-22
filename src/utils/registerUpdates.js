import { AppState } from 'react-native';
import * as Updates from 'expo-updates';

let updateInProgress = false;

async function checkAndApplyUpdate() {
  if (__DEV__ || updateInProgress || !Updates.isEnabled) {
    return;
  }

  updateInProgress = true;
  try {
    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    }
  } catch (error) {
    void error;
  } finally {
    updateInProgress = false;
  }
}

export default function registerUpdates() {
  checkAndApplyUpdate();

  let currentState = AppState.currentState || 'active';
  const subscription = AppState.addEventListener('change', (nextState) => {
    if (
      (currentState === 'inactive' || currentState === 'background') &&
      nextState === 'active'
    ) {
      checkAndApplyUpdate();
    }
    currentState = nextState;
  });

  return () => {
    subscription.remove();
  };
}
