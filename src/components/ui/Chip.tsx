import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface ChipProps {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}

/** Toggleable selection chip used for per-person item selection. */
export function Chip({ active, onClick, children, className }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-all duration-200 active:scale-95',
        active
          ? 'border-gold/60 bg-gold/15 text-gold gold-ring'
          : 'border-white/12 bg-white/[0.03] text-muted hover:border-white/25 hover:text-cream',
        className,
      )}
    >
      {children}
    </button>
  );
}
