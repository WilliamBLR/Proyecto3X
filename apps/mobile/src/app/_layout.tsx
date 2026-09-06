import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTheme } from '../theme/useTheme';
import { AuthProvider } from '../features/auth/AuthProvider';
import { StudyProvider, useStudy } from '../state/StudyProvider';
import { ActivityIndicator, Text, View } from 'react-native';
import { AudioProvider } from '../features/study/AudioProvider';

export default function RootLayout() {
  return <SafeAreaProvider><AuthProvider><StudyProvider><AudioProvider><Navigation /></AudioProvider></StudyProvider></AuthProvider></SafeAreaProvider>;
}

function Navigation() {
  const { colors, isDark } = useTheme();
  const { ready, error } = useStudy();
  if (!ready) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20, backgroundColor: colors.background }}><ActivityIndicator color={colors.primary} /><Text style={{ color: colors.text }}>{error || 'Preparando tu camino…'}</Text></View>;
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
