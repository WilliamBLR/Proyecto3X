import { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';
import { Screen } from '../components/Screen';
import { Body, Card } from '../components/Card';
import { Button, Notice, SourceLink } from '../components/Controls';
import { signs } from '../content/signs';
import { useStudy } from '../state/StudyProvider';
import { useTheme } from '../theme/useTheme';
import { useActiveSeconds } from '../lib/useActiveSeconds';

function Sign({ shape }: { shape: typeof signs[number]['shape'] }) {
  const red = '#C7232C';
  return <Svg width={200} height={200} viewBox="0 0 200 200" aria-hidden>
    {shape === 'stop' ? <><Polygon points="60,10 140,10 190,60 190,140 140,190 60,190 10,140 10,60" fill={red} stroke="white" strokeWidth={5} /><SvgText x={100} y={115} textAnchor="middle" fill="white" fontSize={43} fontWeight="bold">PARE</SvgText></>
      : shape === 'yield' ? <><Polygon points="12,20 188,20 100,180" fill="white" stroke={red} strokeWidth={16} strokeLinejoin="round" /><SvgText x={100} y={75} textAnchor="middle" fill="#121212" fontSize={20} fontWeight="bold">CEDA</SvgText><SvgText x={100} y={102} textAnchor="middle" fill="#121212" fontSize={18} fontWeight="bold">EL PASO</SvgText></>
      : shape === 'entry' ? <><Circle cx={100} cy={100} r={86} fill={red} /><Rect x={42} y={83} width={116} height={34} fill="white" /></>
      : shape === 'right' ? <><Circle cx={100} cy={100} r={86} fill="#165CA6" /><Path d="M45 84 H113 V51 L164 100 L113 149 V116 H45 Z" fill="white" /></>
      : <><Circle cx={100} cy={100} r={84} fill="white" stroke={red} strokeWidth={14} /><SvgText x={100} y={125} textAnchor="middle" fill="#151515" fontSize={72} fontWeight="bold">{shape === 'speed' ? '50' : 'E'}</SvgText>{shape === 'parking' && <Path d="M40 40 L160 160" stroke={red} strokeWidth={14} />}</>}
  </Svg>;
}
export default function FlashcardsScreen() {
  const { state, update } = useStudy();
  const { colors } = useTheme();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const seconds = useActiveSeconds();
  const eventId = useRef(`signs-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const sign = signs[index];
  async function mark(known: boolean) {
    setBusy(true); setError('');
    try {
      await update((s) => ({ ...s, signs: known ? [...new Set([...s.signs, sign.id])] : s.signs.filter((id) => id !== sign.id), events: [...s.events.filter((e) => e.id !== eventId.current), { id: eventId.current, at: Date.now(), seconds: seconds.current }] }));
      setIndex((index + 1) % signs.length); setFlipped(false);
    } catch { setError('No pudimos guardar esta tarjeta. Inténtalo de nuevo.'); }
    finally { setBusy(false); }
  }
  return <Screen back eyebrow={`TARJETA ${index + 1} DE ${signs.length}`} title="Reconoce el camino.">
    <Body>{state.signs.length} aprendidas · Toca la tarjeta para comprobar tu respuesta.</Body>
    <Pressable accessibilityRole="button" accessibilityLabel={flipped ? `${sign.name}. ${sign.meaning}` : `Señal ${index + 1}. Mostrar significado`} onPress={() => setFlipped(!flipped)} style={{ minHeight: 310, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20, borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
      <Sign shape={sign.shape} />{flipped ? <><Text style={{ color: colors.text, fontWeight: '800', fontSize: 22 }}>{sign.name}</Text><Body>{sign.meaning}</Body></> : <Body>¿Qué te indica esta señal?</Body>}
    </Pressable>
    {flipped && <><Button disabled={busy} label="La sabía · Aprendida" onPress={() => void mark(true)} /><Button disabled={busy} secondary label="Necesito repasarla" onPress={() => void mark(false)} /></>}
    <View style={{ flexDirection: 'row', gap: 12 }}><View style={{ flex: 1 }}><Button secondary label="Anterior" onPress={() => { setIndex((index + signs.length - 1) % signs.length); setFlipped(false); }} /></View><View style={{ flex: 1 }}><Button secondary label="Siguiente" onPress={() => { setIndex((index + 1) % signs.length); setFlipped(false); }} /></View></View>
    <Notice text={error} error /><Card title="Recuerda el contexto" description="Ilustraciones de estudio simplificadas. Consulta también las señales y demarcaciones del libro completo." /><SourceLink id="book" />
  </Screen>;
}
