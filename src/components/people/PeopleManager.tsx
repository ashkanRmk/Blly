import { useState } from 'react';
import { useInvoiceStore } from '../../store/invoiceStore';
import { useInvoiceSummary } from '../../store/selectors';
import { formatToman } from '../../utils/persianNumbers';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { EmptyState } from '../ui/EmptyState';
import { TrashIcon, UserPlusIcon, UsersIcon } from '../ui/icons';

export function PeopleManager() {
  const people = useInvoiceStore((s) => s.session.people);
  const addPerson = useInvoiceStore((s) => s.addPerson);
  const updatePerson = useInvoiceStore((s) => s.updatePerson);
  const removePerson = useInvoiceStore((s) => s.removePerson);
  const summary = useInvoiceSummary();
  const [name, setName] = useState('');

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addPerson(trimmed);
    setName('');
  };

  const amountFor = (id: string) =>
    summary.people.find((p) => p.personId === id)?.finalPayableAmount ?? 0;

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex gap-2"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="نام فرد را وارد کنید"
          className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-cream outline-none transition-colors placeholder:text-faint focus:border-gold/50"
        />
        <Button
          type="submit"
          variant="primary"
          icon={<UserPlusIcon width={18} height={18} />}
          disabled={!name.trim()}
        >
          افزودن
        </Button>
      </form>

      {people.length === 0 ? (
        <EmptyState
          icon={<UsersIcon width={24} height={24} />}
          title="هنوز کسی اضافه نشده است"
          description="نام افرادی که در صورت‌حساب شریک هستند را اضافه کنید."
        />
      ) : (
        <div className="space-y-2">
          {people.map((person) => (
            <div
              key={person.id}
              className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-2.5"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-bl from-gold-soft/25 to-gold-deep/10 text-sm font-bold text-gold">
                {person.name.trim().charAt(0) || '؟'}
              </div>
              <input
                value={person.name}
                onChange={(e) => updatePerson(person.id, { name: e.target.value })}
                placeholder="نام فرد"
                className="min-w-0 flex-1 rounded-lg bg-transparent px-1 py-1 text-cream outline-none focus:bg-black/20"
              />
              <span className="shrink-0 text-sm font-semibold text-gold">
                {formatToman(amountFor(person.id))}
              </span>
              <IconButton
                tone="danger"
                label="حذف فرد"
                onClick={() => removePerson(person.id)}
              >
                <TrashIcon width={18} height={18} />
              </IconButton>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
