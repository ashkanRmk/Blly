import type { InvoiceSummary } from '../../types';
import { formatToman, toPersianDigits } from '../../utils/persianNumbers';
import { Badge } from '../ui/Badge';
import { Banner } from '../ui/Banner';
import { cn } from '../../utils/cn';

function StatTile({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-3',
        highlight
          ? 'border-gold/30 bg-gold/[0.07]'
          : 'border-white/[0.08] bg-white/[0.02]',
      )}
    >
      <p className="text-xs text-faint">{label}</p>
      <p className={cn('mt-1 font-bold', highlight ? 'text-gold' : 'text-cream')}>
        {value}
      </p>
    </div>
  );
}

export function SummaryPanel({ summary }: { summary: InvoiceSummary }) {
  const hasMismatch = summary.receiptVsItemsDelta !== 0;
  const hasUnassigned = summary.unassignedItemsTotal > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted">روش محاسبه:</span>
        <Badge tone="gold">
          {summary.mode === 'item-based' ? 'بر اساس آیتم‌های انتخاب‌شده' : 'تقسیم مساوی'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        <StatTile label="مبلغ کل فاکتور" value={formatToman(summary.receiptTotalAmount)} />
        <StatTile label="موارد اضافه" value={formatToman(summary.extrasTotal)} />
        <StatTile label="تعداد افراد" value={`${toPersianDigits(summary.people.length)} نفر`} />
        <StatTile label="تخصیص داده‌شده" value={formatToman(summary.assignedItemsTotal)} />
        <StatTile label="تخصیص داده نشده" value={formatToman(summary.unassignedItemsTotal)} />
        <StatTile
          label="مجموع کل قابل پرداخت"
          value={formatToman(summary.grandTotal)}
          highlight
        />
      </div>

      {hasMismatch && (
        <Banner tone="warning" title="اختلاف مبلغ فاکتور و آیتم‌ها">
          مبلغ کل فاکتور با جمع آیتم‌ها{' '}
          {formatToman(Math.abs(summary.receiptVsItemsDelta))} اختلاف دارد. در صورت نیاز
          آیتم‌ها یا مبلغ کل را اصلاح کنید.
        </Banner>
      )}

      {hasUnassigned && (
        <Banner tone="warning" title="آیتم‌های تخصیص داده نشده">
          {toPersianDigits(summary.unassignedItems.length)} آیتم به ارزش{' '}
          {formatToman(summary.unassignedItemsTotal)} هنوز به کسی اختصاص داده نشده است.
        </Banner>
      )}
    </div>
  );
}
