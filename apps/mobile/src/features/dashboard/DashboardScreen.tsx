import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { Body, Card } from '../../components/Card';
import { useTheme } from '../../theme/useTheme';

export function DashboardScreen() {
  const { colors } = useTheme();
  return (
    <Screen eyebrow="PROYECTO 3X · TU PRÓXIMA META" title={'Tu licencia empieza\naquí.'}>
      <Body>Un paso al día. Más confianza al volante.</Body>
      <View style={[styles.hero, { backgroundColor: colors.soft }]}>
        <Text style={[styles.tag, { color: colors.primary }]}>TU PUNTO DE PARTIDA</Text>
        <Text style={[styles.heroTitle, { color: colors.text }]}>Haz espacio para aprender.</Text>
        <Body>Pronto podrás elegir tu licencia, tu comuna y una meta que se adapte a ti.</Body>
      </View>
      <Card title="Tu progreso" description="Aquí verás tus avances después de completar tu primera práctica.">
        <View style={styles.metrics}>
          <View><Text style={[styles.number, { color: colors.text }]}>0</Text><Body>Tests realizados</Body></View>
          <View><Text style={[styles.number, { color: colors.text }]}>—</Text><Body>Aprobación</Body></View>
        </View>
      </Card>
      <Card title="Temas por mejorar" description="Tus respuestas nos ayudarán a identificar qué conviene repasar. Aún no hay resultados." />
      <Body>Versión inicial · Estamos preparando tu experiencia de estudio.</Body>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 26, padding: 24, gap: 14 },
  tag: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  heroTitle: { fontSize: 26, fontWeight: '700', lineHeight: 33 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 32, marginTop: 8 },
  number: { fontSize: 34, fontWeight: '800' },
});
