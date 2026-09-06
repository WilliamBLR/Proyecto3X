import { useRef, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '../../components/Screen';
import { Body, Card } from '../../components/Card';
import { Button, Notice, SourceLink } from '../../components/Controls';
import { chapters } from '../../content/chapters';
import { useStudy } from '../../state/StudyProvider';
import { AudioControls } from '../../features/study/AudioProvider';
import { useActiveSeconds } from '../../lib/useActiveSeconds';

export default function ChapterScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const chapter = chapters.find((c) => c.id === id);
  const { state, update } = useStudy();
  const seconds = useActiveSeconds();
  const eventId = useRef(`reading-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (!chapter) return <Screen back eyebrow="BIBLIOTECA" title="Lección no encontrada" />;
  async function complete() {
    setBusy(true); setError('');
    try { await update((s) => ({ ...s, chapters: [...new Set([...s.chapters, id])], events: [...s.events.filter((e) => e.id !== eventId.current), { id: eventId.current, at: Date.now(), seconds: seconds.current }] })); }
    catch { setError('No pudimos guardar la lectura. Inténtalo de nuevo.'); }
    finally { setBusy(false); }
  }
  return <Screen back eyebrow="UNA LECCIÓN A LA VEZ" title={chapter.title}>
    <AudioControls id={chapter.id} />
    {chapter.body.split('\n\n').map((paragraph) => <Body key={paragraph}>{paragraph}</Body>)}
    <Card title="Quédate con esto" description={chapter.takeaway} />
    <Button disabled={busy} label={state.chapters.includes(id) ? '✓ Lección completada · Guardar repaso' : 'Marcar como completada · +25 XP'} onPress={() => void complete()} />
    <Notice text={error} error /><SourceLink id={chapter.source} /><SourceLink id="book" />
  </Screen>;
}
