import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { WarningIcon } from './icons';

type Tone = 'warning' | 'info' | 'danger';

const toneClasses: Record<Tone, string> = {
  warning: 'border-gold/25 bg-gold/[0.07] text-gold',
  info: 'border-info/25 bg-info/[0.07] text-info',
  danger: 'border-danger/25 bg-danger/[0.07] text-danger',
};

interface BannerProps {
  tone?: Tone;
  title?: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function Banner({ tone = 'warning', title, icon, children, className }: BannerProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm',
        toneClasses[tone],
        className,
      )}
    >
      <span className="mt-0.5 shrink-0">
        {icon ?? <WarningIcon width={18} height={18} />}
      </span>
      <div className="space-y-0.5">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="text-cream/80">{children}</div>}
      </div>
    </div>
  );
}
