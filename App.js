import AppNavigator from './src/AppNavigator';
import { registerRootComponent } from 'expo';

export default function App() {
  return <AppNavigator />;
}

registerRootComponent(App);
