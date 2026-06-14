import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-gold">
          {icon}
        </div>
      )}
      <p className="text-cream">{title}</p>
      {description && <p className="max-w-xs text-sm text-faint">{description}</p>}
      {action}
    </div>
  );
}
