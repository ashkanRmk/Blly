import { useInvoiceStore } from '../../store/invoiceStore';
import { sum } from '../../utils/money';
import { formatToman } from '../../utils/persianNumbers';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { ItemCard } from './ItemCard';
import { PlusIcon, ReceiptIcon } from '../ui/icons';

export function ItemsEditor() {
  const items = useInvoiceStore((s) => s.session.items);
  const addItem = useInvoiceStore((s) => s.addItem);

  const itemsTotal = sum(items.map((i) => i.totalPrice));
  const hasItems = items.length > 0;

  return (
    <div className="space-y-4">
      {hasItems ? (
        <>
          <div className="space-y-3">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
          <Button
            variant="ghost"
            block
            icon={<PlusIcon width={18} height={18} />}
            onClick={() => addItem()}
          >
            افزودن دستی آیتم
          </Button>
        </>
      ) : (
        <EmptyState
          icon={<ReceiptIcon width={24} height={24} />}
          title="هنوز آیتمی ثبت نشده است"
          description="عکس فاکتور را استخراج کنید یا آیتم‌ها را به‌صورت دستی اضافه کنید."
          action={
            <Button
              variant="primary"
              icon={<PlusIcon width={18} height={18} />}
              onClick={() => addItem()}
            >
              افزودن دستی آیتم
            </Button>
          }
        />
      )}

      <div className="space-y-2 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">مبلغ کل فاکتور</span>
          <span className="font-semibold text-cream">{formatToman(itemsTotal)}</span>
        </div>

      </div>
    </div>
  );
}
