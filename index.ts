import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';

if (__DEV__) {
  LogBox.ignoreLogs(['[expo-notifications] Error reading persisted server registration info']);
}

const App = require('./App').default as typeof import('./App').default;

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
