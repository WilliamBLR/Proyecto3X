import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { initialState, mergeStates, stateSchema, type StudyState } from '../domain/model';
import { useAuth } from '../features/auth/AuthProvider';
import { getSupabase } from '../lib/supabase';

type Update = (state: StudyState) => StudyState;
type Context = { state: StudyState; ready: boolean; error: string; syncStatus: string; update: (fn: Update) => Promise<void>; sync: () => Promise<void> };
const StudyContext = createContext<Context | null>(null);
export function StudyProvider({ children }: PropsWithChildren) {
  const { session, ready: authReady } = useAuth();
  const owner = session?.user.id ?? 'guest';
  const key = `proyecto3x.v1.${owner}`;
  const [state, setState] = useState(initialState);
  const current = useRef(state);
  const [loadedKey, setLoadedKey] = useState('');
  const [error, setError] = useState('');
  const [syncStatus, setSyncStatus] = useState('Guardado en este dispositivo');
  const queue = useRef(Promise.resolve());
  const ownerRef = useRef(key); ownerRef.current = key;
  const syncing = useRef(false);
  const dirty = useRef(false);
  const ready = authReady && loadedKey === key;

  const persist = useCallback((next: StudyState, pending: boolean, storageKey: string) => {
    const serialized = JSON.stringify({ state: next, dirty: pending });
    const write = queue.current.catch(() => {}).then(() => AsyncStorage.setItem(storageKey, serialized));
    queue.current = write;
    return write;
  }, []);
  const update = useCallback(async (fn: Update) => {
    if (!ready) throw new Error('Espera mientras cargamos tu progreso.');
    const next = stateSchema.parse({ ...fn(current.current), updatedAt: Date.now() });
    current.current = next; dirty.current = true; setState(next); setError('');
    setSyncStatus(owner === 'guest' ? 'Guardado en este dispositivo' : 'Cambios pendientes de respaldo');
    try { await persist(next, true, key); }
    catch { setError('No se pudo guardar en el dispositivo. Libera espacio e intenta de nuevo.'); throw new Error('No se pudo guardar tu progreso.'); }
  }, [key, owner, persist, ready]);

  const sync = useCallback(async () => {
    const client = getSupabase();
    if (!ready || owner === 'guest' || !client || syncing.current) return;
    syncing.current = true; setSyncStatus('Respaldando…');
    const starting = current.current;
    try {
      // Function merges immutable attempts and corrects scores on the server.
      const { data, error: cloudError } = await client.rpc('sync_study_state', { p_state: starting });
      if (cloudError) throw cloudError;
      if (ownerRef.current !== key) return;
      const cloud = stateSchema.parse(data);
      const changedDuringSync = current.current !== starting;
      const merged = mergeStates(current.current, cloud);
      current.current = merged; dirty.current = changedDuringSync; setState(merged);
      await persist(merged, changedDuringSync, key);
      setSyncStatus(changedDuringSync ? 'Cambios pendientes de respaldo' : 'Respaldado en la nube');
      setError('');
    } catch {
      if (ownerRef.current === key) setSyncStatus('Sin respaldo reciente · Reintentar');
    } finally { syncing.current = false; }
  }, [key, owner, persist, ready]);

  useEffect(() => {
    if (!authReady) return;
    let cancelled = false;
    setLoadedKey(''); setError(''); current.current = initialState(); setState(current.current);
    dirty.current = false;
    AsyncStorage.getItem(key).then((raw) => {
      if (cancelled) return;
      if (raw) {
        const saved = JSON.parse(raw);
        current.current = stateSchema.parse(saved.state); dirty.current = Boolean(saved.dirty);
        setState(current.current);
      }
      setLoadedKey(key);
      setSyncStatus(owner === 'guest' ? 'Guardado en este dispositivo' : 'Preparando respaldo…');
    }).catch(() => {
      if (!cancelled) setError('No pudimos leer tu progreso. Cierra y vuelve a abrir la app. No sobrescribiremos tus datos.');
    });
    return () => { cancelled = true; };
  }, [authReady, key, owner]);
  useEffect(() => {
    if (!ready) return;
    void sync();
    const timer = setInterval(() => { if (dirty.current && AppState.currentState === 'active') void sync(); }, 15000);
    const subscription = AppState.addEventListener('change', (status) => { if (status === 'active') void sync(); });
    return () => { clearInterval(timer); subscription.remove(); };
  }, [ready, sync]);
  return <StudyContext.Provider value={{ state, ready, error, syncStatus, update, sync }}>{children}</StudyContext.Provider>;
}
export function useStudy() { const value = useContext(StudyContext); if (!value) throw new Error('StudyProvider requerido'); return value; }
