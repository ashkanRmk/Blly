/** A line item produced by a receipt extraction service (before it becomes a ReceiptItem). */
export interface ExtractedItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

/**
 * Replaceable receipt-extraction abstraction. The MVP ships a mock implementation;
 * a future OpenAI/Claude Vision, Google Vision, Tesseract or backend service can
 * implement the same interface without touching the UI.
 */
export interface ReceiptExtractionService {
  /** Extract line items from a receipt image (data URL string or Blob). */
  extract(image: string | Blob): Promise<ExtractedItem[]>;
}
