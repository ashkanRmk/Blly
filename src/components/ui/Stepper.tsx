import { cn } from '../../utils/cn';
import { toPersianDigits } from '../../utils/persianNumbers';

export interface Step {
  id: string;
  label: string;
}

interface StepperProps {
  steps: Step[];
  activeId: string;
  onNavigate: (id: string) => void;
}

export function Stepper({ steps, activeId, onNavigate }: StepperProps) {
  return (
    <nav className="no-scrollbar -mx-1 flex items-center gap-1.5 overflow-x-auto px-1">
      {steps.map((step, index) => {
        const active = step.id === activeId;
        return (
          <button
            key={step.id}
            onClick={() => onNavigate(step.id)}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-all duration-200',
              active
                ? 'border-gold/50 bg-gold/12 text-gold'
                : 'border-white/10 bg-white/[0.03] text-muted hover:text-cream',
            )}
          >
            <span
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full text-xs',
                active ? 'bg-gold text-black' : 'bg-white/10 text-faint',
              )}
            >
              {toPersianDigits(index + 1)}
            </span>
            {step.label}
          </button>
        );
      })}
    </nav>
  );
}
