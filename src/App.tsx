import { useEffect, useState } from 'react';
import { useInvoiceStore } from './store/invoiceStore';
import { useInvoiceSummary } from './store/selectors';
import { useAutoSave } from './hooks/useAutoSave';
import { Stepper } from './components/ui/Stepper';
import type { Step } from './components/ui/Stepper';
import { SectionCard } from './components/ui/SectionCard';
import { EmptyState } from './components/ui/EmptyState';
import { Button } from './components/ui/Button';
import { Spinner } from './components/ui/Spinner';
import { ToastViewport } from './components/ui/ToastViewport';
import { ReceiptUpload } from './components/receipt/ReceiptUpload';
import { ItemsEditor } from './components/items/ItemsEditor';
import { PeopleManager } from './components/people/PeopleManager';
import { PersonCard } from './components/people/PersonCard';
import { SummaryPanel } from './components/summary/SummaryPanel';
import { PersonBreakdownCard } from './components/summary/PersonBreakdownCard';
import { FinalTextSummary } from './components/summary/FinalTextSummary';
import { PaymentInfo } from './components/summary/PaymentInfo';
import { AiSettingsModal } from './components/settings/AiSettingsModal';
import { IconButton } from './components/ui/IconButton';
import {
  GearIcon,
  ReceiptIcon,
  RefreshIcon,
  SparkleIcon,
  UsersIcon,
  WalletIcon,
} from './components/ui/icons';
import { formatToman } from './utils/persianNumbers';

const STEPS: Step[] = [
  { id: 'receipt', label: 'فاکتور' },
  { id: 'items', label: 'آیتم‌ها' },
  { id: 'people', label: 'افراد' },
  { id: 'split', label: 'تقسیم' },
  { id: 'summary', label: 'خلاصه' },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function App() {
  const hydrated = useInvoiceStore((s) => s.hydrated);
  const hydrate = useInvoiceStore((s) => s.hydrate);
  const resetSession = useInvoiceStore((s) => s.resetSession);
  const title = useInvoiceStore((s) => s.session.title);
  const setTitle = useInvoiceStore((s) => s.setTitle);
  const cardNumber = useInvoiceStore((s) => s.session.cardNumber);
  const people = useInvoiceStore((s) => s.session.people);
  const summary = useInvoiceSummary();
  useAutoSave();

  const [activeId, setActiveId] = useState('receipt');
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] },
    );
    STEPS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [hydrated]);

  const handleReset = () => {
    const ok = window.confirm(
      'آیا مطمئن هستید؟ تمام اطلاعات این فاکتور پاک شده و از نو شروع می‌کنید.',
    );
    if (ok) {
      resetSession();
      scrollToSection('receipt');
    }
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gold">
        <Spinner size={32} />
      </div>
    );
  }

  const hasPeople = people.length > 0;

  return (
    <div className="min-h-screen pb-24 sm:pb-10">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-base/70 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-bl from-gold-soft/30 to-gold-deep/15 text-gold">
                <ReceiptIcon width={24} height={24} />
              </div>
              <div>
                <h1 className="text-gold-gradient text-xl font-extrabold leading-tight">
                  تقسیم فاکتور
                </h1>
                <p className="text-xs text-faint">
                  صورت‌حساب را به‌سادگی بین دوستان تقسیم کنید
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <IconButton label="تنظیمات هوش مصنوعی" onClick={() => setSettingsOpen(true)}>
                <GearIcon width={20} height={20} />
              </IconButton>
              <Button
                variant="subtle"
                size="sm"
                icon={<RefreshIcon width={16} height={16} />}
                onClick={handleReset}
              >
                <span className="hidden sm:inline">شروع دوباره</span>
              </Button>
            </div>
          </div>
          <div className="mt-3">
            <Stepper steps={STEPS} activeId={activeId} onNavigate={scrollToSection} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-5 px-4 py-6">
        {/* Session title */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="عنوان جلسه (اختیاری) — مثلاً شام جمعه"
          className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-center text-cream outline-none transition-colors placeholder:text-faint focus:border-gold/40"
        />

        <SectionCard
          id="receipt"
          step={1}
          title="بارگذاری فاکتور"
          subtitle="عکس فاکتور را اضافه کنید یا مستقیماً به‌صورت دستی ادامه دهید"
        >
          <ReceiptUpload onOpenSettings={() => setSettingsOpen(true)} />
        </SectionCard>

        <SectionCard
          id="items"
          step={2}
          title="آیتم‌های فاکتور"
          subtitle="آیتم‌های استخراج‌شده را بررسی و در صورت نیاز اصلاح کنید"
        >
          <ItemsEditor />
        </SectionCard>

        <SectionCard
          id="people"
          step={3}
          title="افراد"
          subtitle="نام افرادی که در صورت‌حساب شریک هستند را وارد کنید"
        >
          <PeopleManager />
        </SectionCard>

        <SectionCard
          id="split"
          step={4}
          icon={<SparkleIcon width={22} height={22} />}
          title="تقسیم و انتخاب آیتم‌ها"
          subtitle="هر نفر آیتم‌های مصرف‌شده و موارد اضافه‌اش را مشخص کند"
        >
          {hasPeople ? (
            <div className="space-y-3">
              {people.map((person) => {
                const breakdown = summary.people.find((b) => b.personId === person.id);
                if (!breakdown) return null;
                return (
                  <PersonCard
                    key={person.id}
                    person={person}
                    breakdown={breakdown}
                    itemBased={summary.mode === 'item-based'}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<UsersIcon width={24} height={24} />}
              title="ابتدا افراد را اضافه کنید"
              description="برای تقسیم صورت‌حساب، حداقل یک نفر را در بخش «افراد» اضافه کنید."
              action={
                <Button variant="ghost" onClick={() => scrollToSection('people')}>
                  رفتن به بخش افراد
                </Button>
              }
            />
          )}
        </SectionCard>

        <SectionCard
          id="summary"
          step={5}
          icon={<WalletIcon width={22} height={22} />}
          title="خلاصه نهایی"
          subtitle="مبلغ نهایی هر نفر، لینک پرداخت و متن آماده ارسال"
        >
          {hasPeople ? (
            <div className="space-y-5">
              <SummaryPanel summary={summary} />
              <PaymentInfo />
              <div className="space-y-3">
                {summary.people.map((breakdown) => (
                  <PersonBreakdownCard key={breakdown.personId} breakdown={breakdown} />
                ))}
              </div>
              <FinalTextSummary summary={summary} title={title} cardNumber={cardNumber} />
            </div>
          ) : (
            <EmptyState
              icon={<WalletIcon width={24} height={24} />}
              title="هنوز خلاصه‌ای وجود ندارد"
              description="پس از افزودن افراد و آیتم‌ها، خلاصه نهایی اینجا نمایش داده می‌شود."
            />
          )}
        </SectionCard>

        <footer className="pt-2 text-center text-xs text-faint">
          همه‌ی اطلاعات فقط روی همین دستگاه و درون مرورگر شما ذخیره می‌شود.
        </footer>
      </main>

      {/* Mobile sticky total bar */}
      {hasPeople && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.08] bg-base/85 px-4 py-3 backdrop-blur-xl sm:hidden">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
            <div>
              <p className="text-xs text-faint">مجموع قابل پرداخت</p>
              <p className="text-gold-gradient font-extrabold">
                {formatToman(summary.grandTotal)}
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={<WalletIcon width={16} height={16} />}
              onClick={() => scrollToSection('summary')}
            >
              مشاهده خلاصه
            </Button>
          </div>
        </div>
      )}

      <AiSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ToastViewport />
    </div>
  );
}
