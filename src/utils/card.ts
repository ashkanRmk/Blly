import { toEnglishDigits } from './persianNumbers';

/** Strip everything but digits and cap at 16 (a bank card number). */
export function parseCardDigits(input: string): string {
  return toEnglishDigits(input).replace(/\D/g, '').slice(0, 16);
}

/** Group a card number into blocks of four, English digits (e.g. 6037 9911 1234 5678). */
export function formatCardNumber(digits: string): string {
  const clean = parseCardDigits(digits);
  return clean.replace(/(.{4})(?=.)/g, '$1 ').trim();
}
