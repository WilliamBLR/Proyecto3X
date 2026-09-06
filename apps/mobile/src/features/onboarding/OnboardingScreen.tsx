import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { Body, Card } from '../../components/Card';
import { Button, Field, Notice } from '../../components/Controls';
import { profileSchema } from '../../domain/model';
import { useStudy } from '../../state/StudyProvider';
import { useAuth } from '../auth/AuthProvider';
import { configureReminder } from '../../lib/reminders';
import { useTheme } from '../../theme/useTheme';

export function OnboardingScreen() {
  const { state, update, sync } = useStudy();
  const { session } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const existing = state.profile;
  const [step, setStep] = useState(0);
  const [name, setName] = useState(existing?.name ?? '');
  const [commune, setCommune] = useState(existing?.commune ?? 'La Granja');
  const [unit, setUnit] = useState<'minutes' | 'tests'>(existing?.goalUnit ?? 'minutes');
  const [target, setTarget] = useState(String(existing?.dailyTarget ?? 15));
  const [reminders, setReminders] = useState(existing?.reminders ?? false);
  const [hour, setHour] = useState(String(existing?.reminderHour ?? 20));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function save() {
    setError('');
    const parsed = profileSchema.safeParse({ name, commune, licenseClass: 'B', goalUnit: unit, dailyTarget: Number(target), reminders, reminderHour: Number(hour) });
    if (!parsed.success) { setError('Revisa tu nombre, comuna, meta (1–180) y hora (0–23).'); return; }
    setBusy(true);
    try {
      const result = await configureReminder(reminders, parsed.data.reminderHour);
      await update((current) => ({ ...current, profile: { ...parsed.data, reminders: result.enabled } }));
      void sync(); router.replace('/');
    } catch { setError('No pudimos guardar la configuración. Inténtalo de nuevo.'); }
    finally { setBusy(false); }
  }
  return <Screen eyebrow={`TU PUNTO DE PARTIDA · ${step + 1}/3`} title={step === 0 ? 'Hagámoslo a tu ritmo.' : step === 1 ? 'Una meta posible.' : 'Construye el hábito.'} showTestAction={false} back={!!existing}>
    <View style={{ flexDirection: 'row', gap: 6 }}>{[0, 1, 2].map((i) => <View key={i} style={{ height: 5, flex: 1, borderRadius: 4, backgroundColor: i <= step ? colors.primary : colors.border }} />)}</View>
    {step === 0 && <>
      {!session && <Card title="Tu progreso puede acompañarte"><Body>Crea una cuenta para respaldarlo o empieza guardando solo en este dispositivo.</Body><Button label="Entrar o crear cuenta" secondary onPress={() => router.push('/account' as never)} /></Card>}
      <Field label="¿Cómo te llamamos?" value={name} onChangeText={setName} maxLength={40} autoComplete="given-name" />
      <Card title="Licencia clase B" description="Automóviles particulares. Esta primera versión está centrada en clase B; las otras clases llegarán después." />
      <Field label="Comuna donde resides y rendirás" value={commune} onChangeText={setCommune} maxLength={80} />
      <Body>Usaremos tu comuna para mostrar los tips municipales disponibles.</Body>
    </>}
    {step === 1 && <><Body>Elige una meta diaria pequeña que puedas sostener.</Body>
      <View style={{ flexDirection: 'row', gap: 10 }}><View style={{ flex: 1 }}><Button label="Minutos" secondary={unit !== 'minutes'} onPress={() => { setUnit('minutes'); setTarget('15'); }} /></View><View style={{ flex: 1 }}><Button label="Tests" secondary={unit !== 'tests'} onPress={() => { setUnit('tests'); setTarget('1'); }} /></View></View>
      <Field label={unit === 'minutes' ? 'Minutos al día' : 'Tests al día'} value={target} onChangeText={setTarget} keyboardType="number-pad" maxLength={3} />
      <Body>La meta cuenta tu tiempo activo de estudio y las prácticas completadas.</Body></>}
    {step === 2 && <><Card title="Un recordatorio amable"><Body>Si quieres, te avisaremos una vez al día. Puedes desactivarlo cuando prefieras.</Body>
      <Button label={reminders ? '✓ Recordatorio activado' : 'Activar recordatorio'} secondary={!reminders} onPress={() => setReminders(!reminders)} />
      {reminders && <Field label="Hora del recordatorio (0–23)" value={hour} onChangeText={setHour} keyboardType="number-pad" maxLength={2} />}
      <Text style={{ color: colors.muted, fontSize: 13 }}>El sistema te pedirá permiso al guardar.</Text></Card>
      <Body>{session ? 'Tus preferencias se guardarán en tu cuenta.' : 'Estudiarás como invitado. El progreso quedará en este dispositivo.'}</Body></>}
    <Notice text={error} error />
    <Button label={busy ? 'Guardando…' : step === 2 ? 'Empezar mi camino' : 'Continuar'} disabled={busy} onPress={() => {
      if (step === 0 && (!name.trim() || commune.trim().length < 2)) { setError('Escribe tu nombre y comuna para continuar.'); return; }
      if (step === 1 && (!Number.isInteger(Number(target)) || Number(target) < 1 || Number(target) > 180)) { setError('Elige una meta entre 1 y 180.'); return; }
      setError(''); if (step < 2) setStep(step + 1); else void save();
    }} />
    {step > 0 && <Button label="Anterior" secondary disabled={busy} onPress={() => { setStep(step - 1); setError(''); }} />}
  </Screen>;
}
