import { create } from 'zustand';
import type {
  InvoiceSession,
  ItemSelection,
  Person,
  PersonExtraItem,
  ReceiptItem,
} from '../types';
import type { ExtractedItem } from '../services/receiptExtraction';
import { selectionQuantity } from '../utils/calculations';
import {
  clearSession,
  deleteImage,
  loadImage,
  loadSession,
  saveImage,
  saveSession,
} from '../services/storage';
import { DEFAULT_PAYMENT_BASE_URL } from '../utils/paymentLinks';
import { newId } from '../utils/id';
import { clamp, sum, toInt } from '../utils/money';
import { useToastStore } from './toastStore';

export type ExtractionStatus = 'idle' | 'loading' | 'success' | 'error';

interface ExtractionState {
  status: ExtractionStatus;
  error?: string;
}

interface InvoiceStore {
  session: InvoiceSession;
  /** Transient receipt image preview (the persisted copy lives in IndexedDB). */
  receiptImageDataUrl: string | null;
  extraction: ExtractionState;
  hydrated: boolean;

  hydrate: () => Promise<void>;
  resetSession: () => Promise<void>;

  setTitle: (title: string) => void;
  setPaymentBaseUrl: (url: string) => void;
  setCardNumber: (value: string) => void;

  setReceiptImage: (dataUrl: string) => Promise<void>;
  removeImage: () => Promise<void>;

  addItem: (partial?: Partial<ReceiptItem>) => void;
  addExtractedItems: (items: ExtractedItem[]) => void;
  updateItem: (id: string, patch: Partial<ReceiptItem>) => void;
  removeItem: (id: string) => void;

  addPerson: (name: string) => void;
  updatePerson: (id: string, patch: Partial<Pick<Person, 'name'>>) => void;
  removePerson: (id: string) => void;
  /** Set how many units of an item a person consumed (clamped to remaining availability). */
  setItemQuantity: (personId: string, itemId: string, quantity: number) => void;

  addExtraItem: (personId: string, partial?: Partial<PersonExtraItem>) => void;
  updateExtraItem: (
    personId: string,
    extraId: string,
    patch: Partial<PersonExtraItem>,
  ) => void;
  removeExtraItem: (personId: string, extraId: string) => void;

  setExtraction: (status: ExtractionStatus, error?: string) => void;
}

function createEmptySession(): InvoiceSession {
  const now = new Date().toISOString();
  return {
    id: newId(),
    title: '',
    receiptTotalAmount: 0,
    items: [],
    people: [],
    paymentBaseUrl: DEFAULT_PAYMENT_BASE_URL,
    cardNumber: '',
    hasReceiptImage: false,
    createdAt: now,
    updatedAt: now,
  };
}

/** Upsert a person's unit count for an item (removes the entry when quantity is 0). */
function upsertSelection(
  selections: ItemSelection[],
  itemId: string,
  quantity: number,
): ItemSelection[] {
  const filtered = selections.filter((s) => s.itemId !== itemId);
  if (quantity > 0) filtered.push({ itemId, quantity });
  return filtered;
}

/** Trim allocations so the units claimed for an item never exceed its quantity. */
function clampItemAllocations(people: Person[], item: ReceiptItem): Person[] {
  let cursor = 0;
  return people.map((p) => {
    const q = selectionQuantity(p, item.id);
    if (q <= 0) return p;
    const allowed = Math.max(0, Math.min(q, item.quantity - cursor));
    cursor += allowed;
    if (allowed === q) return p;
    return { ...p, selections: upsertSelection(p.selections, item.id, allowed) };
  });
}

function createItem(partial?: Partial<ReceiptItem>): ReceiptItem {
  const quantity = (partial?.quantity ?? 1) > 0 ? (partial?.quantity ?? 1) : 1;
  const unitPrice = toInt(partial?.unitPrice ?? 0);
  return {
    id: partial?.id ?? newId(),
    name: partial?.name ?? '',
    quantity,
    unitPrice,
    // Total is always derived from quantity × unit price.
    totalPrice: toInt(quantity * unitPrice),
    source: partial?.source ?? 'manual',
  };
}

