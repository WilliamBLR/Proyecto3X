import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/Screen';
import { Body, Card } from '../../components/Card';
import { Button, Notice, SourceLink } from '../../components/Controls';
import { useStudy } from '../../state/StudyProvider';
import { dayKey, type Mode } from '../../domain/model';
import { makeDraft, weakQuestionIds } from '../../domain/engine';
import { questions } from '../../content/questions';

export function TestsScreen() {
  const { state, update } = useStudy();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const daily = state.attempts.find((a) => a.mode === 'daily' && a.day === dayKey(Date.now()));
  const weakCount = weakQuestionIds(state.attempts, questions).length;
  async function start(mode: Mode) {
    if (busy) return; setBusy(true); setError('');
    try {
      const draft = makeDraft(mode, questions, state.attempts, `${Date.now()}-${Math.random().toString(36).slice(2)}`);
      await update((current) => ({ ...current, draft: current.draft ?? draft })); router.push('/quiz' as never);
    } catch (e) { setError(e instanceof Error ? e.message : 'No pudimos iniciar el test.'); }
    finally { setBusy(false); }
  }
  return (
    <Screen eyebrow="CADA INTENTO CUENTA" title="Practica con propósito." showTestAction={false}>
      <Body>42 preguntas de práctica propias, con explicación. No son preguntas oficiales ni una reproducción del banco de CONASET.</Body>
      {state.draft && <Card title="Tienes una práctica en curso" description={state.draft.deadline ? 'El tiempo del simulacro continúa aunque salgas de la app.' : 'Tus respuestas están guardadas.'}>
        <Button label="Retomar práctica" onPress={() => router.push('/quiz' as never)} />
        {!confirmDiscard ? <Button label="Descartar práctica" secondary onPress={() => setConfirmDiscard(true)} /> : <>
          <Body>Se descartarán las respuestas de esta práctica. Tu historial anterior se conserva.</Body>
          <Button label="Sí, descartar" secondary onPress={() => void update((s) => ({ ...s, draft: null })).then(() => setConfirmDiscard(false)).catch(() => setError('No se pudo descartar.'))} />
          <Button label="Conservar" secondary onPress={() => setConfirmDiscard(false)} />
        </>}
      </Card>}
      <Card title="Test del día" description="10 preguntas · Sin límite de tiempo · Meta de práctica: 80%">
        <Button label={daily ? 'Ver mi resultado de hoy' : 'Empezar test del día'} disabled={busy || (!!state.draft && !daily)} onPress={() => daily ? router.push((`/result/${daily.id}`) as never) : void start('daily')} />
      </Card>
      <Card title="Simulacro clase B" description="35 preguntas · 3 dobles · 38 puntos · Aprobación desde 33">
        <Body>Sesión de práctica de 45 minutos. Reproduce la cantidad y puntuación publicadas; la distribución temática de este banco es propia.</Body>
        <Button label="Empezar simulacro" disabled={busy || !!state.draft} onPress={() => void start('simulation')} />
        <SourceLink id="exam" />
      </Card>
      <Card title="Refuerza tus puntos débiles" description={weakCount ? `${weakCount} preguntas por reforzar · Hasta 10 por sesión` : 'Completa una práctica para identificar qué necesitas reforzar.'}>
        <Button label="Practicar mis errores" disabled={busy || !!state.draft || !weakCount} onPress={() => void start('reinforcement')} />
      </Card>
      <Notice text={error} error />
    </Screen>
  );
}
