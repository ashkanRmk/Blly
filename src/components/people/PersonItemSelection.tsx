import { useInvoiceStore } from '../../store/invoiceStore';
import type { Person } from '../../types';
import { selectionQuantity, totalAllocated } from '../../utils/calculations';
import { formatNumber, toPersianDigits } from '../../utils/persianNumbers';
import { Chip } from '../ui/Chip';
import { CheckIcon } from '../ui/icons';

export function PersonItemSelection({ person }: { person: Person }) {
  const items = useInvoiceStore((s) => s.session.items);
  const people = useInvoiceStore((s) => s.session.people);
  const setItemQuantity = useInvoiceStore((s) => s.setItemQuantity);

  if (items.length === 0) {
    return (
      <p className="text-sm text-faint">
        ابتدا در بخش «آیتم‌ها» اقلام فاکتور را اضافه کنید تا قابل انتخاب باشند.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const myQty = selectionQuantity(person, item.id);
        const remaining = item.quantity - totalAllocated(people, item.id); // units left overall
        const multi = item.quantity > 1;

        if (myQty <= 0) {
          const soldOut = remaining <= 0;
          return (
            <Chip
              key={item.id}
              active={false}
              onClick={soldOut ? undefined : () => setItemQuantity(person.id, item.id, 1)}
              className={soldOut ? 'pointer-events-none opacity-40' : ''}
            >
              <span>{item.name || 'بدون نام'}</span>
              <span className="text-xs opacity-70">{formatNumber(item.totalPrice)}</span>
              {multi && (
                <span className="text-[10px] text-faint">
                  {soldOut ? 'تمام شد' : `${toPersianDigits(remaining)} باقی‌مانده`}
                </span>
              )}
            </Chip>
          );
        }

        const canIncrement = remaining > 0;
        return (
          <div
            key={item.id}
            className="gold-ring inline-flex items-center gap-2 rounded-full border border-gold/60 bg-gold/15 px-3 py-1.5 text-sm text-gold"
          >
            <CheckIcon width={14} height={14} />
            <span>{item.name || 'بدون نام'}</span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                aria-label="کاهش تعداد"
                onClick={() => setItemQuantity(person.id, item.id, myQty - 1)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-base transition-colors hover:bg-gold/20"
              >
                −
              </button>
              <span className="min-w-5 text-center font-semibold">
                {toPersianDigits(myQty)}
              </span>
              <button
                type="button"
                aria-label="افزایش تعداد"
                disabled={!canIncrement}
                onClick={() => setItemQuantity(person.id, item.id, myQty + 1)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-base transition-colors hover:bg-gold/20 disabled:opacity-30"
              >
                +
              </button>
            </div>
            {multi && (
              <span className="text-[10px] text-gold/70">از {toPersianDigits(item.quantity)}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
