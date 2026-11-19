import type { DebtDirection, LedgerContact } from '../types';

export function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getOffsetDateISO(daysOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDaysElapsed(dateISO: string): number {
  if (!dateISO) return 0;
  const [y, m, d] = dateISO.split('-').map(Number);
  if (!y || !m || !d) return 0;
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = today.getTime() - target.getTime();
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}

export function formatDaysElapsedArabic(days: number): string {
  if (days <= 0) return 'اليوم';
  if (days === 1) return 'مضى يوم واحد';
  if (days === 2) return 'مضت يومان';
  if (days <= 10) return `مضت ${days} أيام`;
  return `مضت ${days} يوماً`;
}

export function formatLedgerDaysSubtitle(days: number): string {
  if (days <= 0) return 'اليوم';
  if (days === 1) return 'منذ يوم واحد';
  return `مضت ${days} أيام`;
}

export function formatAmount(
  amount: number,
  currency: string,
  masked = false
): string {
  if (masked) return `*** ${currency}`;
  const safe = Number.isFinite(amount) ? amount : 0;
  const fixed = safe.toFixed(1);
  return `${fixed} ${currency}.`;
}

export function formatPlainNumber(amount: number, masked = false): string {
  if (masked) return '***';
  const safe = Number.isFinite(amount) ? amount : 0;
  return safe.toFixed(1);
}

export function formatArabicDate(dateISO: string): string {
  if (!dateISO) return '—';
  const [y, m, d] = dateISO.split('-').map(Number);
  if (!y || !m || !d) return dateISO;
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function computeContactBalance(contact: LedgerContact): {
  netAmount: number;
  direction: DebtDirection;
  absAmount: number;
} {
  // Positive net = given (فلوس ليا / أعطيت), Negative net = taken (فلوس عليا / أخذت)
  const net = contact.transactions.reduce((sum, txn) => {
    return txn.direction === 'given' ? sum + txn.amount : sum - txn.amount;
  }, 0);

  if (net >= 0) {
    return { netAmount: net, direction: 'given', absAmount: net };
  }
  return { netAmount: net, direction: 'taken', absAmount: Math.abs(net) };
}

export function getFirstArabicChar(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0) : '؟';
}

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function normalizeEgyptianWhatsAppPhone(raw: string): string | null {
  const cleaned = raw.replace(/[\s\-().+]/g, '');
  if (!cleaned) return null;

  let digits = cleaned;
  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }

  // Egyptian mobile format: 01xxxxxxxxx (11 digits) -> 201xxxxxxxxx
  if (/^01[0125]\d{8}$/.test(digits)) {
    return `2${digits}`;
  }

  // Egyptian mobile without leading 0: 10xxxxxxxx / 11xxxxxxxx / 12xxxxxxxx / 15xxxxxxxx
  if (/^1[0125]\d{8}$/.test(digits)) {
    return `20${digits}`;
  }

  // Generic international digits (e.g. 201xxxxxxxxx or 9665xxxxxxxx)
  if (/^\d{8,15}$/.test(digits)) {
    return digits;
  }

  return null;
}

export function validatePhoneNumber(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null; // Optional field
  const normalized = normalizeEgyptianWhatsAppPhone(trimmed);
  if (!normalized) {
    return 'يرجى إدخال رقم هاتف صحيح (مثل: 01012345678 أو برمز الدولة).';
  }
  return null;
}

export function buildWhatsAppUrl(phone: string | undefined, message: string): string {
  const encoded = encodeURIComponent(message);
  const formatted = phone ? normalizeEgyptianWhatsAppPhone(phone) : null;
  if (formatted) {
    return `https://wa.me/${formatted}?text=${encoded}`;
  }
  return `https://wa.me/?text=${encoded}`;
}

