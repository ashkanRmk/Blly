import { toEnglishDigits } from './persianNumbers';

export const DEFAULT_PAYMENT_BASE_URL = 'https://payping.ir/@rahmani/';

/**
 * Build a PayPing payment link by appending the (English-digit) amount to the base URL.
 * Returns undefined when the amount is zero/invalid — caller shows «نیازی به پرداخت نیست».
 *
 * The URL deliberately bypasses all Persian formatting: digits only, no separators,
 * no currency symbol, no spaces.
 */
export function buildPaymentLink(baseUrl: string, amount: number): string | undefined {
  const value = Math.round(amount);
  if (!Number.isFinite(value) || value <= 0) return undefined;

  const base = (baseUrl || DEFAULT_PAYMENT_BASE_URL).trim().replace(/\/+$/, '');
  const numeric = toEnglishDigits(String(value)).replace(/[^0-9]/g, '');
  if (!numeric) return undefined;

  return `${base}/${numeric}`;
}

/** Loose validation for the user-editable base URL. */
export function isValidBaseUrl(baseUrl: string): boolean {
  try {
    const u = new URL(baseUrl);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}
