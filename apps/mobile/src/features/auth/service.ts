import { Platform } from 'react-native';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { getSupabase } from '../../lib/supabase';

WebBrowser.maybeCompleteAuthSession();
export const redirectUrl = () => makeRedirectUri({ scheme: 'proyecto3x', path: 'auth/callback' });
export function requireSupabase() {
  const client = getSupabase(); if (!client) throw new Error('La conexión de cuentas aún no está configurada. Puedes estudiar en este dispositivo.');
  return client;
}
const exchanges = new Map<string, Promise<void>>();
export function completeAuth(code: string) {
  if (!exchanges.has(code)) exchanges.set(code, (async () => {
    const { error } = await requireSupabase().auth.exchangeCodeForSession(code);
    if (error) { exchanges.delete(code); throw error; }
  })());
  return exchanges.get(code)!;
}
export async function signInGoogle() {
  const callback = redirectUrl();
  const { data, error } = await requireSupabase().auth.signInWithOAuth({ provider: 'google', options: { redirectTo: callback, skipBrowserRedirect: true } });
  if (error) throw error;
  if (Platform.OS === 'web') { window.location.assign(data.url); return; }
  const result = await WebBrowser.openAuthSessionAsync(data.url, callback);
  if (result.type === 'success') {
    const url = new URL(result.url);
    const code = url.searchParams.get('code');
    if (code) await completeAuth(code);
    else throw new Error(url.searchParams.get('error_description') ?? 'No se pudo completar el acceso.');
  }
}
export function friendlyAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : 'No se pudo completar la operación.';
  if (/invalid login/i.test(message)) return 'Correo o contraseña incorrectos.';
  if (/email not confirmed/i.test(message)) return 'Revisa tu correo y confirma la cuenta antes de entrar.';
  if (/rate limit|too many/i.test(message)) return 'Hubo varios intentos seguidos. Espera unos minutos y vuelve a intentar.';
  if (/fetch|network/i.test(message)) return 'No hay conexión con el servicio. Revisa tu conexión y vuelve a intentar.';
  if (/provider.*enabled|unsupported provider/i.test(message)) return 'Google aún no está habilitado. Puedes entrar con correo.';
  return message;
}
