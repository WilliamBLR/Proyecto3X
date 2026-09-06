import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';

export function Card({ title, description, children }: PropsWithChildren<{ title: string; description?: string }>) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>{title}</Text>
      {description && <Text style={[styles.body, { color: colors.muted }]}>{description}</Text>}
      {children}
    </View>
  );
}

export function Body({ children }: PropsWithChildren) {
  const { colors } = useTheme();
  return <Text style={[styles.body, { color: colors.muted }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 24, padding: 22, gap: 10 },
  title: { fontSize: 19, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 25 },
});
