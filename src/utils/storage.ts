import { createInitialAppData } from '../data/demoData';
import type { AppDataState } from '../types';

const STORAGE_KEY = 'khaznet_el_baraka_v1';

export function loadAppData(): AppDataState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createInitialAppData();
      saveAppData(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as Partial<AppDataState>;
    const fallback = createInitialAppData();
    if (!Array.isArray(parsed.ledgers) || parsed.ledgers.length === 0) {
      saveAppData(fallback);
      return fallback;
    }
    return {
      activeLedgerId: parsed.activeLedgerId ?? parsed.ledgers[0].id,
      ledgers: parsed.ledgers,
      privacyMasked: Boolean(parsed.privacyMasked),
    };
  } catch {
    const initial = createInitialAppData();
    saveAppData(initial);
    return initial;
  }
}

export function saveAppData(state: AppDataState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function resetAppDataToDemo(): AppDataState {
  const fresh = createInitialAppData();
  saveAppData(fresh);
  return fresh;
}
