import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { cn } from '../../utils/cn';
import { CheckIcon, CopyIcon } from './icons';

interface CopyButtonProps {
  text: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  variant?: 'button' | 'inline';
}

export function CopyButton({
  text,
  label = 'کپی',
  copiedLabel = 'کپی شد',
  className,
  variant = 'button',
}: CopyButtonProps) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <button
      type="button"
      onClick={() => copy(text)}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-xl text-sm transition-all duration-200 active:scale-95',
        variant === 'button'
          ? 'border border-white/10 bg-white/[0.06] px-3.5 py-2 hover:bg-white/10'
          : 'px-2 py-1',
        copied ? 'text-success' : 'text-cream',
        className,
      )}
    >
      {copied ? <CheckIcon width={16} height={16} /> : <CopyIcon width={16} height={16} />}
      <span>{copied ? copiedLabel : label}</span>
    </button>
  );
}
