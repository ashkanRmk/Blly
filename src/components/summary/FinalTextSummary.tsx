import { useMemo } from 'react';
import type { InvoiceSummary } from '../../types';
import { buildFinalSummaryText } from '../../utils/finalSummaryText';
import { CopyButton } from '../ui/CopyButton';

interface FinalTextSummaryProps {
  summary: InvoiceSummary;
  title: string;
  cardNumber: string;
}

export function FinalTextSummary({ summary, title, cardNumber }: FinalTextSummaryProps) {
  const text = useMemo(
    () => buildFinalSummaryText(summary, { title, cardNumber }),
    [summary, title, cardNumber],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">متن آماده ارسال در گروه</p>
        <CopyButton text={text} label="کپی خلاصه" copiedLabel="کپی شد ✓" variant="button" />
      </div>
      <textarea
        readOnly
        value={text}
        dir="rtl"
        rows={Math.min(28, text.split('\n').length + 1)}
        className="w-full resize-none rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-7 text-cream/90 outline-none focus:border-gold/40"
        onFocus={(e) => e.currentTarget.select()}
      />
    </div>
  );
}
