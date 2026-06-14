import { useInvoiceStore } from '../../store/invoiceStore';
import { useToastStore } from '../../store/toastStore';
import { useSettingsStore } from '../../store/settingsStore';
import {
  ExtractionError,
  getReceiptExtractionService,
} from '../../services/receiptExtraction';
import { toPersianDigits } from '../../utils/persianNumbers';
import { Button } from '../ui/Button';
import { Banner } from '../ui/Banner';
import { Spinner } from '../ui/Spinner';
import { SparkleIcon } from '../ui/icons';

interface ExtractBarProps {
  hasImage: boolean;
  processing: boolean;
  onOpenSettings: () => void;
}

function ExtractionSkeleton() {
  return (
    <div className="space-y-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="skeleton h-14 rounded-2xl" />
      ))}
    </div>
  );
}

function errorMessage(e: unknown): string {
  const code = e instanceof ExtractionError ? e.code : undefined;
  switch (code) {
    case 'missing-key':
      return 'کلید API تنظیم نشده است؛ از تنظیمات یک کلید وارد کنید.';
    case 'auth':
      return 'کلید API نامعتبر است یا دسترسی ندارد.';
    case 'rate-limit':
      return 'محدودیت تعداد درخواست؛ کمی بعد دوباره تلاش کنید.';
    case 'network':
      return 'ارتباط با سرویس برقرار نشد؛ اتصال اینترنت یا آدرس سرویس را بررسی کنید.';
    case 'bad-response':
      return 'پاسخ سرویس قابل پردازش نبود؛ دوباره تلاش کنید یا دستی وارد کنید.';
    default:
      return 'استخراج آیتم‌ها ناموفق بود؛ می‌توانید دوباره تلاش کنید یا دستی وارد کنید.';
  }
}

export function ExtractBar({ hasImage, processing, onOpenSettings }: ExtractBarProps) {
  const image = useInvoiceStore((s) => s.receiptImageDataUrl);
  const extraction = useInvoiceStore((s) => s.extraction);
  const setExtraction = useInvoiceStore((s) => s.setExtraction);
  const addExtractedItems = useInvoiceStore((s) => s.addExtractedItems);
  const notify = useToastStore((s) => s.notify);

  const provider = useSettingsStore((s) => s.provider);
  const apiKey = useSettingsStore((s) => s.apiKey);
  const aiConfigured = provider === 'openai' && apiKey.trim().length > 0;

  const loading = extraction.status === 'loading';

  const run = async () => {
    if (!image) return;
    setExtraction('loading');
    try {
      const service = getReceiptExtractionService();
      const items = await service.extract(image);
      if (items.length === 0) {
        setExtraction('idle');
        notify('آیتمی در فاکتور پیدا نشد؛ می‌توانید دستی اضافه کنید.', 'info');
        return;
      }
      addExtractedItems(items);
      setExtraction('success');
      notify(
        `${toPersianDigits(items.length)} آیتم استخراج شد؛ لطفاً بررسی و در صورت نیاز اصلاح کنید.`,
        'success',
      );
    } catch (e) {
      const msg = errorMessage(e);
      setExtraction('error', msg);
      notify(msg, 'error');
    }
  };

  return (
    <div className="space-y-3">
      <Button
        variant="primary"
        size="lg"
        block
        disabled={!hasImage || loading || processing}
        icon={loading ? <Spinner size={18} /> : <SparkleIcon width={20} height={20} />}
        onClick={run}
      >
        {loading
          ? aiConfigured
            ? 'در حال استخراج با هوش مصنوعی…'
            : 'در حال استخراج آیتم‌ها…'
          : aiConfigured
            ? 'استخراج با هوش مصنوعی'
            : 'استخراج آیتم‌ها'}
      </Button>

      {loading && <ExtractionSkeleton />}

      {extraction.status === 'error' && (
        <Banner tone="danger" title="استخراج ناموفق بود">
          {extraction.error ??
            'متن فاکتور به‌خوبی خوانده نشد. می‌توانید دوباره تلاش کنید یا آیتم‌ها را دستی وارد کنید.'}
        </Banner>
      )}

      {!hasImage && (
        <p className="text-center text-xs text-faint">
          برای استخراج خودکار، ابتدا عکس فاکتور را بارگذاری کنید. در غیر این صورت می‌توانید
          آیتم‌ها را به‌صورت دستی اضافه کنید.
        </p>
      )}

      {!aiConfigured && (
        <p className="text-center text-xs text-faint">
          استخراج فعلی نمونه است. برای استخراج واقعی از روی عکس،{' '}
          <button
            type="button"
            onClick={onOpenSettings}
            className="text-gold underline-offset-2 hover:underline"
          >
            هوش مصنوعی را در تنظیمات فعال کنید
          </button>
          .
        </p>
      )}
    </div>
  );
}
