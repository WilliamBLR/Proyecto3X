import { Screen } from '../../components/Screen';
import { Body, Card } from '../../components/Card';

export function TestsScreen() {
  return (
    <Screen eyebrow="CADA INTENTO CUENTA" title="Practica con propósito." showTestAction={false}>
      <Body>Los tests estarán disponibles cuando se incorpore el banco de práctica validado.</Body>
      <Card title="Test del día" description="Próximamente · Una sesión breve para mantener el hábito." />
      <Card title="Simulacro municipal" description="Próximamente · Tiempo, preguntas y puntuación según las reglas verificadas para tu clase de licencia." />
      <Card title="Refuerza tus puntos débiles" description="Próximamente · Practica a partir de tus respuestas incorrectas. Primero necesitarás completar un test." />
    </Screen>
  );
}
