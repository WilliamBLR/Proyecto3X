import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabase, manageAuthRefresh } from '../../lib/supabase';

const AuthContext = createContext<{ session: Session | null; ready: boolean; recovering: boolean; clearRecovery: () => void }>({ session: null, ready: false, recovering: false, clearRecovery: () => {} });
export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [recovering, setRecovering] = useState(false);
  useEffect(() => {
    const client = getSupabase();
    if (!client) { setReady(true); return; }
    let active = true;
    const { data } = client.auth.onAuthStateChange((event, next) => {
      if (!active) return;
      setSession(next); setReady(true);
      if (event === 'PASSWORD_RECOVERY') setRecovering(true);
      if (event === 'SIGNED_OUT') setRecovering(false);
    });
    const stop = manageAuthRefresh();
    client.auth.getSession().then(({ data: current }) => {
      if (active) { setSession(current.session); setReady(true); }
    }).catch(() => { if (active) setReady(true); });
    return () => { active = false; data.subscription.unsubscribe(); stop(); };
  }, []);
  return <AuthContext.Provider value={{ session, ready, recovering, clearRecovery: () => setRecovering(false) }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
