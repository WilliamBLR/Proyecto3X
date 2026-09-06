import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { initialState, type StudyState } from './model';
import { finishDraft, makeDraft } from './engine';
import { questions } from '../content/questions';

const a = '00000000-0000-0000-0000-000000000001';
const b = '00000000-0000-0000-0000-000000000002';
let db: PGlite;
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
    insert into auth.users values ('${a}'), ('${b}');`);
  for (const file of ['202609060001_create_profiles.sql', '202609060002_study_progress.sql']) {
    await db.exec(readFileSync(resolve('../../supabase/migrations', file), 'utf8'));
  }
}, 30000);
afterAll(async () => { await db?.close(); });
async function asUser(id: string) {
  await db.exec(`reset role; set role authenticated; select set_config('request.jwt.claim.sub', '${id}', false);`);
}
async function sync(state: StudyState) {
  return (await db.query<{ state: StudyState }>('select public.sync_study_state($1::jsonb) as state', [JSON.stringify(state)])).rows[0].state;
}
describe('PostgreSQL y aislamiento por usuario', () => {
  it('corrige el puntaje en servidor, fusiona idempotentemente y bloquea escritura directa', async () => {
    await asUser(a);
    const attempt = finishDraft(makeDraft('daily', questions, [], 'test-a', 1000), questions, 2000);
    const state = { ...initialState(), updatedAt: 3000, attempts: [{ ...attempt, score: 999, passed: true }] };
    const first = await sync(state);
    expect(first.attempts[0].score).toBe(0);
    expect((await sync(state)).attempts).toHaveLength(1);
    await expect(db.query('update public.study_states set state = $1', ['{}'])).rejects.toThrow();
  });
  it('B no puede ver A, aunque conozca su ID', async () => {
    await asUser(b);
    expect((await db.query('select * from public.study_states where user_id = $1', [a])).rows).toHaveLength(0);
    const result = await sync(initialState());
    expect(result.attempts).toHaveLength(0);
    expect((await db.query('select user_id from public.study_states')).rows).toEqual([{ user_id: b }]);
  });
  it('rechaza preguntas inventadas y anónimos', async () => {
    await asUser(a);
    const attempt = finishDraft(makeDraft('daily', questions, [], 'invalid', 1000), questions, 2000);
    attempt.questionIds[0] = 'inventada';
    await expect(sync({ ...initialState(), attempts: [attempt] })).rejects.toThrow('Unknown question');
    await db.exec('reset role; set role anon;');
    await expect(sync(initialState())).rejects.toThrow();
    await expect(db.query('select * from public.study_states')).rejects.toThrow();
  });
  it('el banco del servidor coincide con las respuestas de práctica', async () => {
    await db.exec('reset role;');
    const result = await db.query<{ id: string; correct: number; double_eligible: boolean }>('select * from private.question_keys order by id');
    expect(result.rows).toEqual(questions.map((q) => ({ id: q.id, correct: q.correct, double_eligible: !!q.doubleEligible })));
  });
});
