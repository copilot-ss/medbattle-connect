// App.js
import 'react-native-reanimated';
import 'react-native-gesture-handler';
import * as WebBrowser from 'expo-web-browser';
import { registerRootComponent } from 'expo';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/AppNavigator';
import GlobalErrorBoundary from './src/components/GlobalErrorBoundary';
import registerGlobalErrorLogging from './src/utils/registerGlobalErrorLogging';

// OAuth-Return in Expo
WebBrowser.maybeCompleteAuthSession();
registerGlobalErrorLogging();

function App() {
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
