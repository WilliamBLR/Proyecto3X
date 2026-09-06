import type { PropsWithChildren } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../theme/useTheme';

type Props = PropsWithChildren<{ title: string; eyebrow: string; showTestAction?: boolean; back?: boolean }>;

export function Screen({ title, eyebrow, showTestAction = true, back = false, children }: Props) {
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.page, { backgroundColor: colors.background }]}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        {back && <Pressable accessibilityRole="button" onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={{ minHeight: 48, justifyContent: 'center' }}><Text style={{ color: colors.primary, fontWeight: '700' }}>← Volver</Text></Pressable>}
        <Text style={[styles.eyebrow, { color: colors.primary }]}>{eyebrow}</Text>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>{title}</Text>
        {children}
      </ScrollView>
      {showTestAction && (
        <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <Pressable accessibilityRole="button" accessibilityHint="Abre las modalidades de práctica"
            onPress={() => router.navigate('/tests')}
            style={({ pressed }) => [styles.action, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}>
            <Text style={[styles.actionText, { color: colors.onPrimary }]}>Empezar Test →</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { padding: 24, gap: 18, maxWidth: 720, width: '100%', alignSelf: 'center' },
  eyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 2, marginTop: 12 },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -1, marginBottom: 6 },
  footer: { padding: 16, borderTopWidth: 1 },
  action: { minHeight: 54, borderRadius: 18, padding: 16, alignItems: 'center', width: '100%', maxWidth: 672, alignSelf: 'center' },
  actionText: { fontSize: 16, fontWeight: '700' },
});
