// App.js
import * as WebBrowser from 'expo-web-browser';
WebBrowser.maybeCompleteAuthSession(); // wichtig für OAuth-Return in Expo

import { registerRootComponent } from 'expo';
import AppNavigator from './src/AppNavigator';

// (optional) wenn du Gesten/Navigation nutzt und es nicht schon in AppNavigator passiert
// import 'react-native-gesture-handler';

export default function App() {
  return <AppNavigator />;
}

registerRootComponent(App);
