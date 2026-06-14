import type { InvoiceSession } from '../../types';

const KEY = 'bill-dong:session:v1';

/** Persist the session JSON to localStorage. Returns false on quota/availability errors. */
export function saveSession(session: InvoiceSession): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
}

export function loadSession(): InvoiceSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as InvoiceSession;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
