import { Screen } from '../../components/Screen';
import { Body, Card } from '../../components/Card';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Button, Field, SourceLink } from '../../components/Controls';
import { chapters } from '../../content/chapters';
import { useStudy } from '../../state/StudyProvider';
import { AudioControls } from './AudioProvider';

export function StudyScreen() {
  const [search, setSearch] = useState('');
  const { state } = useStudy();
  const router = useRouter();
  const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const matches = chapters.filter((c) => normalize(`${c.title} ${c.body}`).includes(normalize(search)));
  return (
    <Screen eyebrow="APRENDE A TU RITMO" title="Tu biblioteca.">
      <Body>Entender primero. Memorizar después.</Body>
      <AudioControls />
      <Card title="Libro para la conducción en Chile" description="Consulta el libro completo de CONASET. Abajo encontrarás nuestras lecciones breves de repaso, con lectura y audio."><SourceLink id="book" /></Card>
      <Field label="Buscar un tema" placeholder="Distancia, cinturón, prioridades…" value={search} onChangeText={setSearch} />
      <Body>{state.chapters.length} de {chapters.length} lecciones completadas</Body>
      {matches.map((chapter, i) => <Card key={chapter.id} title={chapter.title} description={`${state.chapters.includes(chapter.id) ? '✓ Completada' : 'Por descubrir'} · Lectura y audio`}><Button secondary label={`Abrir lección ${i + 1}`} onPress={() => router.push((`/chapter/${chapter.id}`) as never)} /></Card>)}
      {!matches.length && <Body>No encontramos ese término. Prueba con otra palabra.</Body>}
      <Card title="Señales que recordarás" description={`${state.signs.length} de 6 tarjetas aprendidas. Mira la señal, recuerda su significado y comprueba tu respuesta.`}><Button label="Practicar señales" onPress={() => router.push('/flashcards' as never)} /></Card>
      <Body>Lecciones originales de Proyecto 3X. Complementan el estudio del libro oficial.</Body>
    </Screen>
  );
}
