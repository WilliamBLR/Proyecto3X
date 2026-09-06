import { Screen } from '../../components/Screen';
import { Body, Card } from '../../components/Card';
import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Notice, SourceLink } from '../../components/Controls';
import { useStudy } from '../../state/StudyProvider';
import { useTheme } from '../../theme/useTheme';

export function ExamDayScreen() {
  const { state, update } = useStudy();
  const { colors } = useTheme();
  const router = useRouter();
  const [error, setError] = useState('');
  const commune = state.profile?.commune ?? '';
  const granja = commune.trim().toLowerCase() === 'la granja';
  const items = [
    ['identity', 'Cédula de identidad vigente'], ['education', 'Certificado que acredite escolaridad básica'],
    ['residence', `Comprobante de residencia en ${commune || 'tu comuna'}`],
    ['appointment', 'Hora y requisitos confirmados con la municipalidad'],
    ['declaration', granja ? 'Declaración simple de no consumo de drogas (confirmar formato)' : 'Formularios o declaraciones exigidos por tu municipalidad'],
    ['vehicle', 'Vehículo y documentos para la prueba práctica, según indicaciones municipales'],
  ];
  return (
    <Screen eyebrow="LLEGA CON CONFIANZA" title="Tu día D.">
      <Body>Prepara lo importante para concentrarte en tu examen.</Body>
      <Card title={`Todo en orden · ${commune}`} description={granja ? 'Orientación para primera licencia B en La Granja, mayores de 18 años. Confirma originales, copias, costo y hora antes de ir.' : 'Lista orientativa para primera licencia B, mayores de 18 años. Consulta requisitos específicos, copias y horarios en tu municipalidad.'}>
        {items.map(([id, label]) => { const key = `${commune}:${id}`; const checked = state.checklist.includes(key); return <Pressable key={id} accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={() => void update((s) => ({ ...s, checklist: checked ? s.checklist.filter((v) => v !== key) : [...s.checklist, key] })).catch(() => setError('No pudimos guardar el cambio. Inténtalo otra vez.'))} style={{ paddingVertical: 14, minHeight: 52 }}><Text style={{ color: colors.text, fontSize: 17, lineHeight: 25 }}>{checked ? '☑' : '☐'} {label}</Text></Pressable>; })}
        <Notice text={error} error /><SourceLink id={granja ? 'granja' : 'law'} />
      </Card>
      <Card title="Conoce los psicotécnicos" description="Familiarízate con la reacción, la coordinación y el pulso con ejercicios táctiles breves."><Button label="Explorar ejercicios" onPress={() => router.push('/psychotechnical' as never)} /></Card>
      <Card title="Antes de la prueba práctica" description="Ajusta asiento y espejos, usa el cinturón y observa antes de iniciar cada maniobra. Escucha las instrucciones del examinador y pide que las repita si no las comprendiste." />
      <Card title="Tu nueva etapa, en una foto" description="¡Ve preparado/a para la cámara! Al aprobar empieza una nueva etapa. Consulta si toman la foto inmediatamente o en otro momento en tu municipalidad." />
    </Screen>
  );
}
