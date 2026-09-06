import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/Screen';
import { Body, Card } from '../../components/Card';
import { Button, Notice } from '../../components/Controls';
import { useStudy } from '../../state/StudyProvider';
import { categoryNames } from '../../domain/model';
import { finishDraft, remainingSeconds } from '../../domain/engine';
import { questionById, questions } from '../../content/questions';
import { useTheme } from '../../theme/useTheme';

export function QuizScreen() {
  const { state, update } = useStudy();
  const draft = state.draft;
  const { colors } = useTheme();
  const router = useRouter();
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const finishing = useRef(false);
  const pendingSeconds = useRef(0);
  const id = draft?.id;
  const finish = useCallback(async () => {
    if (!id || finishing.current) return;
    finishing.current = true; setBusy(true); setError('');
    const extraSeconds = pendingSeconds.current; pendingSeconds.current = 0;
    try {
      await update((current) => {
        if (!current.draft || current.draft.id !== id) return current;
        const attempt = finishDraft({ ...current.draft, activeSeconds: current.draft.activeSeconds + extraSeconds }, questions);
        return { ...current, draft: null, attempts: current.attempts.some((a) => a.id === id) ? current.attempts : [...current.attempts, attempt] };
      });
      router.replace((`/result/${id}`) as never);
    } catch (e) { setError(e instanceof Error ? e.message : 'No pudimos finalizar.'); }
    finally { finishing.current = false; setBusy(false); }
  }, [id, router, update]);
  useEffect(() => {
    if (!id) return;
    let last = Date.now();
    let active = AppState.currentState === 'active';
    const subscription = AppState.addEventListener('change', (status) => { active = status === 'active'; last = Date.now(); setNow(last); });
    const timer = setInterval(() => {
      const time = Date.now(); setNow(time);
      if (active) pendingSeconds.current += Math.min(2, Math.max(0, (time - last) / 1000));
      last = time;
      if (pendingSeconds.current >= 5) {
        const seconds = pendingSeconds.current; pendingSeconds.current = 0;
        void update((current) => current.draft?.id === id ? { ...current, draft: { ...current.draft, activeSeconds: current.draft.activeSeconds + seconds } } : current).catch(() => setError('No se pudo guardar el avance.'));
      }
    }, 1000);
    return () => { clearInterval(timer); subscription.remove(); };
  }, [id, update]);
  const remaining = draft ? remainingSeconds(draft, now) : null;
  useEffect(() => { if (remaining === 0) void finish(); }, [finish, remaining]);
  if (busy) return <Screen eyebrow="TU PRÁCTICA" title="Guardando resultado…" showTestAction={false}><Body>Un momento, estamos preparando la revisión.</Body></Screen>;
  if (!draft) return <Screen eyebrow="TU PRÁCTICA" title="Elige tu siguiente paso." showTestAction={false}><Notice text={error} error /><Button label="Ir a Tests" onPress={() => router.replace('/tests')} /></Screen>;
  const index = Math.min(draft.index, draft.questionIds.length - 1);
  const question = questionById.get(draft.questionIds[index]);
  if (!question) return <Screen eyebrow="TU PRÁCTICA" title="El banco cambió." showTestAction={false}><Button label="Volver a Tests" onPress={() => router.replace('/tests')} /></Screen>;
  const count = Object.keys(draft.answers).filter((answerId) => draft.questionIds.includes(answerId)).length;
  async function answer(choice: number) {
    setError('');
    try { await update((current) => {
      if (!current.draft || current.draft.id !== id || remainingSeconds(current.draft, Date.now()) === 0) return current;
      return { ...current, draft: { ...current.draft, answers: { ...current.draft.answers, [question!.id]: choice } } };
    }); } catch { setError('No se pudo guardar la respuesta. Inténtalo de nuevo.'); }
  }
  const go = (next: number) => void update((current) => current.draft && current.draft.id === id ? { ...current, draft: { ...current.draft, index: next } } : current).then(() => setConfirm(false)).catch(() => setError('No se pudo cambiar de pregunta.'));
  return <Screen eyebrow={`PRÁCTICA · ${index + 1} DE ${draft.questionIds.length}`} title={categoryNames[question.category]} showTestAction={false}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Body>{count} respondidas</Body><Text accessibilityLabel={remaining === null ? 'Sin límite de tiempo' : `${Math.floor(remaining / 60)} minutos ${remaining % 60} segundos restantes`} style={{ color: colors.primary, fontSize: 20, fontWeight: '800' }}>{remaining === null ? 'A tu ritmo' : `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`}</Text></View>
    <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: draft.questionIds.length, now: count }} style={{ height: 6, borderRadius: 4, backgroundColor: colors.border }}><View style={{ height: 6, borderRadius: 4, width: `${count / draft.questionIds.length * 100}%`, backgroundColor: colors.primary }} /></View>
    <Card title={question.prompt}>{draft.doubleIds.includes(question.id) && <Notice text="Esta pregunta vale 2 puntos." />}</Card>
    {question.options.map((option, choice) => <Pressable key={option} accessibilityRole="radio" accessibilityState={{ checked: draft.answers[question.id] === choice, disabled: remaining === 0 }} disabled={remaining === 0} onPress={() => void answer(choice)}
      style={{ minHeight: 64, padding: 18, borderRadius: 18, borderWidth: 2, borderColor: draft.answers[question.id] === choice ? colors.primary : colors.border, backgroundColor: draft.answers[question.id] === choice ? colors.soft : colors.surface }}>
      <Text style={{ color: colors.text, fontSize: 17, lineHeight: 25 }}>{String.fromCharCode(65 + choice)}. {option}</Text>
    </Pressable>)}
    <Notice text={error} error />
    <View style={{ flexDirection: 'row', gap: 10 }}><View style={{ flex: 1 }}><Button label="Anterior" secondary disabled={index === 0} onPress={() => go(index - 1)} /></View><View style={{ flex: 1 }}><Button label={index === draft.questionIds.length - 1 ? 'Revisar entrega' : 'Siguiente'} onPress={() => index === draft.questionIds.length - 1 ? setConfirm(true) : go(index + 1)} /></View></View>
    {!confirm ? <Button label="Finalizar práctica" secondary onPress={() => setConfirm(true)} /> : <Card title="¿Entregamos tus respuestas?" description={count < draft.questionIds.length ? `${draft.questionIds.length - count} preguntas sin responder contarán como incorrectas.` : 'Ya respondiste todas las preguntas.'}><Button label="Entregar y ver resultado" onPress={() => void finish()} /><Button label="Seguir revisando" secondary onPress={() => setConfirm(false)} /></Card>}
    <Button label="Guardar y salir" secondary onPress={() => router.replace('/tests')} />
    {draft.deadline && <Notice text="El reloj continúa al salir o bloquear el teléfono. Al agotarse el tiempo se entregan las respuestas guardadas." />}
  </Screen>;
}
