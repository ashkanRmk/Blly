import type { ExtractedItem, ReceiptExtractionService } from './types';

/** Realistic Persian sample receipts so the whole flow is demonstrable without real OCR. */
const SAMPLE_SETS: ExtractedItem[][] = [
  [
    { name: 'پیتزا مخصوص', quantity: 1, unitPrice: 250000, totalPrice: 250000 },
    { name: 'نوشابه', quantity: 1, unitPrice: 60000, totalPrice: 60000 },
    { name: 'سیب‌زمینی سرخ‌کرده', quantity: 1, unitPrice: 180000, totalPrice: 180000 },
  ],
  [
    { name: 'قهوه لاته', quantity: 2, unitPrice: 95000, totalPrice: 190000 },
    { name: 'کیک شکلاتی', quantity: 1, unitPrice: 145000, totalPrice: 145000 },
    { name: 'آب پرتقال طبیعی', quantity: 1, unitPrice: 88000, totalPrice: 88000 },
    { name: 'دمنوش به‌لیمو', quantity: 1, unitPrice: 55000, totalPrice: 55000 },
  ],
  [
    { name: 'چلوکباب کوبیده', quantity: 2, unitPrice: 320000, totalPrice: 640000 },
    { name: 'جوجه‌کباب', quantity: 1, unitPrice: 295000, totalPrice: 295000 },
    { name: 'دوغ محلی', quantity: 3, unitPrice: 40000, totalPrice: 120000 },
    { name: 'سالاد شیرازی', quantity: 2, unitPrice: 65000, totalPrice: 130000 },
  ],
];

export interface MockOptions {
  /** Simulated latency in ms. */
  delayMs?: number;
  /** Probability (0..1) that extraction fails, to exercise the error UI. */
  failureRate?: number;
}

export class MockReceiptExtractionService implements ReceiptExtractionService {
  constructor(private readonly options: MockOptions = {}) {}

  async extract(_image: string | Blob): Promise<ExtractedItem[]> {
    const { delayMs = 1600, failureRate = 0 } = this.options;
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    if (failureRate > 0 && Math.random() < failureRate) {
      throw new Error('extraction-failed');
    }

    const set = SAMPLE_SETS[Math.floor(Math.random() * SAMPLE_SETS.length)];
    return set.map((item) => ({ ...item }));
  }
}
