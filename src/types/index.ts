/**
 * Domain model for the bill-splitting app.
 * All monetary amounts are stored as integers (Toman) to avoid floating point issues.
 */

export type ReceiptItemSource = 'extracted' | 'manual';

export interface ReceiptItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  /** Total price for the line (quantity * unitPrice, unless manually overridden). */
  totalPrice: number;
  source: ReceiptItemSource;
}

export interface PersonExtraItem {
  id: string;
  name: string;
  amount: number;
}

/** How many units of a receipt item a person consumed. */
export interface ItemSelection {
  itemId: string;
  quantity: number;
}

export interface Person {
  id: string;
  name: string;
  /** Units of each receipt item this person consumed (depletes the shared count). */
  selections: ItemSelection[];
  extraItems: PersonExtraItem[];
}

export interface InvoiceSession {
  id: string;
  title: string;
  /** Receipt total used for the equal split. Always equals the sum of item totals. */
  receiptTotalAmount: number;
  items: ReceiptItem[];
  people: Person[];
  paymentBaseUrl: string;
  /** Card number for card-to-card payment (raw digits, English) for those who can't pay online. */
  cardNumber: string;
  /** True when a compressed receipt image is persisted in IndexedDB for this session. */
  hasReceiptImage: boolean;
  createdAt: string;
  updatedAt: string;
}

/** How a person's share for a receipt item was computed. */
export interface PersonItemShare {
  itemId: string;
  itemName: string;
  /** Units this person consumed. */
  quantity: number;
  /** Total units of the item on the receipt. */
  itemQuantity: number;
  /** This person's share for those units. */
  shareAmount: number;
}

/** A receipt item with units that nobody claimed. */
export interface UnassignedItem {
  item: ReceiptItem;
  remainingQuantity: number;
  remainingAmount: number;
}

export interface PersonBreakdown {
  personId: string;
  personName: string;
  equalSplitAmount: number;
  itemBasedTotal: number;
  extraItemsTotal: number;
  finalPayableAmount: number;
  /** undefined when the final amount is zero (no payment needed). */
  paymentLink?: string;
  items: PersonItemShare[];
  extraItems: PersonExtraItem[];
}

export type SplitMode = 'equal' | 'item-based';

export interface InvoiceSummary {
  receiptTotalAmount: number;
  assignedItemsTotal: number;
  unassignedItemsTotal: number;
  /** Sum of all line item totals (independent of receiptTotalAmount). */
  itemsTotal: number;
  /** Sum of every person's extra items. */
  extrasTotal: number;
  /** receiptTotalAmount + extrasTotal — the headline total including extras. */
  totalWithExtras: number;
  /** receiptTotalAmount - itemsTotal; non-zero indicates a mismatch to warn about. */
  receiptVsItemsDelta: number;
  mode: SplitMode;
  people: PersonBreakdown[];
  unassignedItems: UnassignedItem[];
  /** Sum of every person's finalPayableAmount. */
  grandTotal: number;
}
