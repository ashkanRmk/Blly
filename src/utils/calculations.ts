import type {
  InvoiceSession,
  InvoiceSummary,
  Person,
  PersonBreakdown,
  PersonItemShare,
  ReceiptItem,
  SplitMode,
  UnassignedItem,
} from '../types';
import { clamp, sum } from './money';
import { buildPaymentLink } from './paymentLinks';

/**
 * Split an integer amount among `n` parts as evenly as possible with no money lost.
 * Everyone gets floor(amount/n); the +1 remainder is handed to `rem` parts starting at
 * `offset` (rotated per item for fairness, but deterministic).
 *
 * Guarantees: result.length === n and sum(result) === amount.
 * Example: splitEvenly(100000, 3) -> [33334, 33333, 33333]
 */
export function splitEvenly(amount: number, n: number, offset = 0): number[] {
  if (n <= 0) return [];
  const safeAmount = Math.max(0, Math.round(amount));
  const base = Math.floor(safeAmount / n);
  const remainder = safeAmount - base * n;
  const result = new Array<number>(n).fill(base);
  const start = ((offset % n) + n) % n;
  for (let i = 0; i < remainder; i++) {
    result[(start + i) % n] += 1;
  }
  return result;
}

/** Equal split of a total amount across people. */
export function computeEqualSplit(total: number, peopleCount: number): number[] {
  return splitEvenly(total, peopleCount, 0);
}

/** Units of a given item a person has claimed. */
export function selectionQuantity(person: Person, itemId: string): number {
  return person.selections.find((s) => s.itemId === itemId)?.quantity ?? 0;
}

/** Total units of an item claimed across all people. */
export function totalAllocated(people: Person[], itemId: string): number {
  return sum(people.map((p) => selectionQuantity(p, itemId)));
}

/**
 * Max units `personId` may claim for an item: the item's quantity minus what everyone
 * else has already taken. So as people select, fewer units remain for the rest.
 */
export function availableForPerson(
  item: ReceiptItem,
  people: Person[],
  personId: string,
): number {
  const others = sum(
    people.filter((p) => p.id !== personId).map((p) => selectionQuantity(p, item.id)),
  );
  return Math.max(0, item.quantity - others);
}

/**
 * Compute the full invoice summary. Each unit of an item carries a deterministic price
 * (so per-unit splits never lose money); a person pays for the units they consumed and
 * any leftover units stay unassigned. Pure function — safe to memoize.
 */
export function computeSummary(session: InvoiceSession): InvoiceSummary {
  const { items, people, receiptTotalAmount, paymentBaseUrl } = session;

  const itemsTotal = sum(items.map((i) => i.totalPrice));

  const anySelection = people.some((p) =>
    p.selections.some((s) => s.quantity > 0),
  );
  const mode: SplitMode = anySelection ? 'item-based' : 'equal';

  const sharesByPerson = new Map<string, PersonItemShare[]>();
  people.forEach((p) => sharesByPerson.set(p.id, []));
  const unassignedItems: UnassignedItem[] = [];

  items.forEach((item, itemIndex) => {
    // Each unit gets a price; the unit prices sum exactly to the line total.
    const unitShares = splitEvenly(item.totalPrice, Math.max(1, item.quantity), itemIndex);
    let cursor = 0;
    people.forEach((p) => {
      const requested = selectionQuantity(p, item.id);
      const q = clamp(requested, 0, Math.max(0, item.quantity - cursor));
      if (q <= 0) return;
      const slice = unitShares.slice(cursor, cursor + q);
      cursor += q;
      sharesByPerson.get(p.id)?.push({
        itemId: item.id,
        itemName: item.name,
        quantity: q,
        itemQuantity: item.quantity,
        shareAmount: sum(slice),
      });
    });
    const remainingQuantity = Math.max(0, item.quantity - cursor);
    if (remainingQuantity > 0) {
      unassignedItems.push({
        item,
        remainingQuantity,
        remainingAmount: sum(unitShares.slice(cursor)),
      });
    }
  });

  const equalShares = computeEqualSplit(receiptTotalAmount, people.length || 1);

  const breakdowns: PersonBreakdown[] = people.map((p, idx) => {
    const itemShares = sharesByPerson.get(p.id) ?? [];
    const itemBasedTotal = sum(itemShares.map((s) => s.shareAmount));
    const extraItemsTotal = sum(p.extraItems.map((e) => e.amount));
    const equalSplitAmount = people.length ? equalShares[idx] : 0;

    // Extras are ALWAYS added to the final total.
    const baseAmount = mode === 'item-based' ? itemBasedTotal : equalSplitAmount;
    const finalPayableAmount = baseAmount + extraItemsTotal;

    return {
      personId: p.id,
      personName: p.name,
      equalSplitAmount,
      itemBasedTotal,
      extraItemsTotal,
      finalPayableAmount,
      paymentLink: buildPaymentLink(paymentBaseUrl, finalPayableAmount),
      items: itemShares,
      extraItems: p.extraItems,
    };
  });

  const unassignedItemsTotal = sum(unassignedItems.map((u) => u.remainingAmount));
  const assignedItemsTotal = itemsTotal - unassignedItemsTotal;
  const extrasTotal = sum(breakdowns.map((b) => b.extraItemsTotal));

  return {
    receiptTotalAmount,
    assignedItemsTotal,
    unassignedItemsTotal,
    itemsTotal,
    extrasTotal,
    totalWithExtras: receiptTotalAmount + extrasTotal,
    receiptVsItemsDelta: receiptTotalAmount - itemsTotal,
    mode,
    people: breakdowns,
    unassignedItems,
    grandTotal: sum(breakdowns.map((b) => b.finalPayableAmount)),
  };
}
