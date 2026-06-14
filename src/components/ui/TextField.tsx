import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: ReactNode;
}

export function TextField({ label, hint, className, id, ...props }: TextFieldProps) {
  return (
    <label className="flex w-full flex-col gap-1.5">
      {label && <span className="text-sm text-muted">{label}</span>}
      <input
        id={id}
        className={cn(
          'w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-cream',
          'placeholder:text-faint outline-none transition-all duration-200',
          'focus:border-gold/50 focus:bg-black/30 focus:ring-2 focus:ring-gold/20',
          className,
        )}
        {...props}
      />
      {hint && <span className="text-xs text-faint">{hint}</span>}
    </label>
  );
}
