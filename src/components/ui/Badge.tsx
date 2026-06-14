import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

type Tone = 'gold' | 'neutral' | 'success' | 'danger';

const toneClasses: Record<Tone, string> = {
  gold: 'bg-gold/12 text-gold border-gold/25',
  neutral: 'bg-white/5 text-muted border-white/10',
  success: 'bg-success/12 text-success border-success/25',
  danger: 'bg-danger/12 text-danger border-danger/25',
};

export function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
