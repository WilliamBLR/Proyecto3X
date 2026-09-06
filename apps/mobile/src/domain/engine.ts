import { type Attempt, type Draft, type Mode, type Question, type StudyState, categoryNames, dayKey } from './model';

export const examRules = { version: 'B-practica-2026-09', count: 35, doubleCount: 3, maxScore: 38, passScore: 33, seconds: 45 * 60 };

export function seededRandom(seed: string) {
  let state = [...seed].reduce((n, c) => Math.imul(n ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
  return () => { state += 0x6D2B79F5; let t = state; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
  return copy;
}
export function weakQuestionIds(attempts: Attempt[], bank: readonly Question[]) {
  const latest = new Map<string, boolean>();
  const byId = new Map(bank.map((q) => [q.id, q]));
  [...attempts].sort((a, b) => a.finishedAt - b.finishedAt).forEach((a) => a.questionIds.forEach((id) => {
    const q = byId.get(id); if (q) latest.set(id, a.answers[id] !== q.correct);
  }));
  return [...latest].filter(([, wrong]) => wrong).map(([id]) => id);
}
export function makeDraft(mode: Mode, bank: readonly Question[], attempts: Attempt[], id: string, now = Date.now()): Draft {
  const random = seededRandom(mode === 'daily' ? dayKey(now) : id);
  let pool = shuffle(bank, random);
  let doubles: string[] = [];
  if (mode === 'reinforcement') {
    const weak = new Set(weakQuestionIds(attempts, bank)); pool = pool.filter((q) => weak.has(q.id)).slice(0, 10);
  } else if (mode === 'simulation') {
    const eligible = pool.filter((q) => q.doubleEligible).slice(0, examRules.doubleCount);
    if (bank.length < examRules.count || eligible.length !== examRules.doubleCount) throw new Error('El banco no permite un simulacro completo.');
    doubles = eligible.map((q) => q.id);
    pool = shuffle([...eligible, ...pool.filter((q) => !doubles.includes(q.id)).slice(0, examRules.count - eligible.length)], random);
  } else pool = pool.slice(0, 10);
  if (!pool.length) throw new Error('Aún no hay errores pendientes para reforzar.');
  return { id, mode, questionIds: pool.map((q) => q.id), doubleIds: doubles, answers: {},
    startedAt: now, deadline: mode === 'simulation' ? now + examRules.seconds * 1000 : null,
    activeSeconds: 0, index: 0, day: dayKey(now) };
}
export const remainingSeconds = (draft: Draft, now: number) => draft.deadline === null ? null : Math.max(0, Math.ceil((draft.deadline - now) / 1000));
export function finishDraft(draft: Draft, bank: readonly Question[], now = Date.now()): Attempt {
  if (new Set(draft.questionIds).size !== draft.questionIds.length) throw new Error('Preguntas duplicadas.');
  const byId = new Map(bank.map((q) => [q.id, q]));
  let score = 0, maxScore = 0;
  draft.questionIds.forEach((id) => {
    const q = byId.get(id); if (!q) throw new Error('La versión del banco cambió. Inicia una práctica nueva.');
    const weight = draft.doubleIds.includes(id) ? 2 : 1;
    maxScore += weight; if (draft.answers[id] === q.correct) score += weight;
  });
  return { ...draft, finishedAt: Math.max(draft.startedAt, now), score, maxScore,
    passed: draft.mode === 'simulation' ? score >= examRules.passScore : score / maxScore >= 0.8 };
}
export function analytics(state: StudyState, bank: readonly Question[], now = Date.now()) {
  const simulations = state.attempts.filter((a) => a.mode === 'simulation');
  const categories = Object.entries(categoryNames).map(([id, title]) => {
    let total = 0, errors = 0;
    const questions = bank.filter((q) => q.category === id);
    state.attempts.forEach((a) => questions.forEach((q) => {
      if (a.questionIds.includes(q.id)) { total++; if (a.answers[q.id] !== q.correct) errors++; }
    }));
    return { id, title, total, errors, rate: total ? errors / total : 0 };
  }).filter((c) => c.errors > 0).sort((a, b) => b.rate - a.rate || b.errors - a.errors);
  const days = new Set([...state.attempts.map((a) => dayKey(a.finishedAt)), ...state.events.map((e) => dayKey(e.at))]);
  // Calendar arithmetic at UTC noon avoids Santiago daylight-saving day lengths.
  let date = new Date(`${dayKey(now)}T12:00:00Z`);
  if (!days.has(date.toISOString().slice(0, 10))) date.setUTCDate(date.getUTCDate() - 1);
  let streak = 0;
  while (days.has(date.toISOString().slice(0, 10))) { streak++; date.setUTCDate(date.getUTCDate() - 1); }
  const todayAttempts = state.attempts.filter((a) => dayKey(a.finishedAt) === dayKey(now));
  const seconds = todayAttempts.reduce((sum, a) => sum + a.activeSeconds, 0) + state.events.filter((e) => dayKey(e.at) === dayKey(now)).reduce((sum, e) => sum + e.seconds, 0);
  return { categories, streak, simulations: simulations.length,
    passRate: simulations.length ? simulations.filter((a) => a.passed).length / simulations.length : null,
    todayTests: todayAttempts.length, todayMinutes: Math.floor(seconds / 60),
    xp: state.attempts.reduce((sum, a) => sum + a.score * 10, 0) + state.chapters.length * 25 + state.signs.length * 5 };
}
