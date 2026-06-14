/** Persian/Arabic digit conversion, parsing and display formatting. */

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/** Convert all digits in a string to Persian digits. */
export function toPersianDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

/** Convert Persian/Arabic digits (and separators) in a string to English digits. */
export function toEnglishDigits(input: string): string {
  let out = input;
  PERSIAN_DIGITS.forEach((d, i) => {
    out = out.replace(new RegExp(d, 'g'), String(i));
  });
  ARABIC_DIGITS.forEach((d, i) => {
    out = out.replace(new RegExp(d, 'g'), String(i));
  });
  // Normalise Persian/Arabic thousands separators and decimal marks.
  return out.replace(/[٬،]/g, ',').replace(/[٫]/g, '.');
}

/**
 * Parse free-form user input (Persian/Arabic/English digits, separators) into a
 * non-negative integer amount. Returns 0 for empty/invalid input.
 */
export function parseAmount(input: string): number {
  if (!input) return 0;
  const normalized = toEnglishDigits(input).replace(/[^0-9.]/g, '');
  if (!normalized) return 0;
  const value = Math.round(Number(normalized));
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/** Group thousands with the Persian thousands separator and Persian digits. */
export function formatNumber(value: number): string {
  const safe = Number.isFinite(value) ? Math.round(value) : 0;
  const grouped = Math.abs(safe)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '٬');
  const signed = safe < 0 ? `-${grouped}` : grouped;
  return toPersianDigits(signed);
}

/** Format an amount as "۱۲۳٬۴۵۶ تومان". */
export function formatToman(value: number): string {
  return `${formatNumber(value)} تومان`;
}
