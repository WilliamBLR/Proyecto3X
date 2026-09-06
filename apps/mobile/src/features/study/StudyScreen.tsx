import { Screen } from '../../components/Screen';
import { Body, Card } from '../../components/Card';

export function StudyScreen() {
  return (
    <Screen eyebrow="APRENDE A TU RITMO" title="Tu biblioteca.">
      <Body>Entender primero. Memorizar después.</Body>
      <Card title="Libro del conductor" description="Próximamente: capítulos organizados y búsqueda para encontrar justo lo que necesitas repasar." />
      <Card title="Aprende escuchando" description="Próximamente: audio por capítulo con controles de reproducción y continuidad en segundo plano." />
      <Card title="Señales que recordarás" description="Próximamente: tarjetas visuales para practicar señales de tránsito." />
      <Body>El material estará disponible después de su revisión y validación de fuentes.</Body>
    </Screen>
  );
}
