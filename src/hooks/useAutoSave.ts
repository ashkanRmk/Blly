import { useEffect } from 'react';
import { useInvoiceStore } from '../store/invoiceStore';
import { saveSession } from '../services/storage';
import { useToastStore } from '../store/toastStore';

/** Debounced auto-save of the session to localStorage on every change. */
export function useAutoSave(): void {
  const session = useInvoiceStore((s) => s.session);
  const hydrated = useInvoiceStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    const handle = window.setTimeout(() => {
      const ok = saveSession(session);
      if (!ok) {
        useToastStore
          .getState()
          .notify('فضای ذخیره‌سازی مرورگر در دسترس نیست؛ تغییرات ذخیره نشد.', 'error');
      }
    }, 400);
    return () => window.clearTimeout(handle);
  }, [session, hydrated]);
}
