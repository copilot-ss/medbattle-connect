// App.js
import 'react-native-gesture-handler';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { registerRootComponent } from 'expo';
import { StatusBar, DevSettings, InteractionManager } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/AppNavigator';
import GlobalErrorBoundary from './src/components/GlobalErrorBoundary';
import registerGlobalErrorLogging from './src/utils/registerGlobalErrorLogging';
import { initializeAds } from './src/services/adsService';
import { preloadAppAssets } from './src/utils/preloadAppAssets';
import registerUpdates from './src/utils/registerUpdates';
import { initTelemetry } from './src/utils/telemetry';

// OAuth-Return in Expo
WebBrowser.maybeCompleteAuthSession();
initTelemetry();
registerGlobalErrorLogging();

function App() {
  useEffect(() => {
    if (__DEV__) {
      if (DevSettings?.setLiveReloadEnabled) {
        DevSettings.setLiveReloadEnabled(false);
      }
      if (DevSettings?.setHotLoadingEnabled) {
        DevSettings.setHotLoadingEnabled(true);
      }
    }
    initializeAds();
    const unregisterUpdates = registerUpdates();
    const assetTask = InteractionManager.runAfterInteractions(() => {
      preloadAppAssets();
    });

    return () => {
      if (unregisterUpdates) {
        unregisterUpdates();
      }
      if (assetTask?.cancel) {
        assetTask.cancel();
      }
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar hidden />
      <GlobalErrorBoundary>
        <AppNavigator />
      </GlobalErrorBoundary>
    </GestureHandlerRootView>
  );
}

registerRootComponent(App);

export default App;
