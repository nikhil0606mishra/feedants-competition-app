import React, { createContext, useContext, useMemo, useState } from 'react';
import { config } from '../config';

// Auth is out of scope for the assignment: the "logged-in" user is a seeded demo user.
// Context API is enough here because this is tiny, rarely-changing global state.
// Server data lives in React Query, NOT in context/Redux.
interface Session { userId: string; setUserId: (id: string) => void }

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState(config.demoUserId);
  const value = useMemo(() => ({ userId, setUserId }), [userId]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
}
