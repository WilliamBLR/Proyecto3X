import { z } from 'zod';

export const categoryNames = {
  convivencia: 'Convivencia vial', senales: 'Señales y prioridades',
  velocidad: 'Velocidad y distancias', seguridad: 'Seguridad del vehículo',
  conductor: 'Condiciones del conductor', normas: 'Normas y documentos',
} as const;
export type Category = keyof typeof categoryNames;
export type Question = {
  id: string; category: Category; prompt: string; options: [string, string, string];
  correct: number; explanation: string; source: string; doubleEligible?: boolean;
};
export const profileSchema = z.object({
  name: z.string().trim().min(1).max(40), licenseClass: z.literal('B'),
  commune: z.string().trim().min(2).max(80), goalUnit: z.enum(['minutes', 'tests']),
  dailyTarget: z.number().int().min(1).max(180), reminders: z.boolean(),
  reminderHour: z.number().int().min(0).max(23),
});
export const modeSchema = z.enum(['daily', 'simulation', 'reinforcement']);
export const draftSchema = z.object({
  id: z.string().min(1).max(80), mode: modeSchema, questionIds: z.array(z.string()).min(1).max(35),
  doubleIds: z.array(z.string()).max(3), answers: z.record(z.string(), z.number().int().min(0).max(2)),
  startedAt: z.number().nonnegative(), deadline: z.number().nullable(), index: z.number().int().nonnegative(),
  activeSeconds: z.number().nonnegative().max(86400), day: z.string(),
});
export const attemptSchema = draftSchema.extend({
  finishedAt: z.number().nonnegative(), score: z.number().int().nonnegative(),
  maxScore: z.number().int().positive(), passed: z.boolean(),
});
export const eventSchema = z.object({ id: z.string(), at: z.number(), seconds: z.number().min(0).max(86400) });
export const stateSchema = z.object({
  version: z.literal(1), updatedAt: z.number(), profile: profileSchema.nullable(),
  attempts: z.array(attemptSchema), draft: draftSchema.nullable(),
  chapters: z.array(z.string()), signs: z.array(z.string()), checklist: z.array(z.string()),
  events: z.array(eventSchema),
});
export type Profile = z.infer<typeof profileSchema>;
export type Mode = z.infer<typeof modeSchema>;
export type Draft = z.infer<typeof draftSchema>;
export type Attempt = z.infer<typeof attemptSchema>;
export type StudyState = z.infer<typeof stateSchema>;
export const initialState = (): StudyState => ({
  version: 1, updatedAt: 0, profile: null, attempts: [], draft: null,
  chapters: [], signs: [], checklist: [], events: [],
});

export function dayKey(timestamp: number, timezone = 'America/Santiago') {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(timestamp);
  return ['year', 'month', 'day'].map((type) => parts.find((part) => part.type === type)!.value).join('-');
}

/** Mutable preferences use the most recent edit; immutable events merge by ID. */
export function mergeStates(local: StudyState, remote: StudyState): StudyState {
  const newest = local.updatedAt > remote.updatedAt ? local : remote;
  const attempts = [...new Map([...local.attempts, ...remote.attempts].map((a) => [a.id, a])).values()]
    .sort((a, b) => a.finishedAt - b.finishedAt);
  return { ...newest, attempts,
    draft: local.draft && !attempts.some((a) => a.id === local.draft!.id) ? local.draft : null,
    events: [...new Map([...local.events, ...remote.events].map((e) => [e.id, e])).values()],
  };
}
