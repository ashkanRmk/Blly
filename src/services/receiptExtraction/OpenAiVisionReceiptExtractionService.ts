import type { ExtractedItem, ReceiptExtractionService } from './types';
import { toInt } from '../../utils/money';
import { parseAmount } from '../../utils/persianNumbers';

export type ExtractionErrorCode =
  | 'missing-key'
  | 'auth'
  | 'rate-limit'
  | 'network'
  | 'bad-response';

export class ExtractionError extends Error {
  constructor(
    public readonly code: ExtractionErrorCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = 'ExtractionError';
  }
}

interface Options {
  apiKey: string;
  baseUrl: string;
  model: string;
}

const SYSTEM_PROMPT = `You are a precise receipt parser. The receipt image is usually in Persian (Farsi).
Extract only the purchased line items. Return ONLY a JSON object — no markdown, no commentary — in EXACTLY this shape:
{"items":[{"name": string, "quantity": integer, "price": integer}]}
Rules:
- "name": the item name, in Persian exactly as printed.
- "quantity": an integer >= 1 (default 1 when not shown).
- "price": the UNIT price in Toman as a plain integer with NO thousands separators and NO currency words. If only a line total is printed, divide it by the quantity to get the unit price.
- Convert any Persian/Arabic digits to plain integers.
- Ignore non-item lines such as tax, VAT, service charge, discount, subtotal, grand total, table number, date, address.
- If you cannot read any items, return {"items":[]}.`;

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new ExtractionError('bad-response'));
    reader.readAsDataURL(blob);
  });
}

/** Map one raw object from the model into a clean ExtractedItem (or null to drop it). */
function mapItem(raw: unknown): ExtractedItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const name = String(o.name ?? '').trim();
  const quantity = Math.max(1, Math.round(parseAmount(String(o.quantity ?? 1)) || 1));
  const unitPrice = toInt(parseAmount(String(o.price ?? o.unitPrice ?? 0)));
  if (!name && unitPrice === 0) return null;
  return { name, quantity, unitPrice, totalPrice: toInt(quantity * unitPrice) };
}

/** Parse the model's JSON content (tolerating ```json fences) into items. */
function parseItems(content: string): ExtractedItem[] {
  const cleaned = content
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/, '')
    .trim();
  let json: unknown;
  try {
    json = JSON.parse(cleaned);
  } catch {
    throw new ExtractionError('bad-response');
  }
  const list = Array.isArray(json)
    ? json
    : (json as { items?: unknown })?.items;
  if (!Array.isArray(list)) throw new ExtractionError('bad-response');
  return list.map(mapItem).filter((i): i is ExtractedItem => i !== null);
}

/**
 * Receipt extraction via an OpenAI-compatible Chat Completions vision endpoint.
 * Called directly from the browser with the user's own API key.
 */
export class OpenAiVisionReceiptExtractionService implements ReceiptExtractionService {
  constructor(private readonly options: Options) {}

  async extract(image: string | Blob): Promise<ExtractedItem[]> {
    const apiKey = this.options.apiKey.trim();
    if (!apiKey) throw new ExtractionError('missing-key');

    const dataUrl = typeof image === 'string' ? image : await blobToDataUrl(image);
    const url = `${this.options.baseUrl.trim().replace(/\/+$/, '')}/chat/completions`;

    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: this.options.model,
          temperature: 0,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'آیتم‌های این فاکتور را استخراج کن.' },
                { type: 'image_url', image_url: { url: dataUrl } },
              ],
            },
          ],
        }),
      });
    } catch {
      throw new ExtractionError('network');
    }

    if (res.status === 401 || res.status === 403) throw new ExtractionError('auth');
    if (res.status === 429) throw new ExtractionError('rate-limit');
    if (!res.ok) throw new ExtractionError('bad-response', `HTTP ${res.status}`);

    let payload: { choices?: Array<{ message?: { content?: string } }> };
    try {
      payload = await res.json();
    } catch {
      throw new ExtractionError('bad-response');
    }

    const content = payload?.choices?.[0]?.message?.content;
    if (!content) throw new ExtractionError('bad-response');

    return parseItems(content);
  }
}