/** Bump updatedAt on every mutation. */
function touch(session: InvoiceSession): InvoiceSession {
  return { ...session, updatedAt: new Date().toISOString() };
}

/** The receipt total is always the sum of item totals (read-only for the user). */
function withSyncedTotal(session: InvoiceSession): InvoiceSession {
  return {
    ...session,
    receiptTotalAmount: sum(session.items.map((i) => i.totalPrice)),
  };
}

/** Defensive normalisation of a session loaded from storage (handles older shapes). */
function normalizeSession(saved: Record<string, any>): InvoiceSession {
  const base = createEmptySession();
  return {
    ...base,
    ...saved,
    id: saved.id ?? base.id,
    paymentBaseUrl: saved.paymentBaseUrl || DEFAULT_PAYMENT_BASE_URL,
    cardNumber: saved.cardNumber ?? '',
    items: (saved.items ?? []).map((it: Partial<ReceiptItem>) => createItem(it)),
    people: (saved.people ?? []).map((p: any) => ({
      id: p.id ?? newId(),
      name: p.name ?? '',
      // Migrate legacy `selectedItemIds: string[]` to quantity-based selections.
      selections: (p.selections ??
        (p.selectedItemIds ?? []).map((itemId: string) => ({ itemId, quantity: 1 }))
      ).map((s: ItemSelection) => ({ itemId: s.itemId, quantity: toInt(s.quantity) })),
      extraItems: (p.extraItems ?? []).map((e: Partial<PersonExtraItem>) => ({
        id: e.id ?? newId(),
        name: e.name ?? '',
        amount: toInt(e.amount ?? 0),
      })),
    })),
  };
}

const mapPeople = (
  session: InvoiceSession,
  fn: (p: Person) => Person,
): InvoiceSession => ({ ...session, people: session.people.map(fn) });

