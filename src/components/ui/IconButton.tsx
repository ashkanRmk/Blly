import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

type Tone = 'default' | 'danger';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: Tone;
  label: string;
  children: ReactNode;
}

const toneClasses: Record<Tone, string> = {
  default: 'text-muted hover:text-cream hover:bg-white/10',
  danger: 'text-muted hover:text-danger hover:bg-danger/10',
};

export function IconButton({
  tone = 'default',
  label,
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 active:scale-90 disabled:opacity-40',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
