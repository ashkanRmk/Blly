import type { Person, PersonBreakdown } from '../../types';
import { formatToman, toPersianDigits } from '../../utils/persianNumbers';
import { PersonItemSelection } from './PersonItemSelection';
import { ExtraItemsEditor } from './ExtraItemsEditor';

interface PersonCardProps {
  person: Person;
  breakdown: PersonBreakdown;
  itemBased: boolean;
}

export function PersonCard({ person, breakdown, itemBased }: PersonCardProps) {
  const initial = person.name.trim().charAt(0) || '؟';

  return (
    <div className="glass-strong animate-rise space-y-4 rounded-2xl p-4">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-bl from-gold-soft/30 to-gold-deep/15 text-lg font-bold text-gold">
            {initial}
          </div>
          <div>
            <p className="font-semibold text-cream">{person.name || 'بدون نام'}</p>
            <p className="text-xs text-faint">
              {itemBased
                ? `${toPersianDigits(breakdown.items.length)} آیتم انتخاب‌شده`
                : 'تقسیم مساوی'}
            </p>
          </div>
        </div>
        <div className="text-start">
          <p className="text-xs text-faint">مبلغ قابل پرداخت</p>
          <p className="text-gold-gradient text-lg font-extrabold">
            {formatToman(breakdown.finalPayableAmount)}
          </p>
        </div>
      </header>

      <div>
        <p className="mb-2 text-sm text-muted">آیتم‌های مصرف‌شده</p>
        <PersonItemSelection person={person} />
      </div>

      <div>
        <p className="mb-2 text-sm text-muted">موارد اضافه</p>
        <ExtraItemsEditor person={person} />
      </div>
    </div>
  );
}
