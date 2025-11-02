// App.js
import * as WebBrowser from 'expo-web-browser';
import { registerRootComponent } from 'expo';
import AppNavigator from './src/AppNavigator';

WebBrowser.maybeCompleteAuthSession(); // für OAuth-Return in Expo

export default function App() {
  return <AppNavigator />;
}

registerRootComponent(App);
