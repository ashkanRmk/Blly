import { useToastStore } from '../../store/toastStore';
import type { ToastTone } from '../../store/toastStore';
import { cn } from '../../utils/cn';
import { CheckIcon, CloseIcon, WarningIcon } from './icons';

const toneClasses: Record<ToastTone, string> = {
  info: 'border-info/30 text-cream',
  success: 'border-success/40 text-success',
  error: 'border-danger/40 text-danger',
};

function ToneIcon({ tone }: { tone: ToastTone }) {
  if (tone === 'success') return <CheckIcon width={18} height={18} />;
  if (tone === 'error') return <WarningIcon width={18} height={18} />;
  return <WarningIcon width={18} height={18} />;
}

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'animate-rise glass-strong pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl border px-4 py-3 text-sm shadow-xl',
            toneClasses[t.tone],
          )}
        >
          <ToneIcon tone={t.tone} />
          <span className="flex-1 text-cream">{t.message}</span>
          <button
            onClick={() => dismiss(t.id)}
            aria-label="بستن"
            className="text-faint transition-colors hover:text-cream"
          >
            <CloseIcon width={16} height={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
