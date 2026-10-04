import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { PushNotificationProvider } from './src/components/PushNotificationProvider';
import { OfflineBanner } from './src/components/OfflineBanner';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PushNotificationProvider>
          <View style={{ flex: 1 }}>
            <RootNavigator />
            <OfflineBanner />
          </View>
          <StatusBar style="dark" />
        </PushNotificationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
