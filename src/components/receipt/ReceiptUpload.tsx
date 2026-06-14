import { useRef, useState } from 'react';
import { useInvoiceStore } from '../../store/invoiceStore';
import { useImageUpload } from '../../hooks/useImageUpload';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { ExtractBar } from './ExtractBar';
import { CameraIcon, ImageIcon, TrashIcon, UploadIcon } from '../ui/icons';
import { cn } from '../../utils/cn';

export function ReceiptUpload({ onOpenSettings }: { onOpenSettings: () => void }) {
  const image = useInvoiceStore((s) => s.receiptImageDataUrl);
  const removeImage = useInvoiceStore((s) => s.removeImage);
  const { handleFile, processing } = useImageUpload();

  const uploadRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div className="space-y-4">
      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      {image ? (
        <div className="relative overflow-hidden rounded-2xl border border-white/10">
          <img
            src={image}
            alt="عکس فاکتور"
            className="max-h-[440px] w-full bg-black/40 object-contain"
          />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3">
            <Button
              size="sm"
              variant="ghost"
              icon={<UploadIcon width={16} height={16} />}
              onClick={() => uploadRef.current?.click()}
            >
              تعویض عکس
            </Button>
            <Button
              size="sm"
              variant="danger"
              icon={<TrashIcon width={16} height={16} />}
              onClick={() => removeImage()}
            >
              حذف عکس
            </Button>
          </div>
          {processing && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 text-cream">
              <Spinner size={22} />
              <span>در حال پردازش تصویر…</span>
            </div>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            'flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed px-6 py-10 text-center transition-colors duration-200',
            dragging ? 'border-gold/60 bg-gold/[0.06]' : 'border-white/15 bg-white/[0.02]',
          )}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-bl from-gold-soft/25 to-gold-deep/10 text-gold">
            {processing ? <Spinner size={26} /> : <ImageIcon width={28} height={28} />}
          </div>
          <div>
            <p className="text-cream">عکس فاکتور را بارگذاری کنید</p>
            <p className="mt-1 text-sm text-faint">
              فرمت‌های تصویری تا حجم ۱۵ مگابایت — یا فایل را اینجا رها کنید
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              variant="primary"
              icon={<UploadIcon width={18} height={18} />}
              onClick={() => uploadRef.current?.click()}
              disabled={processing}
            >
              بارگذاری عکس فاکتور
            </Button>
            <Button
              variant="ghost"
              icon={<CameraIcon width={18} height={18} />}
              onClick={() => cameraRef.current?.click()}
              disabled={processing}
            >
              گرفتن عکس با دوربین
            </Button>
          </div>
        </div>
      )}

      <ExtractBar hasImage={!!image} processing={processing} onOpenSettings={onOpenSettings} />
    </div>
  );
}
