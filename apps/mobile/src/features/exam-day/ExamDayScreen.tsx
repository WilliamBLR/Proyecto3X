import { Screen } from '../../components/Screen';
import { Body, Card } from '../../components/Card';

export function ExamDayScreen() {
  return (
    <Screen eyebrow="LLEGA CON CONFIANZA" title="Tu día D.">
      <Body>Prepararemos lo importante para que puedas concentrarte en tu examen.</Body>
      <Card title="Todo en orden" description="Próximamente: checklist de documentos basado en los requisitos de tu municipalidad." />
      <Card title="Conoce los psicotécnicos" description="Próximamente: explicaciones y ejercicios de reacción, coordinación y pulso." />
      <Card title="Tu nueva etapa, en una foto" description="Consulta cuándo toman la foto en tu municipalidad y ve preparado/a para la cámara." />
    </Screen>
  );
}
