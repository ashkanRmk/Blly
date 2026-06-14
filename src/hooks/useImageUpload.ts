import { useCallback, useState } from 'react';
import {
  fileToCompressedDataUrl,
  isImageFile,
  MAX_UPLOAD_BYTES,
} from '../utils/image';
import { useInvoiceStore } from '../store/invoiceStore';
import { useToastStore } from '../store/toastStore';

interface ImageUpload {
  processing: boolean;
  handleFile: (file: File | null | undefined) => Promise<void>;
}

/** Validate + compress a chosen receipt image and store it on the session. */
export function useImageUpload(): ImageUpload {
  const setReceiptImage = useInvoiceStore((s) => s.setReceiptImage);
  const notify = useToastStore((s) => s.notify);
  const [processing, setProcessing] = useState(false);

  const handleFile = useCallback(
    async (file: File | null | undefined) => {
      if (!file) return;
      if (!isImageFile(file)) {
        notify('فرمت فایل پشتیبانی نمی‌شود؛ لطفاً یک تصویر انتخاب کنید.', 'error');
        return;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        notify('حجم تصویر بیش از حد مجاز است (حداکثر ۱۵ مگابایت).', 'error');
        return;
      }
      setProcessing(true);
      try {
        const dataUrl = await fileToCompressedDataUrl(file);
        await setReceiptImage(dataUrl);
      } catch {
        notify('پردازش تصویر با خطا مواجه شد.', 'error');
      } finally {
        setProcessing(false);
      }
    },
    [notify, setReceiptImage],
  );

  return { processing, handleFile };
}
