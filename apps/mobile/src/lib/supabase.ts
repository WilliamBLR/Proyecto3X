import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock, type SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

let client: SupabaseClient | null = null;

/** Configuración opcional: la base visual funciona sin conectar un backend. */
export function getSupabase(): SupabaseClient | null {
  if (client) return client;
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  client = createClient(url, key, {
    auth: {
      ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
  });
  return client;
}

/** Montar desde el futuro proveedor de auth y ejecutar el cleanup al desmontar. */
export function manageAuthRefresh() {
  const supabase = getSupabase();
  if (!supabase || Platform.OS === 'web') return () => {};
  const update = (state: string) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  };
  update(AppState.currentState);
  const subscription = AppState.addEventListener('change', update);
  return () => {
    subscription.remove();
    supabase.auth.stopAutoRefresh();
  };
}
