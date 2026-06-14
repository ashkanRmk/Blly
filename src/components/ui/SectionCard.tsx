import type { ReactNode } from 'react';
import { Card } from './Card';
import { cn } from '../../utils/cn';
import { toPersianDigits } from '../../utils/persianNumbers';

interface SectionCardProps {
  id?: string;
  step?: number;
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SectionCard({
  id,
  step,
  icon,
  title,
  subtitle,
  action,
  children,
  className,
}: SectionCardProps) {
  return (
    <Card id={id} className={cn('animate-rise scroll-mt-24 p-5 sm:p-6', className)}>
      <header className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-bl from-gold-soft/25 to-gold-deep/10 text-gold">
            {step !== undefined ? (
              <span className="text-lg font-bold">{toPersianDigits(step)}</span>
            ) : (
              icon
            )}
          </div>
          <div className="pt-0.5">
            <h2 className="text-lg font-bold text-cream">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-faint">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      {children}
    </Card>
  );
}
