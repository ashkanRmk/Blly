import { useInvoiceStore } from '../../store/invoiceStore';
import type { ReceiptItem } from '../../types';
import { AmountField } from '../ui/AmountField';
import { Badge } from '../ui/Badge';
import { IconButton } from '../ui/IconButton';
import { TrashIcon } from '../ui/icons';
import { formatNumber, toPersianDigits } from '../../utils/persianNumbers';

export function ItemCard({ item }: { item: ReceiptItem }) {
  const updateItem = useInvoiceStore((s) => s.updateItem);
  const removeItem = useInvoiceStore((s) => s.removeItem);

  const setQty = (q: number) => updateItem(item.id, { quantity: Math.max(1, q) });

  return (
    <div className="animate-rise space-y-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5">
      <div className="flex items-center gap-2">
        <input
          value={item.name}
          onChange={(e) => updateItem(item.id, { name: e.target.value })}
          placeholder="نام آیتم"
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-cream outline-none transition-colors focus:border-gold/40"
        />
        <Badge tone={item.source === 'extracted' ? 'gold' : 'neutral'}>
          {item.source === 'extracted' ? 'استخراج‌شده' : 'دستی'}
        </Badge>
        <IconButton tone="danger" label="حذف آیتم" onClick={() => removeItem(item.id)}>
          <TrashIcon width={18} height={18} />
        </IconButton>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-1.5">
          <span className="text-sm text-muted">تعداد</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="کاهش تعداد"
              onClick={() => setQty(item.quantity - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-muted transition-colors hover:bg-white/10 hover:text-cream"
            >
              −
            </button>
            <span className="min-w-9 text-center text-cream">
              {toPersianDigits(item.quantity)}
            </span>
            <button
              type="button"
              aria-label="افزایش تعداد"
              onClick={() => setQty(item.quantity + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-muted transition-colors hover:bg-white/10 hover:text-cream"
            >
              +
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <AmountField
            label="قیمت واحد"
            value={item.unitPrice}
            onChange={(v) => updateItem(item.id, { unitPrice: v })}
          />
          <label className="flex w-full flex-col gap-1.5">
            <span className="text-sm text-muted">قیمت کل</span>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
              <span className="font-semibold text-cream">
                {formatNumber(item.totalPrice)}
              </span>
              <span className="text-xs text-faint">تومان</span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
