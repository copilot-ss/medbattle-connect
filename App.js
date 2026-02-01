// App.js
import 'react-native-gesture-handler';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { registerRootComponent } from 'expo';
import { StatusBar, DevSettings, Platform } from 'react-native';
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
    const configureSystemUi = async () => {
      if (Platform.OS !== 'android') {
        return;
      }
      try {
        const NavigationBar = require('expo-navigation-bar');
        await NavigationBar.setBehaviorAsync('overlay-swipe');
        await NavigationBar.setVisibilityAsync('hidden');
        await NavigationBar.setBackgroundColorAsync('#000000');
      } catch (err) {
        if (__DEV__) {
          console.warn('NavigationBar update failed:', err);
        }
      }
    };

    configureSystemUi();

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
    let idleHandle = null;
    let timeoutId = null;
    if (typeof requestIdleCallback === 'function') {
      idleHandle = requestIdleCallback(() => {
        preloadAppAssets();
      }, { timeout: 1500 });
    } else {
      timeoutId = setTimeout(() => {
        preloadAppAssets();
      }, 0);
    }

    return () => {
      if (unregisterUpdates) {
        unregisterUpdates();
      }
      if (idleHandle !== null && typeof cancelIdleCallback === 'function') {
        cancelIdleCallback(idleHandle);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
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
