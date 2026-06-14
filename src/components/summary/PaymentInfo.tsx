import { useInvoiceStore } from '../../store/invoiceStore';
import { formatCardNumber, parseCardDigits } from '../../utils/card';
import { WalletIcon } from '../ui/icons';

export function PaymentInfo() {
  const cardNumber = useInvoiceStore((s) => s.session.cardNumber);
  const setCardNumber = useInvoiceStore((s) => s.setCardNumber);

  return (
    <div className="space-y-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 text-sm text-muted">
        <WalletIcon width={18} height={18} className="text-gold" />
        اطلاعات پرداخت کارت‌به‌کارت (اختیاری)
      </div>
      <input
        value={formatCardNumber(cardNumber)}
        onChange={(e) => setCardNumber(parseCardDigits(e.target.value))}
        dir="ltr"
        inputMode="numeric"
        placeholder="شماره کارت ۱۶ رقمی"
        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-center tracking-widest text-cream outline-none transition-colors placeholder:text-faint focus:border-gold/40"
      />
      <p className="text-xs text-faint">
        این شماره کارت در انتهای خلاصه برای کسانی که نمی‌توانند آنلاین پرداخت کنند نمایش
        داده می‌شود.
      </p>
    </div>
  );
}
