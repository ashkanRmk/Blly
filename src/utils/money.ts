/** Integer-money helpers. All amounts in the app are integer Toman. */

/** Coerce any numeric input to a non-negative safe integer. */
export function toInt(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value));
}

export function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
