import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';

/** Counts foreground reading time only while this route is focused. */
export function useActiveSeconds() {
  const seconds = useRef(0);
  const focused = true;
  useEffect(() => {
    if (!focused) return;
    let last = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      const visible = Platform.OS !== 'web' || typeof document === 'undefined' || document.visibilityState === 'visible';
      if (visible && AppState.currentState === 'active') seconds.current += Math.min(2, Math.max(0, (now - last) / 1000));
      last = now;
    }, 1000);
    return () => clearInterval(timer);
  }, [focused]);
  return seconds;
}
