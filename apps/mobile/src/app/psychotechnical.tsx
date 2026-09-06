import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Body, Card } from '../components/Card';
import { Button, Notice } from '../components/Controls';
import { useTheme } from '../theme/useTheme';

const activities = [
  { id: 'reaction', title: 'Reacción', instruction: 'Toca el botón apenas cambie a verde. Practica anticipación y atención sin buscar una marca de aprobación oficial.', action: 'Iniciar reacción' },
  { id: 'coordination', title: 'Coordinación', instruction: 'Mantén el punto dentro del camino con movimientos suaves. El objetivo es practicar precisión, no correr.', action: 'Iniciar coordinación' },
  { id: 'pulse', title: 'Pulso', instruction: 'Sigue el recorrido sin salirte del borde. Respira y apoya el brazo para reducir movimientos innecesarios.', action: 'Iniciar pulso' },
] as const;
export default function PsychotechnicalScreen() {
  const { colors } = useTheme();
  const [active, setActive] = useState<typeof activities[number]['id'] | null>(null);
  const [started, setStarted] = useState(0);
  const [reactionGreen, setReactionGreen] = useState(false);
  const [reactionMs, setReactionMs] = useState<number | null>(null);
  const current = activities.find((a) => a.id === active);
  function start(id: typeof activities[number]['id']) { setActive(id); setStarted(Date.now()); setReactionGreen(id !== 'reaction'); setReactionMs(null); }
  return <Screen back eyebrow="PREPARACIÓN PSICOTÉCNICA" title="Practica con calma.">
    <Body>Estos ejercicios explican la lógica de las pruebas. No reemplazan la evaluación oficial ni prometen un resultado.</Body>
    {!current && activities.map((a) => <Card key={a.id} title={a.title} description={a.instruction}><Button label={a.action} onPress={() => start(a.id)} /></Card>)}
    {current && <Card title={current.title} description={current.instruction}>
      {active === 'reaction' && <><Text style={{ color: colors.text, textAlign: 'center', fontSize: 17 }}>Espera el cambio de color</Text><Pressable accessibilityRole="button" accessibilityLabel={reactionGreen ? 'Botón verde, tocar ahora' : 'Botón rojo, espera'} onPress={() => { if (!reactionGreen) return; setReactionMs(Date.now() - started); setReactionGreen(false); }} style={{ height: 140, borderRadius: 70, backgroundColor: reactionGreen ? '#2FA66A' : '#C7232C', alignItems: 'center', justifyContent: 'center', marginVertical: 20 }}><Text style={{ color: 'white', fontSize: 22, fontWeight: '800' }}>{reactionGreen ? 'TOCA' : 'ESPERA'}</Text></Pressable><Button secondary label={reactionGreen ? 'Cambiar a verde' : 'Probar otra vez'} onPress={() => { setReactionGreen(!reactionGreen); setStarted(Date.now()); setReactionMs(null); }} />{reactionMs !== null && <Notice text={`Tu tiempo de esta ronda fue ${reactionMs} ms. Compáralo solo contigo.`} />}</>}
      {active !== 'reaction' && <><View style={{ height: 190, borderRadius: 22, borderWidth: 2, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', gap: 14 }}><Text style={{ color: colors.primary, fontSize: 54 }}>⌁</Text><Text style={{ color: colors.text, textAlign: 'center' }}>Sigue el recorrido con el dedo</Text></View><Button label="Terminé esta ronda" onPress={() => setActive(null)} /></>}
      <Button secondary label="Elegir otro ejercicio" onPress={() => setActive(null)} />
    </Card>}
    <Notice text="Consulta siempre las instrucciones de tu municipalidad y del examinador." />
  </Screen>;
}
