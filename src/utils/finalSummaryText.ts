import type { InvoiceSummary } from '../types';
import { formatToman, toPersianDigits } from './persianNumbers';
import { formatCardNumber } from './card';

const BULLET = '•';

interface SummaryTextOptions {
  title: string;
  cardNumber: string;
}

/**
 * Build the copyable Persian summary block (chat-friendly, with emojis).
 * Payment links and the card number stay as raw English-digit values.
 */
export function buildFinalSummaryText(
  summary: InvoiceSummary,
  { title, cardNumber }: SummaryTextOptions,
): string {
  const lines: string[] = [];

  lines.push('🧾 خلاصه فاکتور');
  if (title.trim()) lines.push(`✨ ${title.trim()}`);
  lines.push('');
  lines.push(`🧮 مجموع کل قابل پرداخت: ${formatToman(summary.grandTotal)}`);
  if (summary.mode === 'equal') {
    lines.push('⚖️ (تقسیم مساوی بین همه)');
  }
  lines.push('');
  lines.push('━━━━━━━━━━━━━━');

  summary.people.forEach((p) => {
    lines.push(`👤 ${p.personName || 'بدون نام'} — ${formatToman(p.finalPayableAmount)}`);

    if (p.items.length > 0) {
      lines.push('🍽️ آیتم‌ها:');
      p.items.forEach((it) => {
        const qty = it.quantity > 1 ? ` × ${toPersianDigits(it.quantity)}` : '';
        lines.push(`${BULLET} ${it.itemName}${qty}: ${formatToman(it.shareAmount)}`);
      });
    }

    if (p.extraItems.length > 0) {
      lines.push('➕ موارد اضافه:');
      p.extraItems.forEach((e) => {
        lines.push(`${BULLET} ${e.name || 'بدون عنوان'}: ${formatToman(e.amount)}`);
      });
    }

    if (p.paymentLink) {
      lines.push('💳 لینک پرداخت:');
      lines.push(p.paymentLink);
    } else {
      lines.push('✅ نیازی به پرداخت نیست');
    }

    lines.push('━━━━━━━━━━━━━━');
  });

  const card = formatCardNumber(cardNumber);
  if (card) {
    lines.push('🏧 پرداخت کارت‌به‌کارت (برای کسانی که آنلاین نمی‌توانند):');
    lines.push(`💳 ${card}`);
    lines.push('');
  }

  return lines.join('\n').trim() + '\n';
}
