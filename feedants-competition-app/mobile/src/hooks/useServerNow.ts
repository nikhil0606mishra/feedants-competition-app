import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

/**
 * A ticking "now" that is corrected for clock skew.
 *
 * offset = serverTime - deviceTime, measured whenever fresh server data arrives.
 * now    = Date.now() + offset
 *
 * Countdowns are always DERIVED from (targetDate - now), never decremented, so they can't drift,
 * and they self-correct after the app was backgrounded (JS timers are throttled there).
 */
export function useServerNow(serverTime?: string): Date {
  const offsetRef = useRef(0);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    offsetRef.current = serverTime ? new Date(serverTime).getTime() - Date.now() : 0;
    setNow(new Date(Date.now() + offsetRef.current));
  }, [serverTime]);

  useEffect(() => {
    const tick = () => setNow(new Date(Date.now() + offsetRef.current));
    const id = setInterval(tick, 1000);
    const sub = AppState.addEventListener('change', (s) => s === 'active' && tick());
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, []);

  return now;
}
