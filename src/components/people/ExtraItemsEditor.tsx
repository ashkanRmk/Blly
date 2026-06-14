import { useInvoiceStore } from '../../store/invoiceStore';
import type { Person } from '../../types';
import { AmountField } from '../ui/AmountField';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { PlusIcon, TrashIcon } from '../ui/icons';

export function ExtraItemsEditor({ person }: { person: Person }) {
  const addExtraItem = useInvoiceStore((s) => s.addExtraItem);
  const updateExtraItem = useInvoiceStore((s) => s.updateExtraItem);
  const removeExtraItem = useInvoiceStore((s) => s.removeExtraItem);

  return (
    <div className="space-y-2">
      {person.extraItems.map((extra) => (
        <div
          key={extra.id}
          className="space-y-2 rounded-xl border border-white/[0.08] bg-black/20 p-2.5"
        >
          <input
            value={extra.name}
            placeholder="عنوان (مثلاً سهم انعام)"
            onChange={(e) => updateExtraItem(person.id, extra.id, { name: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-cream outline-none focus:border-gold/40"
          />
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <AmountField
                value={extra.amount}
                onChange={(v) => updateExtraItem(person.id, extra.id, { amount: v })}
              />
            </div>
            <IconButton
              tone="danger"
              label="حذف مورد اضافه"
              onClick={() => removeExtraItem(person.id, extra.id)}
            >
              <TrashIcon width={18} height={18} />
            </IconButton>
          </div>
        </div>
      ))}

      <Button
        variant="subtle"
        size="sm"
        icon={<PlusIcon width={16} height={16} />}
        onClick={() => addExtraItem(person.id)}
      >
        افزودن مورد اضافه
      </Button>
    </div>
  );
}
