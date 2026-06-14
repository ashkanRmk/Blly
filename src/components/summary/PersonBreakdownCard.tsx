import type { PersonBreakdown } from '../../types';
import { formatToman, toPersianDigits } from '../../utils/persianNumbers';
import { CopyButton } from '../ui/CopyButton';
import { LinkIcon } from '../ui/icons';

export function PersonBreakdownCard({ breakdown }: { breakdown: PersonBreakdown }) {
  const initial = breakdown.personName.trim().charAt(0) || '؟';

  return (
    <div className="glass-strong animate-rise space-y-3 rounded-2xl p-4">
      <header className="flex items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-bl from-gold-soft/30 to-gold-deep/15 text-sm font-bold text-gold">
            {initial}
          </div>
          <p className="font-semibold text-cream">{breakdown.personName || 'بدون نام'}</p>
        </div>
        <p className="text-gold-gradient text-lg font-extrabold">
          {formatToman(breakdown.finalPayableAmount)}
        </p>
      </header>

      {breakdown.items.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-faint">آیتم‌ها</p>
          {breakdown.items.map((it) => (
            <div key={it.itemId} className="flex items-center justify-between text-sm">
              <span className="text-muted">
                {it.itemName || 'بدون نام'}
                {it.quantity > 1 && (
                  <span className="text-faint"> × {toPersianDigits(it.quantity)}</span>
                )}
              </span>
              <span className="text-cream">{formatToman(it.shareAmount)}</span>
            </div>
          ))}
        </div>
      )}

      {breakdown.extraItems.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-faint">موارد اضافه</p>
          {breakdown.extraItems.map((extra) => (
            <div key={extra.id} className="flex items-center justify-between text-sm">
              <span className="text-muted">{extra.name || 'بدون عنوان'}</span>
              <span className="text-cream">{formatToman(extra.amount)}</span>
            </div>
          ))}
        </div>
      )}

      {breakdown.paymentLink ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.08] bg-black/20 p-2.5">
          <LinkIcon width={16} height={16} className="text-gold" />
          <a
            href={breakdown.paymentLink}
            target="_blank"
            rel="noreferrer"
            dir="ltr"
            className="min-w-0 flex-1 truncate text-sm text-info hover:underline"
          >
            {breakdown.paymentLink}
          </a>
          <CopyButton text={breakdown.paymentLink} label="کپی لینک" copiedLabel="کپی شد" />
        </div>
      ) : (
        <p className="rounded-xl border border-white/[0.08] bg-black/20 p-2.5 text-center text-sm text-faint">
          نیازی به پرداخت نیست
        </p>
      )}
    </div>
  );
}
