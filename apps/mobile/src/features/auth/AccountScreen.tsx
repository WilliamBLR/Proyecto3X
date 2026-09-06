import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/Screen';
import { Body, Card } from '../../components/Card';
import { Button, Field, Notice } from '../../components/Controls';
import { useAuth } from './AuthProvider';
import { useStudy } from '../../state/StudyProvider';
import { friendlyAuthError, redirectUrl, requireSupabase, signInGoogle } from './service';
import { configureReminder } from '../../lib/reminders';

export function AccountScreen() {
  const { session, recovering, clearRecovery } = useAuth();
  const { state, syncStatus, sync } = useStudy();
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  async function action(fn: () => Promise<void>) {
    setBusy(true); setError(''); setMessage('');
    try { await fn(); } catch (e) { setError(friendlyAuthError(e)); } finally { setBusy(false); }
  }
  async function submit() {
    const client = requireSupabase();
    if (recovering) {
      if (password.length < 8) throw new Error('Usa una contraseña de al menos 8 caracteres.');
      const { error: e } = await client.auth.updateUser({ password }); if (e) throw e;
      clearRecovery(); setPassword(''); setMessage('Contraseña actualizada.'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) throw new Error('Escribe un correo válido.');
    if (mode === 'reset') {
      const { error: e } = await client.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${redirectUrl()}?recovery=1` });
      if (e) throw e; setMessage('Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.'); return;
    }
    if (password.length < 8) throw new Error('Usa una contraseña de al menos 8 caracteres.');
    if (mode === 'signup') {
      const { error: e } = await client.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: redirectUrl() } });
      if (e) throw e; setPassword(''); setMessage('Revisa tu correo para confirmar la cuenta. Abre el enlace en este mismo dispositivo.');
    } else {
      const { error: e } = await client.auth.signInWithPassword({ email: email.trim(), password });
      if (e) throw e; setPassword('');
    }
  }
  return <Screen eyebrow="TU CUENTA" title={recovering ? 'Una contraseña nueva.' : session ? 'Tu progreso va contigo.' : 'Sigamos tu camino.'} showTestAction={false} back>
    {session && !recovering ? <>
      <Card title={state.profile?.name ?? 'Tu cuenta'} description={session.user.email ?? 'Sesión iniciada'}><Notice text={syncStatus} /><Button label="Respaldar ahora" secondary onPress={() => void sync()} /></Card>
      <Button label={state.profile ? 'Editar comuna y meta' : 'Configurar mi estudio'} onPress={() => router.push('/onboarding' as never)} />
      <Button label="Volver a estudiar" secondary disabled={!state.profile} onPress={() => router.replace('/')} />
      <Button label="Cerrar sesión" secondary disabled={busy} onPress={() => void action(async () => {
        await configureReminder(false); const { error: e } = await requireSupabase().auth.signOut({ scope: 'local' }); if (e) throw e;
        router.replace('/onboarding' as never);
      })} />
      <Body>El progreso de invitado y el de tu cuenta se mantienen separados. Cerrar sesión no elimina tu respaldo.</Body>
    </> : <>
      {!recovering && <><Body>Respalda tus resultados y recupera tu avance al volver a entrar.</Body>
        <Field label="Correo electrónico" value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" />
      </>}
      {(recovering || mode !== 'reset') && <Field label={recovering ? 'Nueva contraseña' : 'Contraseña'} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoComplete={mode === 'signup' || recovering ? 'new-password' : 'current-password'} />}
      <Button disabled={busy} label={busy ? 'Un momento…' : recovering ? 'Guardar contraseña' : mode === 'signup' ? 'Crear cuenta' : mode === 'reset' ? 'Enviar enlace' : 'Entrar con correo'} onPress={() => void action(submit)} />
      {!recovering && <>
        <Button label="Continuar con Google" secondary disabled={busy || process.env.EXPO_PUBLIC_GOOGLE_AUTH_ENABLED !== 'true'} onPress={() => void action(signInGoogle)} />
        {process.env.EXPO_PUBLIC_GOOGLE_AUTH_ENABLED !== 'true' && <Notice text="Google está pendiente de habilitación. Puedes usar correo o estudiar sin cuenta." />}
        <Button label={mode === 'signup' ? 'Ya tengo cuenta' : 'Crear una cuenta con correo'} secondary disabled={busy} onPress={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); setMessage(''); }} />
        <Button label={mode === 'reset' ? 'Volver al acceso' : 'Olvidé mi contraseña'} secondary disabled={busy} onPress={() => { setMode(mode === 'reset' ? 'login' : 'reset'); setError(''); setMessage(''); }} />
        <Button label="Estudiar sin cuenta" secondary onPress={() => router.replace((state.profile ? '/' : '/onboarding') as never)} />
      </>}
    </>}
    <Notice text={message} /><Notice text={error} error />
  </Screen>;
}
