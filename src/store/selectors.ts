import { useMemo } from 'react';
import type { InvoiceSummary } from '../types';
import { computeSummary } from '../utils/calculations';
import { useInvoiceStore } from './invoiceStore';

/** Memoized derived summary — recomputes only when the session reference changes. */
export function useInvoiceSummary(): InvoiceSummary {
  const session = useInvoiceStore((s) => s.session);
  return useMemo(() => computeSummary(session), [session]);
}
