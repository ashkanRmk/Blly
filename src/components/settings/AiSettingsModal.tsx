import { useSettingsStore } from '../../store/settingsStore';
import { Modal } from '../ui/Modal';
import { TextField } from '../ui/TextField';
import { Button } from '../ui/Button';
import { Banner } from '../ui/Banner';
import { cn } from '../../utils/cn';

interface AiSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function AiSettingsModal({ open, onClose }: AiSettingsModalProps) {
  const provider = useSettingsStore((s) => s.provider);
  const apiKey = useSettingsStore((s) => s.apiKey);
  const baseUrl = useSettingsStore((s) => s.baseUrl);
  const model = useSettingsStore((s) => s.model);
  const setSettings = useSettingsStore((s) => s.setSettings);
  const clear = useSettingsStore((s) => s.clear);

  const useAi = provider === 'openai';

  return (
    <Modal open={open} onClose={onClose} title="تنظیمات استخراج هوش مصنوعی">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-black/20 p-1">
          <button
            type="button"
            onClick={() => setSettings({ provider: 'mock' })}
            className={cn(
              'rounded-xl py-2 text-sm transition-colors',
              !useAi ? 'bg-white/10 font-semibold text-cream' : 'text-muted hover:text-cream',
            )}
          >
            حالت نمونه
          </button>
          <button
            type="button"
            onClick={() => setSettings({ provider: 'openai' })}
            className={cn(
              'rounded-xl py-2 text-sm transition-colors',
              useAi ? 'bg-gold/20 font-semibold text-gold' : 'text-muted hover:text-cream',
            )}
          >
            هوش مصنوعی
          </button>
        </div>

        {useAi ? (
          <>
            <TextField
              label="کلید API"
              type="password"
              dir="ltr"
              value={apiKey}
              placeholder="sk-..."
              autoComplete="off"
              onChange={(e) => setSettings({ apiKey: e.target.value })}
            />
            <TextField
              label="مدل"
              dir="ltr"
              value={model}
              placeholder="gpt-4o-mini"
              onChange={(e) => setSettings({ model: e.target.value })}
            />
            <TextField
              label="آدرس سرویس (Base URL)"
              dir="ltr"
              value={baseUrl}
              placeholder="https://api.openai.com/v1"
              hint="سازگار با OpenAI — برای OpenRouter، سرویس محلی یا پروکسی قابل تغییر است."
              onChange={(e) => setSettings({ baseUrl: e.target.value })}
            />
            <Banner tone="info" title="حریم خصوصی">
              کلید فقط در همین مرورگر ذخیره می‌شود و تنها هنگام استخراج، عکس فاکتور مستقیماً به
              سرویس انتخابی شما ارسال می‌گردد.
            </Banner>
            <Button variant="danger" block onClick={() => clear()}>
              حذف کلید و بازگشت به حالت نمونه
            </Button>
          </>
        ) : (
          <p className="text-sm text-faint">
            در «حالت نمونه»، چند آیتم آزمایشی برای نمایش جریان کار تولید می‌شود. برای استخراج
            واقعی از روی عکس فاکتور، گزینهٔ «هوش مصنوعی» را انتخاب کرده و کلید API خود را وارد
            کنید.
          </p>
        )}
      </div>
    </Modal>
  );
}
