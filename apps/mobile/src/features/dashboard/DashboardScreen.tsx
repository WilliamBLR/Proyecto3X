import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/Screen';
import { Body, Card } from '../../components/Card';
import { useTheme } from '../../theme/useTheme';
import { Button, Notice } from '../../components/Controls';
import { useStudy } from '../../state/StudyProvider';
import { analytics } from '../../domain/engine';
import { questions } from '../../content/questions';

export function DashboardScreen() {
  const { colors } = useTheme();
  const { state, syncStatus, error } = useStudy();
  const router = useRouter();
  const stats = analytics(state, questions);
  const profile = state.profile;
  const goal = profile?.dailyTarget ?? 1;
  const done = profile?.goalUnit === 'tests' ? stats.todayTests : stats.todayMinutes;
  const ratio = Math.min(1, done / goal);
  return (
    <Screen eyebrow={`CLASE B · ${profile?.commune ?? 'CHILE'}`} title={`Vamos, ${profile?.name ?? 'conductor'}.`}>
      <Body>Un paso al día. Más confianza al volante.</Body>
      <Card title="Tu meta de hoy" description={`${done} de ${goal} ${profile?.goalUnit === 'tests' ? 'tests' : 'minutos activos'}`}>
        <View style={{ flexDirection: 'row', gap: 24, alignItems: 'center' }}>
          <View accessible accessibilityLabel={`Meta diaria: ${Math.round(ratio * 100)} por ciento`}>
            <Svg width={112} height={112} viewBox="0 0 112 112"><Circle cx={56} cy={56} r={46} stroke={colors.border} strokeWidth={10} fill="none" /><Circle cx={56} cy={56} r={46} stroke={colors.primary} strokeWidth={10} fill="none" strokeDasharray={`${ratio * 289} 289`} strokeLinecap="round" rotation={-90} origin="56,56" /></Svg>
            <Text style={{ position: 'absolute', top: 42, width: 112, textAlign: 'center', fontSize: 21, fontWeight: '800', color: colors.text }}>{Math.round(ratio * 100)}%</Text>
          </View>
          <View style={{ flex: 1, gap: 8 }}><Body>{stats.streak} días de racha</Body><Body>{stats.xp} XP acumulados</Body><Body>{ratio === 1 ? '¡Meta cumplida! Celebra tu avance.' : 'Tu próxima práctica cuenta.'}</Body></View>
        </View>
      </Card>
      <Card title="Así vas" description="La aprobación se calcula solo sobre tus simulacros de práctica.">
        <View style={{ flexDirection: 'row', gap: 32, flexWrap: 'wrap' }}>
          <View><Text style={{ fontSize: 32, fontWeight: '800', color: colors.text }}>{state.attempts.length}</Text><Body>Tests completados</Body></View>
          <View><Text style={{ fontSize: 32, fontWeight: '800', color: colors.text }}>{stats.passRate === null ? '—' : `${Math.round(stats.passRate * 100)}%`}</Text><Body>Aprobación · {stats.simulations} simulacros</Body></View>
        </View>
      </Card>
      <Card title="Temas por mejorar" description={stats.categories.length ? 'Errores históricos por tema. El refuerzo usa tu última respuesta a cada pregunta.' : 'Completa una práctica para descubrir qué repasar.'}>
        {stats.categories.slice(0, 3).map((c) => <View key={c.id} style={{ gap: 8 }}><Body>{c.title} · {c.errors}/{c.total} errores</Body><View style={{ height: 8, borderRadius: 8, backgroundColor: colors.border, overflow: 'hidden' }}><View style={{ height: 8, width: `${c.rate * 100}%`, backgroundColor: colors.primary }} /></View><Button secondary label="Repasar este tema" onPress={() => router.push((`/chapter/${c.id}`) as never)} /></View>)}
      </Card>
      <Card title="Últimas prácticas">
        {!state.attempts.length && <Body>Aquí encontrarás tus resultados y explicaciones.</Body>}
        {state.attempts.slice(-5).reverse().map((a) => <Button key={a.id} secondary label={`${a.mode === 'simulation' ? 'Simulacro' : a.mode === 'daily' ? 'Test del día' : 'Refuerzo'} · ${a.score}/${a.maxScore} · ${new Date(a.finishedAt).toLocaleDateString('es-CL')}`} onPress={() => router.push((`/result/${a.id}`) as never)} />)}
      </Card>
      <Notice text={error} error /><Notice text={syncStatus} /><Button secondary label="Mi cuenta y preferencias" onPress={() => router.push('/account' as never)} />
    </Screen>
  );
}
