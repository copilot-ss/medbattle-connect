// App.js
import 'react-native-gesture-handler';
import './src/i18n';
import * as WebBrowser from 'expo-web-browser';
import { Image as ExpoImage } from 'expo-image';
import { useEffect, useState } from 'react';
import { registerRootComponent } from 'expo';
import { AppState, DevSettings, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/AppNavigator';
import GlobalErrorBoundary from './src/components/GlobalErrorBoundary';
import registerGlobalErrorLogging from './src/utils/registerGlobalErrorLogging';
import { initializeAds } from './src/services/adsService';
import { preloadAppAssets, preloadAppFonts } from './src/utils/preloadAppAssets';
import registerUpdates from './src/utils/registerUpdates';
import { colors } from './src/styles/theme';
import { registerSupabaseAuthAppState } from './src/lib/supabaseClient';

// OAuth-Return in Expo
WebBrowser.maybeCompleteAuthSession();
registerGlobalErrorLogging();

function App() {
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadFonts = async () => {
      try {
        await preloadAppFonts();
      } catch (err) {
        if (__DEV__) {
          console.warn('Font preload failed:', err);
        }
      } finally {
        if (isMounted) {
          setFontsReady(true);
        }
      }
    };

    loadFonts();

    const configureSystemUi = async () => {
      if (Platform.OS !== 'android') {
        return;
      }
      try {
        const NavigationBar = require('expo-navigation-bar');
        await NavigationBar.setVisibilityAsync('hidden');
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
    const unregisterSupabaseAuthAppState = registerSupabaseAuthAppState();
    const unregisterUpdates = registerUpdates();
    const imageMemorySubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'background') {
        return;
      }
      ExpoImage.clearMemoryCache().catch((err) => {
        if (__DEV__) {
          console.warn('Image memory cache cleanup failed:', err);
        }
      });
    });
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
      isMounted = false;
      if (unregisterUpdates) {
        unregisterUpdates();
      }
      if (unregisterSupabaseAuthAppState) {
        unregisterSupabaseAuthAppState();
      }
      imageMemorySubscription.remove();
      if (idleHandle !== null && typeof cancelIdleCallback === 'function') {
        cancelIdleCallback(idleHandle);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  if (!fontsReady) {
    return (
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }} />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GlobalErrorBoundary>
        <AppNavigator />
      </GlobalErrorBoundary>
    </GestureHandlerRootView>
  );
}

registerRootComponent(App);

export default App;
