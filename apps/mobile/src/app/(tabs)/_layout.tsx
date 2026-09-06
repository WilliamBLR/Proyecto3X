import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../theme/useTheme';

export default function TabLayout() {
  const { colors } = useTheme();
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.muted,
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      tabBarItemStyle: { minHeight: 48 },
      sceneStyle: { backgroundColor: colors.background },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="study" options={{ title: 'Estudiar', tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="tests" options={{ title: 'Tests', tabBarIcon: ({ color, size }) => <Ionicons name="flash-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="exam-day" options={{ title: 'Día D', tabBarIcon: ({ color, size }) => <Ionicons name="flag-outline" color={color} size={size} /> }} />
    </Tabs>
  );
}
