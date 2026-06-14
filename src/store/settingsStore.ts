import { create } from 'zustand';

export interface AiSettings {
  /** 'mock' = built-in sample extraction, 'openai' = OpenAI-compatible vision API. */
  provider: 'mock' | 'openai';
  apiKey: string;
  baseUrl: string;
  model: string;
}

const KEY = 'bill-dong:ai-settings:v1';

const DEFAULTS: AiSettings = {
  provider: 'mock',
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
};

function load(): AiSettings {
  const envKey = ((import.meta.env as Record<string, string | undefined>)
    .VITE_OPENAI_API_KEY ?? '').trim();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      return envKey ? { ...DEFAULTS, apiKey: envKey, provider: 'openai' } : { ...DEFAULTS };
    }
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<AiSettings>) };
  } catch {
    return { ...DEFAULTS };
  }
}

function persist(settings: AiSettings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    /* ignore quota/availability errors */
  }
}

interface SettingsState extends AiSettings {
  setSettings: (patch: Partial<AiSettings>) => void;
  clear: () => void;
}

function pick(s: AiSettings): AiSettings {
  return { provider: s.provider, apiKey: s.apiKey, baseUrl: s.baseUrl, model: s.model };
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...load(),
  setSettings: (patch) => {
    const next = { ...pick(get()), ...patch };
    persist(next);
    set(next);
  },
  clear: () => {
    persist({ ...DEFAULTS });
    set({ ...DEFAULTS });
  },
}));

/** Snapshot of just the settings (non-reactive) for service construction. */
export function getAiSettings(): AiSettings {
  return pick(useSettingsStore.getState());
}
