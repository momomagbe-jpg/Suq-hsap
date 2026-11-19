import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  AppDataState,
  BottomNavTab,
  CashbookEntry,
  LedgerContact,
  ToastNotification,
  WorkspaceLedger,
} from './types';
import {
  loadAppData,
  resetAppDataToDemo,
  saveAppData,
} from './utils/storage';
import { generateId } from './utils/formatters';
import { Logo } from './components/Logo';
import {
  GuideBookIcon,
  NavCashbookWalletIcon,
  NavDebtsBookIcon,
  NavMoreGridIcon,
  PrivacyEyeIcon,
  SyncSwitchIcon,
} from './components/LedgerIcons';
import { DebtLedgerView } from './components/DebtLedgerView';
import { CashbookView } from './components/CashbookView';
import { MoreView } from './components/MoreView';
import { GuideModal, SwitchLedgerModal } from './components/HeaderModals';
import { ToastContainer } from './components/Toast';

export default function App() {
  const [appData, setAppData] = useState<AppDataState>(() => loadAppData());
  const [activeBottomTab, setActiveBottomTab] = useState<BottomNavTab>('debts');
  const [guideOpen, setGuideOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  useEffect(() => {
    saveAppData(appData);
  }, [appData]);

  const notify = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      const id = generateId('toast');
      setToasts((prev) => [...prev, { id, message, type }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3200);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const activeLedger = useMemo<WorkspaceLedger>(() => {
    return (
      appData.ledgers.find((l) => l.id === appData.activeLedgerId) ??
      appData.ledgers[0]
    );
  }, [appData]);

  const updateActiveLedger = useCallback(
    (updater: (ledger: WorkspaceLedger) => WorkspaceLedger) => {
      setAppData((prev) => ({
        ...prev,
        ledgers: prev.ledgers.map((l) =>
          l.id === prev.activeLedgerId ? updater(l) : l
        ),
      }));
    },
    []
  );

  const handleTogglePrivacy = useCallback(() => {
    setAppData((prev) => {
      const next = !prev.privacyMasked;
      return { ...prev, privacyMasked: next };
    });
    notify(
      !appData.privacyMasked ? 'تم إخفاء المبالغ للخصوصية' : 'تم إظهار المبالغ',
      'info'
    );
  }, [appData.privacyMasked, notify]);

  const handleAddContact = useCallback(
    (contact: LedgerContact) => {
      updateActiveLedger((ledger) => ({
        ...ledger,
        contacts: [contact, ...ledger.contacts],
      }));
    },
    [updateActiveLedger]
  );

  const handleUpdateContact = useCallback(
    (updated: LedgerContact) => {
      updateActiveLedger((ledger) => ({
        ...ledger,
        contacts: ledger.contacts.map((c) => (c.id === updated.id ? updated : c)),
      }));
    },
    [updateActiveLedger]
  );

  const handleDeleteContact = useCallback(
    (contactId: string) => {
      updateActiveLedger((ledger) => ({
        ...ledger,
        contacts: ledger.contacts.filter((c) => c.id !== contactId),
      }));
    },
    [updateActiveLedger]
  );

  const handleAddCashEntry = useCallback(
    (entry: CashbookEntry) => {
      updateActiveLedger((ledger) => ({
        ...ledger,
        cashbook: [entry, ...ledger.cashbook],
      }));
    },
    [updateActiveLedger]
  );

  const handleDeleteCashEntry = useCallback(
    (id: string) => {
      updateActiveLedger((ledger) => ({
        ...ledger,
        cashbook: ledger.cashbook.filter((e) => e.id !== id),
      }));
    },
    [updateActiveLedger]
  );

  const handleUpdateLedgerMeta = useCallback(
    (title: string, currency: string) => {
      updateActiveLedger((ledger) => ({ ...ledger, title, currency }));
    },
    [updateActiveLedger]
  );

  const handleSelectLedger = useCallback((id: string) => {
    setAppData((prev) => ({ ...prev, activeLedgerId: id }));
  }, []);

  const handleCreateLedger = useCallback((title: string) => {
    const newLedger: WorkspaceLedger = {
      id: generateId('ledger'),
      title,
      currency: 'ج.م',
      contacts: [],
      cashbook: [],
    };
    setAppData((prev) => ({
      ...prev,
      activeLedgerId: newLedger.id,
      ledgers: [...prev.ledgers, newLedger],
    }));
  }, []);

  const handleResetDemo = useCallback(() => {
    const fresh = resetAppDataToDemo();
    setAppData(fresh);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1C1917] flex flex-col">
      {/* Compact Sticky Top Header Bar */}
      <header className="sticky top-0 z-30 bg-[#F8F7F4]/95 backdrop-blur-md border-b border-[#E7E5E4]/80 no-print">
        <div className="max-w-[780px] mx-auto px-4 h-15 flex items-center justify-between gap-3">
          {/* Right Side (in RTL): Custom SVG Logo + Workspace Title */}
          <button
            type="button"
            onClick={() => setSwitcherOpen(true)}
            className="flex items-center gap-2.5 min-w-0 text-right group focus:outline-none"
          >
            <Logo size={36} className="shrink-0" />
            <span className="text-lg sm:text-xl font-extrabold text-[#1C1917] group-hover:text-[#3730A3] transition-colors truncate">
              {activeLedger.title}
            </span>
          </button>

          {/* Left Side (in RTL): 3 Compact Rounded Icon Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSwitcherOpen(true)}
              className="min-w-[44px] h-10 px-2.5 rounded-xl bg-[#3730A3] hover:bg-[#312E81] text-white flex flex-col items-center justify-center transition-colors"
              aria-label="تبديل ومزامنة الدفتر"
              title="تبديل ومزامنة الدفتر"
            >
              <SyncSwitchIcon className="w-4 h-4" />
              <span className="text-[9px] font-bold leading-none mt-0.5">المزامنة</span>
            </button>

            <button
              type="button"
              onClick={handleTogglePrivacy}
              className={`min-w-[44px] h-10 px-2.5 rounded-xl flex items-center justify-center transition-colors ${
                appData.privacyMasked
                  ? 'bg-[#C2410C] text-white'
                  : 'bg-[#3730A3] hover:bg-[#312E81] text-white'
              }`}
              aria-label={appData.privacyMasked ? 'إظهار المبالغ' : 'إخفاء المبالغ'}
              title={appData.privacyMasked ? 'إظهار المبالغ' : 'إخفاء المبالغ'}
            >
              <PrivacyEyeIcon masked={appData.privacyMasked} className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              className="min-w-[44px] h-10 px-2.5 rounded-xl bg-[#3730A3] hover:bg-[#312E81] text-white flex flex-col items-center justify-center transition-colors"
              aria-label="دليل الاستخدام"
              title="دليل الاستخدام"
            >
              <GuideBookIcon className="w-4 h-4" />
              <span className="text-[9px] font-bold leading-none mt-0.5">دليل</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Responsive Container */}
      <main className="flex-1 w-full max-w-[780px] mx-auto px-4 pt-3.5">
        {activeBottomTab === 'debts' && (
          <DebtLedgerView
            ledgerTitle={activeLedger.title}
            currency={activeLedger.currency}
            contacts={activeLedger.contacts}
            privacyMasked={appData.privacyMasked}
            onAddContact={handleAddContact}
            onUpdateContact={handleUpdateContact}
            onDeleteContact={handleDeleteContact}
            onNotify={notify}
          />
        )}

        {activeBottomTab === 'cashbook' && (
          <CashbookView
            ledgerTitle={activeLedger.title}
            currency={activeLedger.currency}
            entries={activeLedger.cashbook}
            privacyMasked={appData.privacyMasked}
            onAddEntry={handleAddCashEntry}
            onDeleteEntry={handleDeleteCashEntry}
            onNotify={notify}
          />
        )}

        {activeBottomTab === 'more' && (
          <MoreView
            ledger={activeLedger}
            privacyMasked={appData.privacyMasked}
            onTogglePrivacy={handleTogglePrivacy}
            onUpdateLedgerMeta={handleUpdateLedgerMeta}
            onOpenSwitcher={() => setSwitcherOpen(true)}
            onResetDemoData={handleResetDemo}
            onNotify={notify}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation Bar (3 Tabs) */}
      <nav
        aria-label="التنقل السفلي"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E7E5E4] no-print"
      >
        <div className="max-w-[780px] mx-auto grid grid-cols-3 h-16 items-center">
          <button
            type="button"
            onClick={() => setActiveBottomTab('debts')}
            className={`h-full flex flex-col items-center justify-center gap-0.5 transition-colors ${
              activeBottomTab === 'debts'
                ? 'text-[#3730A3]'
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            <NavDebtsBookIcon active={activeBottomTab === 'debts'} className="w-6 h-6" />
            <span className="text-[11px] font-bold whitespace-nowrap">دفتر الديون</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveBottomTab('cashbook')}
            className={`h-full flex flex-col items-center justify-center gap-0.5 transition-colors ${
              activeBottomTab === 'cashbook'
                ? 'text-[#3730A3]'
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            <NavCashbookWalletIcon active={activeBottomTab === 'cashbook'} className="w-6 h-6" />
            <span className="text-[11px] font-bold whitespace-nowrap">دفتر النقدية</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveBottomTab('more')}
            className={`h-full flex flex-col items-center justify-center gap-0.5 transition-colors ${
              activeBottomTab === 'more'
                ? 'text-[#3730A3]'
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            <NavMoreGridIcon active={activeBottomTab === 'more'} className="w-6 h-6" />
            <span className="text-[11px] font-bold whitespace-nowrap">المزيد</span>
          </button>
        </div>
      </nav>

      {/* Top Header Modals */}
      <GuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
      <SwitchLedgerModal
        isOpen={switcherOpen}
        onClose={() => setSwitcherOpen(false)}
        ledgers={appData.ledgers}
        activeLedgerId={activeLedger.id}
        onSelectLedger={handleSelectLedger}
        onCreateLedger={handleCreateLedger}
        onNotify={notify}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
