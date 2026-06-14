import { MockReceiptExtractionService } from './MockReceiptExtractionService';
import { OpenAiVisionReceiptExtractionService } from './OpenAiVisionReceiptExtractionService';
import type { ReceiptExtractionService } from './types';
import { getAiSettings } from '../../store/settingsStore';

export type { ReceiptExtractionService, ExtractedItem } from './types';
export { ExtractionError } from './OpenAiVisionReceiptExtractionService';
export type { ExtractionErrorCode } from './OpenAiVisionReceiptExtractionService';

/** Whether a usable AI provider (key + provider) is configured. */
export function isAiConfigured(): boolean {
  const { provider, apiKey } = getAiSettings();
  return provider === 'openai' && apiKey.trim().length > 0;
}

/**
 * Returns the active extraction service based on the current settings.
 * AI when a key is configured, otherwise the built-in mock.
 */
export function getReceiptExtractionService(): ReceiptExtractionService {
  const { provider, apiKey, baseUrl, model } = getAiSettings();
  if (provider === 'openai' && apiKey.trim()) {
    return new OpenAiVisionReceiptExtractionService({ apiKey, baseUrl, model });
  }
  return new MockReceiptExtractionService({ delayMs: 1600, failureRate: 0 });
}
