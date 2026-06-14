import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Card } from './Card';
import { IconButton } from './IconButton';
import { CloseIcon } from './icons';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <Card className="animate-rise relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-b-none p-5 sm:rounded-[1.75rem] sm:p-6">
        <header className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-cream">{title}</h2>
          <IconButton label="بستن" onClick={onClose}>
            <CloseIcon width={18} height={18} />
          </IconButton>
        </header>
        {children}
      </Card>
    </div>
  );
}
