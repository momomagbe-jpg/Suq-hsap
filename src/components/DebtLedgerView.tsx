import { useMemo, useState } from 'react';
import {
  Search,
  UserPlus,
  Plus,
  Minus,
  Pencil,
  Trash2,
  CheckCircle2,
  Phone,
  Printer,
  Download,
} from 'lucide-react';
import type {
  DebtDirection,
  DebtTransaction,
  LedgerContact,
  LedgerFilterStatus,
  LedgerPartyKind,
  LedgerSortOrder,
} from '../types';
import {
  computeContactBalance,
  formatAmount,
  formatArabicDate,
  formatLedgerDaysSubtitle,
  generateId,
  getDaysElapsed,
  getFirstArabicChar,
  getTodayISO,
  validatePhoneNumber,
} from '../utils/formatters';
import { exportContactsCsv } from '../utils/csvExport';
import {
  CollectionBellIcon,
  CustomerUserIcon,
  FilterSlidersIcon,
  PdfDocIcon,
  ReportsChartIcon,
  SupplierTruckIcon,
  WhatsAppIcon,
} from './LedgerIcons';
import { Modal } from './Modal';
import { ConfirmDialog } from './ConfirmDialog';
import { WhatsAppReminderModal } from './WhatsAppReminderModal';

interface DebtLedgerViewProps {
  ledgerTitle: string;
  currency: string;
  contacts: LedgerContact[];
  privacyMasked: boolean;
  onAddContact: (contact: LedgerContact) => void;
  onUpdateContact: (contact: LedgerContact) => void;
  onDeleteContact: (contactId: string) => void;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function DebtLedgerView({
  ledgerTitle,
  currency,
  contacts,
  privacyMasked,
  onAddContact,
  onUpdateContact,
  onDeleteContact,
  onNotify,
}: DebtLedgerViewProps) {
  const [partyKind, setPartyKind] = useState<LedgerPartyKind>('customers');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LedgerFilterStatus>('أعطيت');
  const [sortOrder, setSortOrder] = useState<LedgerSortOrder>('الافتراضي');

  // Modals
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [reportsModalOpen, setReportsModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  // Add Contact form
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDirection, setNewDirection] = useState<DebtDirection>('given');
  const [newDate, setNewDate] = useState(getTodayISO());
  const [newNote, setNewNote] = useState('');
  const [addError, setAddError] = useState('');

  // Contact Details: New Transaction & Edit
  const [txnModalDirection, setTxnModalDirection] = useState<DebtDirection | null>(null);
  const [txnAmount, setTxnAmount] = useState('');
  const [txnDate, setTxnDate] = useState(getTodayISO());
  const [txnNote, setTxnNote] = useState('');
  const [txnError, setTxnError] = useState('');

  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editError, setEditError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<LedgerContact | null>(null);
  const [reminderTarget, setReminderTarget] = useState<{
    contact: LedgerContact;
    amount: number;
    daysElapsed: number;
  } | null>(null);

  // Compute balances for active tab (customers vs suppliers)
  const activeKindContacts = useMemo(() => {
    return contacts
      .filter((c) => c.kind === partyKind)
      .map((c) => {
        const balance = computeContactBalance(c);
        const daysElapsed = getDaysElapsed(c.lastDate);
        return {
          contact: c,
          ...balance,
          daysElapsed,
        };
      });
  }, [contacts, partyKind]);

  // Totals for Summary Card
  const summaryTotals = useMemo(() => {
    let totalTaken = 0; // أخذت (فلوس عليا)
    let totalGiven = 0; // أعطيت (فلوس ليا)
    let countTaken = 0;
    let countGiven = 0;

    activeKindContacts.forEach((item) => {
      if (item.absAmount === 0) return;
      if (item.direction === 'taken') {
        totalTaken += item.absAmount;
        countTaken += 1;
      } else {
        totalGiven += item.absAmount;
        countGiven += 1;
      }
    });

    return {
      totalTaken,
      totalGiven,
      countTaken,
      countGiven,
      netBalance: totalGiven - totalTaken,
    };
  }, [activeKindContacts]);

  // Filtered & sorted list
  const visibleItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = activeKindContacts.filter((item) => {
      if (statusFilter === 'أعطيت' && (item.direction !== 'given' || item.absAmount === 0)) {
        return false;
      }
      if (statusFilter === 'أخذت' && (item.direction !== 'taken' || item.absAmount === 0)) {
        return false;
      }
      if (!q) return true;
      return (
        item.contact.name.toLowerCase().includes(q) ||
        (item.contact.phone ?? '').toLowerCase().includes(q)
      );
    });

    if (sortOrder === 'الأقدم') {
      return [...filtered].sort((a, b) => b.daysElapsed - a.daysElapsed);
    }
    if (sortOrder === 'الأعلى مبلغاً') {
      return [...filtered].sort((a, b) => b.absAmount - a.absAmount);
    }
    return filtered;
  }, [activeKindContacts, searchQuery, statusFilter, sortOrder]);

  const receivablesList = useMemo(() => {
    return activeKindContacts
      .filter((item) => item.direction === 'given' && item.absAmount > 0)
      .sort((a, b) => b.daysElapsed - a.daysElapsed);
  }, [activeKindContacts]);

  const selectedContactEntry = useMemo(
    () => activeKindContacts.find((i) => i.contact.id === selectedContactId) ?? null,
    [activeKindContacts, selectedContactId]
  );

  const kindLabel = partyKind === 'customers' ? 'العملاء' : 'الموردين';
  const singularLabel = partyKind === 'customers' ? 'عميل' : 'مورد';

  const handlePartySwitch = (kind: LedgerPartyKind) => {
    setPartyKind(kind);
    setSelectedContactId(null);
    setSearchQuery('');
    // When switching to suppliers, show 'الكل' by default since suppliers often have both أخذت & أعطيت
    setStatusFilter(kind === 'customers' ? 'أعطيت' : 'الكل');
  };

  const openAddModal = () => {
    setNewName('');
    setNewPhone('');
    setNewAmount('');
    setNewDirection(partyKind === 'customers' ? 'given' : 'taken');
    setNewDate(getTodayISO());
    setNewNote('');
    setAddError('');
    setAddModalOpen(true);
  };

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    const amt = Number(newAmount);
    if (!newName.trim()) {
      setAddError(`يرجى إدخال اسم ال${singularLabel}.`);
      return;
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      setAddError('يرجى إدخال مبلغ صحيح أكبر من صفر.');
      return;
    }
    if (!newDate) {
      setAddError('يرجى تحديد التاريخ.');
      return;
    }
    const phoneErr = validatePhoneNumber(newPhone);
    if (phoneErr) {
      setAddError(phoneErr);
      return;
    }

    const contact: LedgerContact = {
      id: generateId(partyKind === 'customers' ? 'c' : 's'),
      kind: partyKind,
      name: newName.trim(),
      phone: newPhone.trim() || undefined,
      lastDate: newDate,
      transactions: [
        {
          id: generateId('txn'),
          date: newDate,
          direction: newDirection,
          amount: amt,
          note: newNote.trim() || undefined,
        },
      ],
    };

    onAddContact(contact);
    // Ensure newly added item is visible under active filter
    if (
      (newDirection === 'given' && statusFilter === 'أخذت') ||
      (newDirection === 'taken' && statusFilter === 'أعطيت')
    ) {
      setStatusFilter('الكل');
    }
    setAddModalOpen(false);
    onNotify(`تمت إضافة ${contact.name} بنجاح`);
  };

  const openContactDetails = (contact: LedgerContact) => {
    setSelectedContactId(contact.id);
    setEditMode(false);
    setEditName(contact.name);
    setEditPhone(contact.phone ?? '');
    setEditError('');
    setTxnModalDirection(null);
    setTxnError('');
  };

  const handleSaveContactEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    if (!selectedContactEntry || !editName.trim()) return;
    const phoneErr = validatePhoneNumber(editPhone);
    if (phoneErr) {
      setEditError(phoneErr);
      return;
    }
    onUpdateContact({
      ...selectedContactEntry.contact,
      name: editName.trim(),
      phone: editPhone.trim() || undefined,
    });
    setEditMode(false);
    onNotify('تم تحديث بيانات الحساب');
  };

  const openNewTransaction = (direction: DebtDirection) => {
    setTxnModalDirection(direction);
    setTxnAmount('');
    setTxnDate(getTodayISO());
    setTxnNote('');
    setTxnError('');
  };

  const handleRecordTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    setTxnError('');
    if (!selectedContactEntry || !txnModalDirection) return;
    const amt = Number(txnAmount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setTxnError('يرجى إدخال مبلغ صحيح أكبر من صفر.');
      return;
    }
    if (!txnDate) {
      setTxnError('يرجى تحديد التاريخ.');
      return;
    }

    const newTxn: DebtTransaction = {
      id: generateId('txn'),
      date: txnDate,
      direction: txnModalDirection,
      amount: amt,
      note: txnNote.trim() || undefined,
    };

    const current = selectedContactEntry.contact;
    const nextLastDate = txnDate > current.lastDate ? txnDate : current.lastDate;
    onUpdateContact({
      ...current,
      lastDate: nextLastDate,
      transactions: [newTxn, ...current.transactions],
    });
    setTxnModalDirection(null);
    onNotify('تم تسجيل الحركة وتحديث الرصيد');
  };

  const handleDeleteTransaction = (txnId: string) => {
    if (!selectedContactEntry) return;
    const current = selectedContactEntry.contact;
    const remainingTxns = current.transactions.filter((t) => t.id !== txnId);
    const latestDate =
      remainingTxns.length > 0
        ? remainingTxns.reduce((max, t) => (t.date > max ? t.date : max), remainingTxns[0].date)
        : current.lastDate;
    onUpdateContact({
      ...current,
      lastDate: latestDate,
      transactions: remainingTxns,
    });
    onNotify('تم حذف الحركة من السجل', 'info');
  };

  const handleQuickCollect = (contact: LedgerContact, amountToCollect: number) => {
    const today = getTodayISO();
    const collectionTxn: DebtTransaction = {
      id: generateId('txn'),
      date: today,
      direction: 'taken',
      amount: amountToCollect,
      note: 'تحصيل دين كامل',
    };
    onUpdateContact({
      ...contact,
      lastDate: today,
      transactions: [collectionTxn, ...contact.transactions],
    });
    onNotify(`تم تحصيل ${formatAmount(amountToCollect, currency)} من ${contact.name}`);
  };

  const handleSavePhoneForContact = (contactId: string, phone: string) => {
    const target = contacts.find((c) => c.id === contactId);
    if (!target) return;
    const updated = { ...target, phone: phone.trim() || undefined };
    onUpdateContact(updated);
    setReminderTarget((prev) =>
      prev && prev.contact.id === contactId ? { ...prev, contact: updated } : prev
    );
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const hasCustomFilter = statusFilter !== 'الكل' || sortOrder !== 'الافتراضي';

  return (
    <div className="space-y-3.5 pb-28">
      {/* Segmented Switch: العملاء vs الموردين */}
      <div className="bg-white border border-[#E7E5E4] rounded-2xl p-1.5 grid grid-cols-2 gap-1.5 shadow-xs no-print">
        <button
          type="button"
          onClick={() => handlePartySwitch('customers')}
          className={`min-h-[44px] flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${
            partyKind === 'customers'
              ? 'bg-[#3730A3] text-white shadow-xs'
              : 'text-[#1C1917] hover:bg-[#F8F7F4]'
          }`}
        >
          <CustomerUserIcon className="w-5 h-5 shrink-0" />
          <span>العملاء</span>
        </button>

        <button
          type="button"
          onClick={() => handlePartySwitch('suppliers')}
          className={`min-h-[44px] flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${
            partyKind === 'suppliers'
              ? 'bg-[#3730A3] text-white shadow-xs'
              : 'text-[#1C1917] hover:bg-[#F8F7F4]'
          }`}
        >
          <SupplierTruckIcon className="w-5 h-5 shrink-0" />
          <span>الموردين</span>
        </button>
      </div>

      {/* Financial Summary Card */}
      <section
        aria-label="ملخص الديون"
        className="bg-white border border-[#E7E5E4] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between gap-4 no-print"
      >
        {/* Right Side (in RTL): Stacked Metrics (أخذت + أعطيت) */}
        <div className="space-y-2.5 min-w-0">
          <button
            type="button"
            onClick={() =>
              setStatusFilter((prev) => (prev === 'أخذت' ? 'الكل' : 'أخذت'))
            }
            className="block text-right group focus:outline-none"
            title="اضغط للتصفية على أخذت"
          >
            <div className="text-sm sm:text-base font-bold text-[#1C1917] group-hover:text-[#15803D] transition-colors">
              أخذت
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-[#15803D] tabular-nums leading-tight mt-0.5">
              {formatAmount(summaryTotals.totalTaken, currency, privacyMasked)}
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setStatusFilter((prev) => (prev === 'أعطيت' ? 'الكل' : 'أعطيت'))
            }
            className="block text-right group focus:outline-none"
            title="اضغط للتصفية على أعطيت"
          >
            <div className="text-sm sm:text-base font-bold text-[#DC2626] group-hover:opacity-80 transition-opacity">
              أعطيت
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-[#DC2626] tabular-nums leading-tight mt-0.5">
              {formatAmount(summaryTotals.totalGiven, currency, privacyMasked)}
            </div>
          </button>
        </div>

        {/* Left Side (in RTL): Action Icon Tiles (تحصيل الديون + التقارير) */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <button
            type="button"
            onClick={() => setCollectionModalOpen(true)}
            className="flex flex-col items-center gap-1.5 group focus:outline-none"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#EEF2FF] text-[#3730A3] group-hover:bg-[#E0E7FF] transition-colors flex items-center justify-center">
              <CollectionBellIcon className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-[#1C1917] whitespace-nowrap">
              تحصيل الديون
            </span>
          </button>

          <button
            type="button"
            onClick={() => setReportsModalOpen(true)}
            className="flex flex-col items-center gap-1.5 group focus:outline-none"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#EEF2FF] text-[#3730A3] group-hover:bg-[#E0E7FF] transition-colors flex items-center justify-center">
              <ReportsChartIcon className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-[#1C1917] whitespace-nowrap">
              التقارير
            </span>
          </button>
        </div>
      </section>

      {/* Section Counter */}
      <div className="flex items-center justify-between px-1 pt-1 no-print">
        <h2 className="text-sm sm:text-base font-extrabold text-[#1C1917] tabular-nums">
          {kindLabel} ({visibleItems.length}، {statusFilter})
        </h2>
        {hasCustomFilter && statusFilter !== 'الكل' && (
          <button
            type="button"
            onClick={() => {
              setStatusFilter('الكل');
              setSortOrder('الافتراضي');
            }}
            className="text-xs font-semibold text-[#3730A3] hover:underline"
          >
            عرض الكل
          </button>
        )}
      </div>

      {/* Search & Action Row (البحث + تصفية + PDF) */}
      <div className="flex items-center gap-2 no-print">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#57534E] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث"
            aria-label="البحث بالاسم"
            className="w-full min-h-[46px] pr-10 pl-3 text-sm bg-white border border-[#E7E5E4] rounded-xl text-[#1C1917] placeholder:text-[#57534E] focus:outline-none focus:border-[#3730A3] transition-colors"
          />
        </div>

        <button
          type="button"
          onClick={() => setFilterModalOpen(true)}
          className="relative min-w-[46px] min-h-[46px] rounded-xl bg-[#EEF2FF] text-[#3730A3] hover:bg-[#E0E7FF] transition-colors flex items-center justify-center shrink-0"
          aria-label="تصفية وترتيب"
          title="تصفية وترتيب"
        >
          <FilterSlidersIcon className="w-5 h-5" />
          {hasCustomFilter && (
            <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-[#C2410C]" />
          )}
        </button>

        <button
          type="button"
          onClick={handlePrintPdf}
          className="min-w-[46px] min-h-[46px] rounded-xl bg-[#FEF3C7] text-[#C2410C] hover:bg-[#FDE68A] transition-colors flex items-center justify-center shrink-0"
          aria-label="تصدير وطباعة PDF"
          title="طباعة / PDF"
        >
          <PdfDocIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Printable Header (visible only when printing PDF) */}
      <div className="hidden print-only mb-6 border-b border-[#E7E5E4] pb-4">
        <h1 className="text-xl font-extrabold text-[#1C1917]">
          {ledgerTitle} — تقرير {kindLabel} ({statusFilter})
        </h1>
        <p className="text-xs text-[#57534E] mt-1">
          تاريخ الطباعة: {formatArabicDate(getTodayISO())} · إجمالي أعطيت:{' '}
          {formatAmount(summaryTotals.totalGiven, currency)} · إجمالي أخذت:{' '}
          {formatAmount(summaryTotals.totalTaken, currency)}
        </p>
      </div>

      {/* Ledger List Items */}
      <div className="bg-white border border-[#E7E5E4] rounded-2xl overflow-hidden shadow-xs">
        {visibleItems.length === 0 ? (
          <div className="py-12 px-5 text-center">
            <p className="text-sm font-bold text-[#1C1917]">
              لا توجد سجلات مطابقة في {kindLabel}
            </p>
            <p className="text-xs text-[#57534E] mt-1">
              جرّب تغيير البحث أو اضغط على «إضافة {singularLabel}» لتسجيل حساب جديد.
            </p>
            {statusFilter !== 'الكل' && (
              <button
                type="button"
                onClick={() => setStatusFilter('الكل')}
                className="mt-3 px-4 py-2 text-xs font-bold text-[#3730A3] bg-[#EEF2FF] rounded-xl"
              >
                إظهار كل السجلات
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#E7E5E4]">
            {visibleItems.map(({ contact, absAmount, direction, daysElapsed }) => {
              const isGiven = direction === 'given';
              const statusText =
                absAmount === 0
                  ? 'خالص'
                  : isGiven
                  ? 'فلوس ليا'
                  : 'فلوس عليا';
              const amountColor =
                absAmount === 0
                  ? 'text-[#57534E]'
                  : isGiven
                  ? 'text-[#DC2626]'
                  : 'text-[#15803D]';

              return (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => openContactDetails(contact)}
                  className="w-full min-h-[68px] px-4 py-3 flex items-center justify-between gap-3 text-right hover:bg-[#F8F7F4]/80 active:bg-[#EEF2FF]/50 transition-colors"
                >
                  {/* Right Side: Avatar Square + Name + Days Elapsed */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#EEF2FF] text-[#3730A3] font-extrabold text-base flex items-center justify-center shrink-0">
                      {getFirstArabicChar(contact.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm sm:text-base font-bold text-[#1C1917] truncate">
                        {contact.name}
                      </div>
                      <div className="text-xs text-[#57534E] tabular-nums mt-0.5">
                        {formatLedgerDaysSubtitle(daysElapsed)}
                      </div>
                    </div>
                  </div>

                  {/* Left Side: Bold Amount + Status Label */}
                  <div className="text-left shrink-0">
                    <div className={`text-sm sm:text-base font-extrabold tabular-nums ${amountColor}`}>
                      {formatAmount(absAmount, currency, privacyMasked)}
                    </div>
                    <div className={`text-xs font-semibold mt-0.5 ${amountColor}`}>
                      {statusText}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-20 left-0 right-0 z-30 pointer-events-none no-print">
        <div className="max-w-[780px] mx-auto px-4 flex justify-start">
          <button
            type="button"
            onClick={openAddModal}
            className="pointer-events-auto inline-flex items-center gap-2 min-h-[48px] px-5 py-2.5 rounded-full bg-[#3730A3] hover:bg-[#312E81] active:scale-[0.98] text-white text-sm font-bold shadow-lg shadow-[#3730A3]/25 transition-all whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4 shrink-0" />
            <span>إضافة {singularLabel}</span>
          </button>
        </div>
      </div>

      {/* Add Contact Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title={`إضافة ${singularLabel} جديد`}
        subtitle={`تسجيل حساب جديد في قائمة ${kindLabel}`}
      >
        <form onSubmit={handleCreateContact} className="space-y-4">
          {addError && (
            <div className="p-3 rounded-xl bg-[#FEE2E2] text-[#DC2626] text-xs font-bold">
              {addError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
              اسم ال{singularLabel} *
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={`مثال: ${partyKind === 'customers' ? 'أحمد عبد الرحمن' : 'شركة النيل للتجارة'}`}
              className="w-full min-h-[44px] px-3.5 py-2 text-sm border border-[#E7E5E4] rounded-xl focus:outline-none focus:border-[#3730A3]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                المبلغ ({currency}) *
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="0.0"
                className="w-full min-h-[44px] px-3.5 py-2 text-sm border border-[#E7E5E4] rounded-xl tabular-nums focus:outline-none focus:border-[#3730A3]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                نوع الرصيد *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewDirection('given')}
                  className={`min-h-[44px] rounded-xl text-xs font-bold border transition-colors ${
                    newDirection === 'given'
                      ? 'bg-[#FEE2E2] text-[#DC2626] border-[#DC2626]'
                      : 'bg-white text-[#57534E] border-[#E7E5E4]'
                  }`}
                >
                  أعطيت (فلوس ليا)
                </button>
                <button
                  type="button"
                  onClick={() => setNewDirection('taken')}
                  className={`min-h-[44px] rounded-xl text-xs font-bold border transition-colors ${
                    newDirection === 'taken'
                      ? 'bg-[#DCFCE7] text-[#15803D] border-[#15803D]'
                      : 'bg-white text-[#57534E] border-[#E7E5E4]'
                  }`}
                >
                  أخذت (فلوس عليا)
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                التاريخ *
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 text-sm border border-[#E7E5E4] rounded-xl focus:outline-none focus:border-[#3730A3]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                رقم الهاتف / الواتساب (اختياري)
              </label>
              <input
                type="tel"
                dir="ltr"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="01012345678"
                className="w-full min-h-[44px] px-3.5 py-2 text-sm text-right border border-[#E7E5E4] rounded-xl tabular-nums focus:outline-none focus:border-[#3730A3]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
              ملاحظات (اختياري)
            </label>
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="تفاصيل الفاتورة أو سبب الدين..."
              className="w-full min-h-[44px] px-3.5 py-2 text-sm border border-[#E7E5E4] rounded-xl focus:outline-none focus:border-[#3730A3]"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E7E5E4]">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="min-h-[44px] px-4 py-2 text-sm font-semibold text-[#57534E] bg-white border border-[#E7E5E4] rounded-xl hover:bg-[#F8F7F4]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 text-sm font-bold text-white bg-[#3730A3] hover:bg-[#312E81] rounded-xl"
            >
              حفظ في الدفتر
            </button>
          </div>
        </form>
      </Modal>

      {/* Contact Details & Transaction Modal */}
      <Modal
        isOpen={Boolean(selectedContactEntry)}
        onClose={() => {
          setSelectedContactId(null);
          setTxnModalDirection(null);
        }}
        title={selectedContactEntry?.contact.name ?? ''}
        subtitle={
          selectedContactEntry
            ? `${selectedContactEntry.contact.phone ? `${selectedContactEntry.contact.phone} · ` : ''}${formatLedgerDaysSubtitle(selectedContactEntry.daysElapsed)}`
            : undefined
        }
        maxWidthClass="max-w-lg"
      >
        {selectedContactEntry && (
          <div className="space-y-4">
            {/* Net Balance Banner */}
            <div className="bg-[#F8F7F4] border border-[#E7E5E4] rounded-2xl p-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-[#57534E]">الرصيد الصافي الحالي</div>
                <div
                  className={`text-xl font-extrabold tabular-nums mt-0.5 ${
                    selectedContactEntry.absAmount === 0
                      ? 'text-[#57534E]'
                      : selectedContactEntry.direction === 'given'
                      ? 'text-[#DC2626]'
                      : 'text-[#15803D]'
                  }`}
                >
                  {formatAmount(selectedContactEntry.absAmount, currency, privacyMasked)}{' '}
                  <span className="text-xs font-bold">
                    {selectedContactEntry.absAmount === 0
                      ? '(خالص)'
                      : selectedContactEntry.direction === 'given'
                      ? '— فلوس ليا'
                      : '— فلوس عليا'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditMode((v) => !v)}
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-white border border-[#E7E5E4] text-[#57534E] hover:text-[#3730A3]"
                  title="تعديل البيانات"
                  aria-label="تعديل بيانات الحساب"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(selectedContactEntry.contact)}
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-white border border-[#E7E5E4] text-[#57534E] hover:text-[#DC2626]"
                  title="حذف الحساب"
                  aria-label="حذف الحساب"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Inline Edit Form */}
            {editMode && (
              <form
                onSubmit={handleSaveContactEdit}
                className="p-3.5 rounded-xl bg-[#EEF2FF]/60 border border-[#E0E7FF] space-y-3"
              >
                {editError && (
                  <div className="p-2 rounded-lg bg-[#FEE2E2] text-[#DC2626] text-xs font-bold">
                    {editError}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="الاسم"
                    className="min-h-[40px] px-3 py-1.5 text-sm bg-white border border-[#E7E5E4] rounded-xl focus:outline-none focus:border-[#3730A3]"
                    required
                  />
                  <input
                    type="tel"
                    dir="ltr"
                    value={editPhone}
                    onChange={(e) => {
                      setEditPhone(e.target.value);
                      setEditError('');
                    }}
                    placeholder="01012345678"
                    className="min-h-[40px] px-3 py-1.5 text-sm text-right bg-white border border-[#E7E5E4] rounded-xl tabular-nums focus:outline-none focus:border-[#3730A3]"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-[#57534E] bg-white rounded-lg border border-[#E7E5E4]"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#3730A3] rounded-lg"
                  >
                    حفظ التعديل
                  </button>
                </div>
              </form>
            )}

            {/* WhatsApp Payment Reminder Trigger */}
            {selectedContactEntry.direction === 'given' &&
              selectedContactEntry.absAmount > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setReminderTarget({
                      contact: selectedContactEntry.contact,
                      amount: selectedContactEntry.absAmount,
                      daysElapsed: selectedContactEntry.daysElapsed,
                    })
                  }
                  className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-[#ECFDF5] hover:bg-[#D1FAE5] border border-[#A7F3D0] text-[#15803D] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4 shrink-0" />
                  <span>تذكير عبر واتساب</span>
                </button>
              )}

            {/* Quick Action Buttons: أعطيت (فلوس ليا) vs أخذت (فلوس عليا) */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => openNewTransaction('given')}
                className="min-h-[46px] flex items-center justify-center gap-2 rounded-xl bg-[#FEE2E2] hover:bg-[#FECACA] text-[#DC2626] text-xs sm:text-sm font-bold transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>أعطيت (فلوس ليا)</span>
              </button>
              <button
                type="button"
                onClick={() => openNewTransaction('taken')}
                className="min-h-[46px] flex items-center justify-center gap-2 rounded-xl bg-[#DCFCE7] hover:bg-[#BBF7D0] text-[#15803D] text-xs sm:text-sm font-bold transition-colors"
              >
                <Minus className="w-4 h-4" />
                <span>أخذت (فلوس عليا)</span>
              </button>
            </div>

            {/* Inline New Transaction Form */}
            {txnModalDirection && (
              <form
                onSubmit={handleRecordTransaction}
                className="p-4 rounded-2xl border border-[#E7E5E4] bg-[#F8F7F4] space-y-3"
              >
                <div className="text-xs font-extrabold text-[#1C1917]">
                  {txnModalDirection === 'given'
                    ? 'تسجيل مبلغ أعطيته (فلوس ليا)'
                    : 'تسجيل مبلغ أخذته / تحصيل (فلوس عليا)'}
                </div>
                {txnError && (
                  <div className="p-2 rounded-lg bg-[#FEE2E2] text-[#DC2626] text-xs font-bold">
                    {txnError}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={txnAmount}
                    onChange={(e) => setTxnAmount(e.target.value)}
                    placeholder={`المبلغ (${currency})`}
                    className="min-h-[42px] px-3 py-2 text-sm bg-white border border-[#E7E5E4] rounded-xl tabular-nums focus:outline-none focus:border-[#3730A3]"
                    required
                  />
                  <input
                    type="date"
                    value={txnDate}
                    onChange={(e) => setTxnDate(e.target.value)}
                    className="min-h-[42px] px-3 py-2 text-sm bg-white border border-[#E7E5E4] rounded-xl focus:outline-none focus:border-[#3730A3]"
                    required
                  />
                </div>
                <input
                  type="text"
                  value={txnNote}
                  onChange={(e) => setTxnNote(e.target.value)}
                  placeholder="ملاحظة (اختياري)"
                  className="w-full min-h-[42px] px-3 py-2 text-sm bg-white border border-[#E7E5E4] rounded-xl focus:outline-none focus:border-[#3730A3]"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setTxnModalDirection(null)}
                    className="px-3.5 py-2 text-xs font-semibold text-[#57534E] bg-white border border-[#E7E5E4] rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-[#3730A3] hover:bg-[#312E81] rounded-xl"
                  >
                    تسجيل الحركة
                  </button>
                </div>
              </form>
            )}

            {/* Transaction History */}
            <div>
              <h3 className="text-xs font-bold text-[#57534E] mb-2">
                سجل الحركات ({selectedContactEntry.contact.transactions.length})
              </h3>
              {selectedContactEntry.contact.transactions.length === 0 ? (
                <p className="text-xs text-[#57534E] py-4 text-center bg-[#F8F7F4] rounded-xl">
                  لا توجد حركات مسجلة لهذا الحساب.
                </p>
              ) : (
                <div className="divide-y divide-[#E7E5E4] border border-[#E7E5E4] rounded-xl overflow-hidden">
                  {selectedContactEntry.contact.transactions.map((txn) => (
                    <div
                      key={txn.id}
                      className="px-3.5 py-2.5 bg-white flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-[#1C1917]">
                          {txn.direction === 'given' ? 'أعطيت (فلوس ليا)' : 'أخذت (فلوس عليا)'}
                        </div>
                        <div className="text-[#57534E] mt-0.5 truncate">
                          {formatArabicDate(txn.date)}
                          {txn.note ? ` · ${txn.note}` : ''}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`font-extrabold tabular-nums ${
                            txn.direction === 'given' ? 'text-[#DC2626]' : 'text-[#15803D]'
                          }`}
                        >
                          {formatAmount(txn.amount, currency, privacyMasked)}
                        </span>
                        {selectedContactEntry.contact.transactions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteTransaction(txn.id)}
                            className="p-1 text-[#57534E] hover:text-[#DC2626] rounded"
                            aria-label="حذف الحركة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Filter & Sort Modal */}
      <Modal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        title="تصفية وترتيب القائمة"
        maxWidthClass="max-w-sm"
      >
        <div className="space-y-5">
          <div>
            <div className="text-xs font-bold text-[#57534E] mb-2">حالة الرصيد</div>
            <div className="grid grid-cols-3 gap-2">
              {(['الكل', 'أعطيت', 'أخذت'] as LedgerFilterStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`min-h-[42px] rounded-xl text-xs font-bold border transition-colors ${
                    statusFilter === st
                      ? 'bg-[#3730A3] text-white border-[#3730A3]'
                      : 'bg-white text-[#1C1917] border-[#E7E5E4] hover:bg-[#F8F7F4]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-[#57534E] mb-2">ترتيب العرض</div>
            <div className="grid grid-cols-3 gap-2">
              {(['الافتراضي', 'الأقدم', 'الأعلى مبلغاً'] as LedgerSortOrder[]).map(
                (ord) => (
                  <button
                    key={ord}
                    type="button"
                    onClick={() => setSortOrder(ord)}
                    className={`min-h-[42px] rounded-xl text-xs font-bold border transition-colors ${
                      sortOrder === ord
                        ? 'bg-[#3730A3] text-white border-[#3730A3]'
                        : 'bg-white text-[#1C1917] border-[#E7E5E4] hover:bg-[#F8F7F4]'
                    }`}
                  >
                    {ord}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-[#E7E5E4]">
            <button
              type="button"
              onClick={() => setFilterModalOpen(false)}
              className="w-full min-h-[44px] rounded-xl bg-[#3730A3] text-white text-sm font-bold"
            >
              تطبيق
            </button>
          </div>
        </div>
      </Modal>

      {/* Debt Collection Modal (تحصيل الديون) */}
      <Modal
        isOpen={collectionModalOpen}
        onClose={() => setCollectionModalOpen(false)}
        title="تحصيل الديون والتذكير"
        subtitle={`الحسابات التي لك عندها مستحقات (${receivablesList.length})`}
        maxWidthClass="max-w-lg"
      >
        <div className="space-y-3">
          {receivablesList.length === 0 ? (
            <p className="text-sm text-[#57534E] py-8 text-center">
              لا توجد مستحقات مفتوحة للتحصيل حالياً.
            </p>
          ) : (
            <div className="divide-y divide-[#E7E5E4] border border-[#E7E5E4] rounded-2xl overflow-hidden">
              {receivablesList.slice(0, 15).map(({ contact, absAmount, daysElapsed }) => (
                <div
                  key={contact.id}
                  className="p-3.5 bg-white flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-[#1C1917] truncate">
                      {contact.name}
                    </div>
                    <div className="text-xs text-[#57534E] tabular-nums mt-0.5 flex items-center gap-2">
                      <span className="font-bold text-[#DC2626]">
                        {formatAmount(absAmount, currency, privacyMasked)}
                      </span>
                      <span>·</span>
                      <span>{formatLedgerDaysSubtitle(daysElapsed)}</span>
                      {contact.phone && (
                        <>
                          <span>·</span>
                          <span className="inline-flex items-center gap-0.5">
                            <Phone className="w-3 h-3" />
                            {contact.phone}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setReminderTarget({
                          contact,
                          amount: absAmount,
                          daysElapsed,
                        })
                      }
                      className="min-h-[38px] px-2.5 rounded-xl bg-[#ECFDF5] text-[#15803D] hover:bg-[#D1FAE5] border border-[#A7F3D0] text-xs font-bold inline-flex items-center gap-1"
                      title="تذكير عبر واتساب"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>تذكير عبر واتساب</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickCollect(contact, absAmount)}
                      className="min-h-[38px] px-2.5 rounded-xl bg-[#EEF2FF] text-[#3730A3] hover:bg-[#E0E7FF] text-xs font-bold inline-flex items-center gap-1"
                      title="تسجيل تحصيل كامل"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>تحصيل</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Summary Reports Modal (التقارير) */}
      <Modal
        isOpen={reportsModalOpen}
        onClose={() => setReportsModalOpen(false)}
        title={`تقارير ${kindLabel}`}
        subtitle={`ملخص الأرصدة والحسابات المسجلة في ${ledgerTitle}`}
        maxWidthClass="max-w-lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#FEE2E2]/55 border border-[#FECACA]">
              <div className="text-xs font-bold text-[#DC2626]">إجمالي أعطيت (فلوس ليا)</div>
              <div className="text-lg font-extrabold text-[#DC2626] tabular-nums mt-1">
                {formatAmount(summaryTotals.totalGiven, currency, privacyMasked)}
              </div>
              <div className="text-[11px] text-[#57534E] mt-1 tabular-nums">
                عدد الحسابات: {summaryTotals.countGiven}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#DCFCE7]/55 border border-[#BBF7D0]">
              <div className="text-xs font-bold text-[#15803D]">إجمالي أخذت (فلوس عليا)</div>
              <div className="text-lg font-extrabold text-[#15803D] tabular-nums mt-1">
                {formatAmount(summaryTotals.totalTaken, currency, privacyMasked)}
              </div>
              <div className="text-[11px] text-[#57534E] mt-1 tabular-nums">
                عدد الحسابات: {summaryTotals.countTaken}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8F7F4] border border-[#E7E5E4] flex items-center justify-between">
            <span className="text-sm font-bold text-[#1C1917]">صافي الموقف المالي</span>
            <span
              className={`text-base font-extrabold tabular-nums ${
                summaryTotals.netBalance >= 0 ? 'text-[#3730A3]' : 'text-[#C2410C]'
              }`}
            >
              {formatAmount(Math.abs(summaryTotals.netBalance), currency, privacyMasked)}{' '}
              <span className="text-xs">
                {summaryTotals.netBalance >= 0 ? '(صافي ليا)' : '(صافي عليا)'}
              </span>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[#E7E5E4]">
            <button
              type="button"
              onClick={() => {
                exportContactsCsv(
                  ledgerTitle,
                  currency,
                  visibleItems.map((i) => i.contact),
                  kindLabel
                );
                onNotify(`تم تصدير تقرير ${kindLabel} بصيغة CSV`);
              }}
              className="min-h-[42px] px-4 py-2 text-xs font-bold text-[#1C1917] bg-white border border-[#E7E5E4] rounded-xl hover:bg-[#F8F7F4] inline-flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-[#3730A3]" />
              <span>تصدير CSV</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setReportsModalOpen(false);
                window.setTimeout(handlePrintPdf, 150);
              }}
              className="min-h-[42px] px-4 py-2 text-xs font-bold text-white bg-[#3730A3] hover:bg-[#312E81] rounded-xl inline-flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / حفظ PDF</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Contact Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            onDeleteContact(deleteTarget.id);
            setSelectedContactId(null);
            onNotify(`تم حذف حساب "${deleteTarget.name}"`, 'info');
          }
        }}
        title={`حذف ${singularLabel}`}
        message={`هل أنت متأكد من حذف حساب "${deleteTarget?.name ?? ''}" وكافة حركاته؟`}
        confirmLabel="حذف الحساب"
      />

      {/* WhatsApp Payment Reminder Modal */}
      <WhatsAppReminderModal
        isOpen={Boolean(reminderTarget)}
        onClose={() => setReminderTarget(null)}
        contact={reminderTarget?.contact ?? null}
        amount={reminderTarget?.amount ?? 0}
        daysElapsed={reminderTarget?.daysElapsed ?? 0}
        currency={currency}
        ledgerTitle={ledgerTitle}
        onSavePhone={handleSavePhoneForContact}
        onNotify={onNotify}
      />
    </div>
  );
}
