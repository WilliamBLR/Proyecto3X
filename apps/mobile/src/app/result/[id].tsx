import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Screen } from '../../components/Screen';
import { Body, Card } from '../../components/Card';
import { Button, SourceLink } from '../../components/Controls';
import { useStudy } from '../../state/StudyProvider';
import { questionById } from '../../content/questions';

export default function Result() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useStudy();
  const router = useRouter();
  const [onlyErrors, setOnlyErrors] = useState(true);
  const attempt = state.attempts.find((a) => a.id === id);
  if (!attempt) return <Screen eyebrow="RESULTADO" title="Resultado no disponible." showTestAction={false}><Button label="Volver a Tests" onPress={() => router.replace('/tests')} /></Screen>;
  const mistakes = attempt.questionIds.filter((qid) => attempt.answers[qid] !== questionById.get(qid)?.correct);
  const ids = onlyErrors ? mistakes : attempt.questionIds;
  return <Screen eyebrow={attempt.mode === 'simulation' ? 'SIMULACRO DE PRÁCTICA' : 'PRÁCTICA COMPLETADA'} title={`${attempt.score} de ${attempt.maxScore} puntos.`} showTestAction={false} back>
    <Card title={attempt.passed ? (attempt.mode === 'simulation' ? 'Alcanzaste el puntaje de aprobación' : 'Alcanzaste la meta de práctica') : 'Cada error te muestra qué repasar'}>
      <Body>{attempt.mode === 'simulation' ? 'Umbral del simulacro: 33/38. Este resultado no predice ni garantiza el examen municipal.' : 'Meta propia de esta práctica: 80% de aciertos.'}</Body>
      <Body>{mistakes.length} respuestas por revisar · +{attempt.score * 10} XP</Body>
    </Card>
    <Button label={onlyErrors ? 'Mostrar todas las respuestas' : 'Mostrar solo errores'} secondary onPress={() => setOnlyErrors(!onlyErrors)} />
    {onlyErrors && !mistakes.length && <Body>¡Todas correctas! Puedes revisar las explicaciones o probar otra modalidad.</Body>}
    {ids.map((qid) => {
      const q = questionById.get(qid); if (!q) return null;
      const selected = attempt.answers[qid];
      return <Card key={qid} title={`${selected === q.correct ? '✓' : '↻'} ${q.prompt}`}>
        <Body>Tu respuesta: {selected === undefined ? 'Sin responder' : q.options[selected]}</Body>
        <Body>Correcta: {q.options[q.correct]}</Body><Body>{q.explanation}</Body><SourceLink id={q.source} />
      </Card>;
    })}
    <Button label="Volver a Tests" onPress={() => router.replace('/tests')} />
    <Button label="Ver mi progreso" secondary onPress={() => router.replace('/')} />
  </Screen>;
}
