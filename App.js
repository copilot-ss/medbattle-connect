// App.js
import 'react-native-gesture-handler';
import * as WebBrowser from 'expo-web-browser';
import { registerRootComponent } from 'expo';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/AppNavigator';

WebBrowser.maybeCompleteAuthSession(); // für OAuth-Return in Expo

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar hidden />
      <AppNavigator />
    </GestureHandlerRootView>
  );
}

registerRootComponent(App);
