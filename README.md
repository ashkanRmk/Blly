# تقسیم فاکتور — Bill Dong

یک اپلیکیشن **کاملاً فرانت‌اند** برای تقسیم صورت‌حساب رستوران/کافه بین افراد.
عکس فاکتور را بارگذاری کنید، آیتم‌ها را استخراج/اصلاح کنید، افراد را اضافه کنید، هر نفر
آیتم‌های مصرف‌شده‌اش را انتخاب می‌کند و در پایان یک خلاصهٔ فارسی قابل‌کپی همراه با لینک
پرداخت PayPing برای هر نفر تولید می‌شود.

> A frontend-only restaurant bill splitter. Persian UI, RTL, Vazir font, dark-luxury theme.
> No backend, no database, no auth, no tests — everything runs in the browser.

---

## امکانات / Features

- 📷 بارگذاری عکس فاکتور یا گرفتن عکس با دوربین موبایل، همراه با پیش‌نمایش و فشرده‌سازی خودکار
- 🧾 استخراج آیتم‌ها از روی عکس با **هوش مصنوعی** (سرویس سازگار با OpenAI، با کلید اختصاصی شما) یا حالت نمونه + افزودن/ویرایش/حذف کامل دستی
- 👥 مدیریت افراد و نمایش لحظه‌ای مبلغ هر نفر
- ✅ انتخاب **تعداد** هر آیتم مصرف‌شده توسط هر نفر — با کاهش خودکار موجودی برای بقیه و سقفِ تعدادِ فاکتور
- ➕ موارد اضافهٔ اختصاصی برای هر نفر (انعام، ارسال و …) که در مجموع کل لحاظ می‌شود
- ⚖️ تقسیم مساوی به‌صورت پیش‌فرض، و سپس محاسبهٔ دقیق براساس آیتم‌ها
- 💳 لینک پرداخت PayPing برای هر نفر + شماره کارت برای پرداخت کارت‌به‌کارت
- 📋 خلاصهٔ فارسی قابل‌کپی همراه با اموجی برای ارسال در گروه
- 💾 ذخیرهٔ خودکار در مرورگر (localStorage + IndexedDB) و بازیابی پس از رفرش

## تکنولوژی / Stack

React 18 · TypeScript · Vite 6 · Tailwind CSS v4 · Zustand · Vazirmatn

---

## اجرا / Run locally

نیازمندی: Node 18+ (با Node 26 آزمایش شده).

```bash
npm install      # نصب وابستگی‌ها
npm run dev      # اجرای محیط توسعه → http://localhost:5173
```

ساخت نسخهٔ تولید و پیش‌نمایش آن:

```bash
npm run build    # tsc + vite build → خروجی در dist/
npm run preview  # سرو کردن خروجی build
```

### استقرار با Docker / Deploy with Docker

تصویر چنداستیجی است: مرحلهٔ ساخت با Node و سرو نهایی با Nginx.

```bash
# build و اجرا با docker
docker build -t bill-dong .
docker run -d --name bill-dong -p 8080:80 bill-dong
# → http://localhost:8080

# یا با docker compose
docker compose up -d --build   # روی پورت 8080
```

نکته: این یک اپ کاملاً فرانت‌اند است؛ کلید API هوش مصنوعی (در صورت استفاده) فقط در مرورگر
کاربر ذخیره می‌شود و داخل تصویر Docker قرار نمی‌گیرد.

---

## ساختار پروژه / Project structure

```
src/
  components/
    receipt/   ReceiptUpload, ExtractBar
    items/     ItemsEditor, ItemCard
    people/    PeopleManager, PersonCard, PersonItemSelection, ExtraItemsEditor
    summary/   SummaryPanel, PersonBreakdownCard, FinalTextSummary
    ui/        Card, Button, AmountField, Chip, Banner, Toast, Stepper, icons …
  hooks/       useImageUpload, useAutoSave, useCopyToClipboard
  services/
    receiptExtraction/   ReceiptExtractionService (interface) + MockReceiptExtractionService
    storage/             sessionStore (localStorage) + imageStore (IndexedDB)
  store/       invoiceStore (Zustand), selectors (derived summary), toastStore
  types/       domain model
  utils/       money, calculations, paymentLinks, persianNumbers, finalSummaryText, image
  styles/      index.css (Tailwind @theme + dark-luxury theme)
```

## نکات کلیدی / How it works

- **مبالغ صحیح (Toman) به‌صورت عدد صحیح** نگه‌داری می‌شوند تا خطای اعشاری رخ ندهد.
- **تقسیم عادلانه:** `splitEvenly(amount, n)` در `utils/calculations.ts` باقی‌ماندهٔ تقسیم را
  به‌صورت قطعی توزیع می‌کند تا جمع سهم‌ها همیشه دقیقاً برابر مبلغ آیتم باشد
  (مثال: ۱۰۰٬۰۰۰ بین ۳ نفر → ۳۳۳۳۴ / ۳۳۳۳۳ / ۳۳۳۳۳).
- **انتخاب براساس تعداد:** هر واحد از یک آیتم قیمت مشخص دارد؛ هر نفر برای تعدادی که برمی‌دارد
  پرداخت می‌کند و با انتخاب او، موجودی برای بقیه کم می‌شود. واحدهای انتخاب‌نشده «تخصیص داده نشده»
  می‌مانند.
- **حالت محاسبه:** تا وقتی هیچ آیتمی انتخاب نشده، تقسیم مساوی نمایش داده می‌شود؛ با اولین
  انتخاب، محاسبهٔ «براساس آیتم» مبنای مبلغ نهایی می‌شود. موارد اضافه همیشه به مبلغ نهایی
  افزوده می‌شوند.
- **لینک پرداخت:** پایهٔ `https://payping.ir/@rahmani/` + مبلغ نهایی با ارقام انگلیسی، بدون
  جداکننده/علامت. مبلغ صفر = «نیازی به پرداخت نیست».
- **استخراج با هوش مصنوعی:** از آیکن چرخ‌دنده در هدر، گزینهٔ «هوش مصنوعی» را فعال کرده و کلید
  API و مدل (پیش‌فرض `gpt-4o-mini`) و آدرس سرویس (پیش‌فرض `https://api.openai.com/v1`) را وارد
  کنید. درخواست مستقیماً از مرورگر به سرویس سازگار با OpenAI ارسال می‌شود و پاسخ به‌صورت
  JSON ثابت `{"items":[{name,quantity,price}]}` به آیتم‌ها نگاشت می‌شود. کلید فقط در
  `localStorage` همین مرورگر ذخیره می‌شود. به‌جای OpenAI می‌توان از OpenRouter، سرویس محلی یا
  یک پروکسی (در صورت محدودیت CORS) استفاده کرد.
- **تعویض موتور استخراج:** هر پیاده‌سازی دیگری از اینترفیس `ReceiptExtractionService` را می‌توان
  در `services/receiptExtraction/index.ts` جایگزین کرد.

## ایده‌های توسعه / Future ideas

- اتصال به سرویس واقعی Vision برای استخراج خودکار (با کلید اختصاصی کاربر)
- تاریخچهٔ چند فاکتور و امکان بازگشت به جلسات قبلی
- خروجی QR برای هر لینک پرداخت
- توزیع خودکار مالیات/حق سرویس بین افراد
- نصب به‌صورت PWA و کارکرد آفلاین
