export type LedgerPartyKind = 'customers' | 'suppliers';

export type DebtDirection = 'given' | 'taken'; // given = أعطيت (فلوس ليا), taken = أخذت (فلوس عليا)

export type BottomNavTab = 'debts' | 'cashbook' | 'more';

export type LedgerFilterStatus = 'الكل' | 'أعطيت' | 'أخذت';

export type LedgerSortOrder = 'الافتراضي' | 'الأقدم' | 'الأعلى مبلغاً';

export interface DebtTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  direction: DebtDirection;
  amount: number;
  note?: string;
}

export interface LedgerContact {
  id: string;
  kind: LedgerPartyKind;
  name: string;
  phone?: string;
  lastDate: string; // YYYY-MM-DD
  transactions: DebtTransaction[];
}

export type CashDirection = 'in' | 'out'; // in = وارد (قبض), out = صادر (صرف)

export interface CashbookEntry {
  id: string;
  date: string; // YYYY-MM-DD
  direction: CashDirection;
  amount: number;
  category: string;
  note: string;
}

export interface WorkspaceLedger {
  id: string;
  title: string;
  currency: string;
  contacts: LedgerContact[];
  cashbook: CashbookEntry[];
}

export interface AppDataState {
  activeLedgerId: string;
  ledgers: WorkspaceLedger[];
  privacyMasked: boolean;
}

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
