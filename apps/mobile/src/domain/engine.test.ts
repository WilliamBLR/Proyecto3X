import { describe, expect, it } from 'vitest';
import { questions } from '../content/questions';
import { analytics, finishDraft, makeDraft, remainingSeconds, weakQuestionIds } from './engine';
import { dayKey, initialState, mergeStates } from './model';

const now = Date.parse('2026-09-07T15:00:00Z');
describe('motor de práctica', () => {
  it('genera 35 preguntas únicas y exactamente tres dobles elegibles', () => {
    const draft = makeDraft('simulation', questions, [], 'sim-1', now);
    expect(new Set(draft.questionIds).size).toBe(35);
    expect(draft.doubleIds).toHaveLength(3);
    expect(draft.doubleIds.every((id) => questions.find((q) => q.id === id)?.doubleEligible)).toBe(true);
    draft.answers = Object.fromEntries(questions.map((q) => [q.id, q.correct]));
    expect(finishDraft(draft, questions, now + 1000)).toMatchObject({ score: 38, maxScore: 38, passed: true });
  });
  it('respeta el corte de 33/38 y considera omisiones como errores', () => {
    const draft = makeDraft('simulation', questions, [], 'sim-2', now);
    draft.answers = Object.fromEntries(questions.map((q) => [q.id, q.correct]));
    const singles = draft.questionIds.filter((id) => !draft.doubleIds.includes(id));
    delete draft.answers[draft.doubleIds[0]];
    singles.slice(0, 3).forEach((id) => delete draft.answers[id]);
    expect(finishDraft(draft, questions)).toMatchObject({ score: 33, passed: true });
    delete draft.answers[singles[3]];
    expect(finishDraft(draft, questions)).toMatchObject({ score: 32, passed: false });
  });
  it('mantiene el test diario estable para el mismo día de Santiago', () => {
    const a = makeDraft('daily', questions, [], 'one', now);
    const b = makeDraft('daily', questions, [], 'two', now + 3600000);
    expect(a.questionIds).toEqual(b.questionIds);
    expect(a.questionIds).not.toEqual(makeDraft('daily', questions, [], 'three', now + 86400000).questionIds);
  });
  it('no reinicia el tiempo al restaurar y llega a cero tras expirar', () => {
    const draft = makeDraft('simulation', questions, [], 'timed', now);
    const restored = JSON.parse(JSON.stringify(draft));
    expect(remainingSeconds(restored, now + 120000)).toBe(2580);
    expect(remainingSeconds(restored, now + 2800000)).toBe(0);
  });
  it('el refuerzo elimina una pregunta corregida en un intento posterior', () => {
    const draft = makeDraft('daily', questions, [], 'wrong', now);
    const first = finishDraft(draft, questions, now + 1000);
    const id = draft.questionIds[0];
    const second = finishDraft({ ...draft, id: 'corrected', answers: { [id]: questions.find((q) => q.id === id)!.correct } }, questions, now + 2000);
    expect(weakQuestionIds([second, first], questions)).not.toContain(id);
    expect(() => makeDraft('reinforcement', questions, [], 'empty', now)).toThrow();
  });
});
describe('progreso', () => {
  it('fusiona intentos sin duplicarlos y descarta un borrador ya finalizado', () => {
    const draft = makeDraft('daily', questions, [], 'same', now);
    const attempt = finishDraft(draft, questions, now + 1000);
    const local = { ...initialState(), draft, attempts: [attempt] };
    const remote = { ...initialState(), attempts: [attempt] };
    expect(mergeStates(local, remote).attempts).toHaveLength(1);
    expect(mergeStates(local, remote).draft).toBeNull();
  });
  it('no inventa aprobación cuando no hay simulacros', () => {
    expect(analytics(initialState(), questions, now)).toMatchObject({ passRate: null, streak: 0, xp: 0 });
  });
  it('calcula rachas por día calendario, incluyendo el cambio de horario chileno', () => {
    const state = { ...initialState(), events: [0, 1, 2].map((offset) => ({ id: String(offset), at: now - offset * 86400000, seconds: 60 })) };
    expect(analytics(state, questions, now).streak).toBe(3);
    expect(dayKey(Date.parse('2026-09-07T02:00:00Z'))).toBe('2026-09-06');
  });
  it('el banco tiene alternativas y fuentes válidas', () => {
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
    for (const q of questions) { expect(q.options).toHaveLength(3); expect(q.correct).toBeLessThan(3); expect(q.explanation.length).toBeGreaterThan(10); }
  });
});
