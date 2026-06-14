import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

type Variant = 'primary' | 'ghost' | 'subtle' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  block?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-gradient-to-bl from-gold-soft to-gold-deep text-black font-bold shadow-[0_12px_34px_-12px_rgba(212,175,55,0.65)] hover:brightness-110 active:scale-[0.98]',
  ghost:
    'bg-white/[0.06] text-cream border border-white/10 hover:bg-white/10 active:scale-[0.98]',
  subtle: 'text-muted hover:text-cream hover:bg-white/5',
  danger:
    'bg-danger/12 text-danger border border-danger/25 hover:bg-danger/20 active:scale-[0.98]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'text-sm px-3.5 py-2 rounded-xl gap-1.5',
  md: 'text-[0.95rem] px-5 py-2.5 rounded-2xl gap-2',
  lg: 'text-base px-6 py-3.5 rounded-2xl gap-2.5',
};

export function Button({
  variant = 'ghost',
  size = 'md',
  icon,
  block,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex select-none items-center justify-center whitespace-nowrap transition-all duration-200 disabled:pointer-events-none disabled:opacity-45',
        variantClasses[variant],
        sizeClasses[size],
        block && 'w-full',
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
