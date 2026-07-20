import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { PushNotificationProvider } from './src/components/PushNotificationProvider';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PushNotificationProvider>
          <RootNavigator />
          <StatusBar style="dark" />
        </PushNotificationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
