# Blly.ir

A frontend-only web app for splitting a restaurant/cafe receipt between people. Persian UI, RTL, dark-luxury theme. Everything runs in the browser — no backend, no database, no login.

## Features

- Upload or photograph a receipt; extract items with **AI** (OpenAI-compatible vision, bring your own key) or a built-in sample mode.
- Add / edit / delete line items manually; totals auto-calculate from quantity × unit price.
- Add people; pick **how many units** of each item each person had (claimed units deplete for others).
- Per-person extra items (tip, delivery, …) included in their total.
- Equal split by default, then exact item-based amounts.
- PayPing payment link per person + an optional card number for card-to-card transfers.
- Copyable Persian summary for sharing in a group chat.
- Auto-saved in the browser (localStorage + IndexedDB); reset to start over.

## Tech stack

React 18 · TypeScript · Vite 6 · Tailwind CSS v4 · Zustand · Vazirmatn font.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # serve the build
```

## Deploy with Docker

```bash
docker build -t bill-dong .
docker run -d -p 8080:80 bill-dong   # http://localhost:8080
# or: docker compose up -d --build
```

Multi-stage build (Node → Nginx); serves the static `dist/` output.

## AI extraction (optional)

Open the gear icon in the header → enable **AI**, then enter your API key, model (default `gpt-4o-mini`), and base URL (default `https://api.openai.com/v1`; OpenRouter / local / proxy also work). The receipt image is sent directly from your browser to the chosen provider, and the key is stored only in `localStorage`.

## Project structure

```
src/
  components/  receipt · items · people · summary · settings · ui
  hooks/       useImageUpload · useAutoSave · useCopyToClipboard
  services/    receiptExtraction (Mock + OpenAI vision) · storage
  store/       invoiceStore · settingsStore · toastStore · selectors
  utils/       calculations · money · paymentLinks · persianNumbers · finalSummaryText · card · image
```