export const useInvoiceStore = create<InvoiceStore>((set, get) => ({
  session: createEmptySession(),
  receiptImageDataUrl: null,
  extraction: { status: 'idle' },
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    const saved = loadSession();
    if (saved) {
      const session = normalizeSession(saved);
      set({ session });
      if (session.hasReceiptImage) {
        const img = await loadImage(session.id);
        if (img) set({ receiptImageDataUrl: img });
      }
    }
    set({ hydrated: true });
  },

  resetSession: async () => {
    const old = get().session;
    await deleteImage(old.id);
    clearSession();
    const fresh = createEmptySession();
    set({
      session: fresh,
      receiptImageDataUrl: null,
      extraction: { status: 'idle' },
    });
    saveSession(fresh);
  },

  setTitle: (title) =>
    set((s) => ({ session: touch({ ...s.session, title }) })),

  setPaymentBaseUrl: (url) =>
    set((s) => ({ session: touch({ ...s.session, paymentBaseUrl: url }) })),

  setCardNumber: (value) =>
    set((s) => ({ session: touch({ ...s.session, cardNumber: value }) })),

  setReceiptImage: async (dataUrl) => {
    const { session } = get();
    set({ receiptImageDataUrl: dataUrl });
    const ok = await saveImage(session.id, dataUrl);
    set((s) => ({ session: touch({ ...s.session, hasReceiptImage: ok }) }));
    if (!ok) {
      useToastStore
        .getState()
        .notify('ذخیره‌سازی تصویر ممکن نشد، ولی می‌توانید ادامه دهید.', 'error');
    }
  },

  removeImage: async () => {
    const { session } = get();
    await deleteImage(session.id);
    set((s) => ({
      receiptImageDataUrl: null,
      session: touch({ ...s.session, hasReceiptImage: false }),
    }));
  },

  addItem: (partial) =>
    set((s) => ({
      session: withSyncedTotal(
        touch({ ...s.session, items: [...s.session.items, createItem(partial)] }),
      ),
    })),

  addExtractedItems: (items) =>
    set((s) => {
      const created = items.map((e) => createItem({ ...e, source: 'extracted' }));
      return {
        session: withSyncedTotal(
          touch({ ...s.session, items: [...s.session.items, ...created] }),
        ),
      };
    }),

  updateItem: (id, patch) =>
    set((s) => {
      let changedItem: ReceiptItem | undefined;
      const items = s.session.items.map((it) => {
        if (it.id !== id) return it;
        const next = { ...it, ...patch };
        // Total is always derived from quantity × unit price.
        next.totalPrice = toInt((next.quantity || 0) * (next.unitPrice || 0));
        changedItem = next;
        return next;
      });
      // If the item's quantity dropped, trim any over-allocation by people.
      const people =
        changedItem && 'quantity' in patch
          ? clampItemAllocations(s.session.people, changedItem)
          : s.session.people;
      return { session: withSyncedTotal(touch({ ...s.session, items, people })) };
    }),

  removeItem: (id) =>
    set((s) => {
      const items = s.session.items.filter((it) => it.id !== id);
      const people = s.session.people.map((p) => ({
        ...p,
        selections: p.selections.filter((sel) => sel.itemId !== id),
      }));
      return { session: withSyncedTotal(touch({ ...s.session, items, people })) };
    }),

  addPerson: (name) =>
    set((s) => {
      const person: Person = {
        id: newId(),
        name: name.trim(),
        selections: [],
        extraItems: [],
      };
      return { session: touch({ ...s.session, people: [...s.session.people, person] }) };
    }),

  updatePerson: (id, patch) =>
    set((s) => ({
      session: touch(mapPeople(s.session, (p) => (p.id === id ? { ...p, ...patch } : p))),
    })),

  removePerson: (id) =>
    set((s) => ({
      session: touch({
        ...s.session,
        people: s.session.people.filter((p) => p.id !== id),
      }),
    })),

  setItemQuantity: (personId, itemId, quantity) =>
    set((s) => {
      const item = s.session.items.find((i) => i.id === itemId);
      if (!item) return {};
      // Clamp to what's left after everyone else's claims.
      const others = sum(
        s.session.people
          .filter((p) => p.id !== personId)
          .map((p) => selectionQuantity(p, itemId)),
      );
      const max = Math.max(0, item.quantity - others);
      const q = clamp(Math.round(quantity), 0, max);
      return {
        session: touch(
          mapPeople(s.session, (p) =>
            p.id === personId
              ? { ...p, selections: upsertSelection(p.selections, itemId, q) }
              : p,
          ),
        ),
      };
    }),

  addExtraItem: (personId, partial) =>
    set((s) => ({
      session: touch(
        mapPeople(s.session, (p) =>
          p.id === personId
            ? {
                ...p,
                extraItems: [
                  ...p.extraItems,
                  {
                    id: newId(),
                    name: partial?.name ?? '',
                    amount: toInt(partial?.amount ?? 0),
                  },
                ],
              }
            : p,
        ),
      ),
    })),

  updateExtraItem: (personId, extraId, patch) =>
    set((s) => ({
      session: touch(
        mapPeople(s.session, (p) =>
          p.id === personId
            ? {
                ...p,
                extraItems: p.extraItems.map((e) =>
                  e.id === extraId ? { ...e, ...patch } : e,
                ),
              }
            : p,
        ),
      ),
    })),

  removeExtraItem: (personId, extraId) =>
    set((s) => ({
      session: touch(
        mapPeople(s.session, (p) =>
          p.id === personId
            ? { ...p, extraItems: p.extraItems.filter((e) => e.id !== extraId) }
            : p,
        ),
      ),
    })),

  setExtraction: (status, error) => set({ extraction: { status, error } }),
}));
