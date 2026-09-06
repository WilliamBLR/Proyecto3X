import { Linking, Pressable, StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { sources } from '../content/sources';

export function Button({ label, onPress, secondary = false, disabled = false }: { label: string; onPress: () => void; secondary?: boolean; disabled?: boolean }) {
  const { colors } = useTheme();
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [styles.button, { backgroundColor: secondary ? colors.surface : colors.primary, borderColor: colors.primary, opacity: disabled ? 0.45 : pressed ? 0.75 : 1 }]}>
    <Text style={{ color: secondary ? colors.primary : colors.onPrimary, fontWeight: '700', fontSize: 16, textAlign: 'center' }}>{label}</Text>
  </Pressable>;
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const { colors } = useTheme();
  return <View style={{ gap: 8 }}><Text style={{ color: colors.text, fontWeight: '600', fontSize: 15 }}>{label}</Text>
    <TextInput accessibilityLabel={label} placeholderTextColor={colors.muted} {...props} style={[styles.field, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }, props.style]} /></View>;
}
export function Notice({ text, error = false }: { text: string; error?: boolean }) {
  const { colors } = useTheme();
  if (!text) return null;
  return <Text accessibilityRole={error ? 'alert' : 'text'} accessibilityLiveRegion="polite" style={{ color: error ? (colors.text === '#F3F7F8' ? '#FFB5AF' : '#A82F26') : colors.muted, fontSize: 15, lineHeight: 23 }}>{text}</Text>;
}
export function SourceLink({ id }: { id: string }) {
  const { colors } = useTheme();
  const source = sources[id as keyof typeof sources];
  if (!source) return null;
  return <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(source.url)} style={{ minHeight: 48, justifyContent: 'center' }}>
    <Text style={{ color: colors.primary, fontSize: 13, textDecorationLine: 'underline' }}>{source.title} ↗</Text>
  </Pressable>;
}
export const styles = StyleSheet.create({
  button: { borderWidth: 1, borderRadius: 16, padding: 16, minHeight: 52, justifyContent: 'center' },
  field: { borderWidth: 1, borderRadius: 14, padding: 14, minHeight: 52, fontSize: 16 },
});
