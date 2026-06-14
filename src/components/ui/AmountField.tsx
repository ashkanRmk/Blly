import { cn } from '../../utils/cn';
import { formatNumber, parseAmount } from '../../utils/persianNumbers';

interface AmountFieldProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  label?: string;
  suffix?: string;
  className?: string;
  ariaLabel?: string;
}

/**
 * Numeric money input. Displays the value with Persian digits + thousands grouping,
 * parses any digit form back to an integer on change.
 */
export function AmountField({
  value,
  onChange,
  placeholder,
  label,
  suffix = 'تومان',
  className,
  ariaLabel,
}: AmountFieldProps) {
  const display = value > 0 ? formatNumber(value) : '';

  return (
    <label className="flex w-full flex-col gap-1.5">
      {label && <span className="text-sm text-muted">{label}</span>}
      <div className="relative">
        <input
          inputMode="numeric"
          aria-label={ariaLabel ?? label}
          value={display}
          placeholder={placeholder}
          onChange={(e) => onChange(parseAmount(e.target.value))}
          className={cn(
            'w-full rounded-2xl border border-white/10 bg-black/20 py-3 pe-4 ps-16 text-cream',
            'placeholder:text-faint outline-none transition-all duration-200',
            'focus:border-gold/50 focus:bg-black/30 focus:ring-2 focus:ring-gold/20',
            className,
          )}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 start-4 flex items-center text-xs text-faint">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}
