import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../components/Screen';
import { Button, Notice } from '../../components/Controls';
import { completeAuth, friendlyAuthError } from '../../features/auth/service';

export default function Callback() {
  const { code, error_description: errorDescription, recovery } = useLocalSearchParams<{ code?: string; error_description?: string; recovery?: string }>();
  const [error, setError] = useState('');
  const router = useRouter();
  useEffect(() => {
    if (!code) { setError(errorDescription ?? 'El enlace no contiene un código válido. Solicita uno nuevo.'); return; }
    completeAuth(code).then(() => router.replace((recovery ? '/account?recovery=1' : '/') as never)).catch((e) => setError(friendlyAuthError(e)));
  }, [code, errorDescription, recovery, router]);
  return <Screen eyebrow="TU CUENTA" title="Conectando tu progreso…" showTestAction={false}><Notice text={error || 'Estamos completando tu acceso.'} error={!!error} />{error && <Button label="Volver al acceso" onPress={() => router.replace('/account' as never)} />}</Screen>;
}
