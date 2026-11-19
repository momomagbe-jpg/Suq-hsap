import { useMemo, useState } from 'react';
import { Plus, Search, Trash2, ArrowDownLeft, ArrowUpRight, Download } from 'lucide-react';
import type { CashbookEntry, CashDirection } from '../types';
import {
  formatAmount,
  formatArabicDate,
  generateId,
  getTodayISO,
} from '../utils/formatters';
import { downloadCsv } from '../utils/csvExport';
import { Modal } from './Modal';
import { ConfirmDialog } from './ConfirmDialog';

interface CashbookViewProps {
  ledgerTitle: string;
  currency: string;
  entries: CashbookEntry[];
  privacyMasked: boolean;
  onAddEntry: (entry: CashbookEntry) => void;
  onDeleteEntry: (id: string) => void;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const CASH_CATEGORIES = [
  'مبيعات نقدية',
  'تحصيل دين',
  'شحن وتوصيل',
  'مصاريف تشغيل',
  'مشتريات بضاعة',
  'أخرى',
];

export function CashbookView({
  ledgerTitle,
  currency,
  entries,
  privacyMasked,
  onAddEntry,
  onDeleteEntry,
  onNotify,
}: CashbookViewProps) {
  const [search, setSearch] = useState('');
  const [filterDir, setFilterDir] = useState<'all' | CashDirection>('all');
  const [modalDir, setModalDir] = useState<CashDirection | null>(null);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayISO());
  const [category, setCategory] = useState('مبيعات نقدية');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<CashbookEntry | null>(null);

  const summary = useMemo(() => {
    const totalIn = entries
      .filter((e) => e.direction === 'in')
      .reduce((sum, e) => sum + e.amount, 0);
    const totalOut = entries
      .filter((e) => e.direction === 'out')
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      totalIn,
      totalOut,
      balance: totalIn - totalOut,
    };
  }, [entries]);

  const filteredEntries = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...entries]
      .sort((a, b) => b.date.localeCompare(a.date))
      .filter((entry) => {
        if (filterDir !== 'all' && entry.direction !== filterDir) return false;
        if (!q) return true;
        return (
          entry.note.toLowerCase().includes(q) ||
          entry.category.toLowerCase().includes(q)
        );
      });
  }, [entries, search, filterDir]);

  const openAddModal = (dir: CashDirection) => {
    setModalDir(dir);
    setAmount('');
    setDate(getTodayISO());
    setCategory(dir === 'in' ? 'مبيعات نقدية' : 'مصاريف تشغيل');
    setNote('');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!modalDir) return;
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setError('يرجى إدخال مبلغ صحيح أكبر من صفر.');
      return;
    }
    if (!date) {
      setError('يرجى تحديد التاريخ.');
      return;
    }

    onAddEntry({
      id: generateId('cb'),
      date,
      direction: modalDir,
      amount: amt,
      category,
      note: note.trim() || category,
    });
    setModalDir(null);
    onNotify(modalDir === 'in' ? 'تم تسجيل حركة وارد نقدي' : 'تم تسجيل حركة صادر نقدي');
  };

  const handleExport = () => {
    downloadCsv(
      `${ledgerTitle}_دفتر_النقدية_${getTodayISO()}.csv`,
      ['التاريخ', 'النوع', 'البند', `المبلغ (${currency})`, 'ملاحظات'],
      filteredEntries.map((e) => [
        e.date,
        e.direction === 'in' ? 'وارد (قبض)' : 'صادر (صرف)',
        e.category,
        e.amount.toFixed(1),
        e.note,
      ])
    );
    onNotify('تم تصدير دفتر النقدية بصيغة CSV');
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Cashbook Summary Card */}
      <section className="bg-white border border-[#E7E5E4] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-[#57534E]">الرصيد النقدي المتاح</div>
            <div
              className={`text-2xl font-extrabold tabular-nums mt-0.5 ${
                summary.balance >= 0 ? 'text-[#3730A3]' : 'text-[#DC2626]'
              }`}
            >
              {formatAmount(summary.balance, currency, privacyMasked)}
            </div>
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#EEF2FF] text-[#3730A3] hover:bg-[#E0E7FF] text-xs font-bold inline-flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>CSV</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#E7E5E4]">
          <div className="p-3 rounded-xl bg-[#DCFCE7]/50">
            <div className="text-xs font-bold text-[#15803D]">إجمالي الوارد (قبض)</div>
            <div className="text-base font-extrabold text-[#15803D] tabular-nums mt-0.5">
              {formatAmount(summary.totalIn, currency, privacyMasked)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#FEE2E2]/50">
            <div className="text-xs font-bold text-[#DC2626]">إجمالي الصادر (صرف)</div>
            <div className="text-base font-extrabold text-[#DC2626] tabular-nums mt-0.5">
              {formatAmount(summary.totalOut, currency, privacyMasked)}
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#57534E] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث في حركة النقدية..."
            className="w-full min-h-[44px] pr-10 pl-3 text-sm bg-white border border-[#E7E5E4] rounded-xl focus:outline-none focus:border-[#3730A3]"
          />
        </div>

        <div className="grid grid-cols-3 gap-1 p-1 bg-white border border-[#E7E5E4] rounded-xl">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'in', label: 'وارد' },
            { id: 'out', label: 'صادر' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterDir(tab.id as 'all' | CashDirection)}
              className={`min-h-[36px] px-3 rounded-lg text-xs font-bold transition-colors ${
                filterDir === tab.id
                  ? 'bg-[#3730A3] text-white'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cashbook Entries */}
      <div className="bg-white border border-[#E7E5E4] rounded-2xl overflow-hidden shadow-xs">
        {filteredEntries.length === 0 ? (
          <div className="py-12 px-5 text-center">
            <p className="text-sm font-bold text-[#1C1917]">لا توجد حركات نقدية مسجلة</p>
            <p className="text-xs text-[#57534E] mt-1">
              سجّل الوارد والمصروفات اليومية لمتابعة رصيد الخزنة أولاً بأول.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E7E5E4]">
            {filteredEntries.map((entry) => {
              const isIn = entry.direction === 'in';
              return (
                <div
                  key={entry.id}
                  className="px-4 py-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isIn
                          ? 'bg-[#DCFCE7] text-[#15803D]'
                          : 'bg-[#FEE2E2] text-[#DC2626]'
                      }`}
                    >
                      {isIn ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-[#1C1917] truncate">
                        {entry.note}
                      </div>
                      <div className="text-xs text-[#57534E] mt-0.5 tabular-nums">
                        {entry.category} · {formatArabicDate(entry.date)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="text-left">
                      <div
                        className={`text-sm font-extrabold tabular-nums ${
                          isIn ? 'text-[#15803D]' : 'text-[#DC2626]'
                        }`}
                      >
                        {isIn ? '+' : '−'}
                        {formatAmount(entry.amount, currency, privacyMasked)}
                      </div>
                      <div className="text-[11px] font-semibold text-[#57534E]">
                        {isIn ? 'وارد' : 'صادر'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(entry)}
                      className="p-2 text-[#57534E] hover:text-[#DC2626] rounded-lg"
                      aria-label="حذف الحركة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Dual Cashbook Buttons */}
      <div className="fixed bottom-20 left-0 right-0 z-30 pointer-events-none no-print">
        <div className="max-w-[780px] mx-auto px-4 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => openAddModal('in')}
            className="pointer-events-auto flex-1 sm:flex-none min-h-[46px] px-5 rounded-full bg-[#15803D] hover:bg-[#166534] text-white text-sm font-bold shadow-lg inline-flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>وارد (قبض)</span>
          </button>
          <button
            type="button"
            onClick={() => openAddModal('out')}
            className="pointer-events-auto flex-1 sm:flex-none min-h-[46px] px-5 rounded-full bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-bold shadow-lg inline-flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>صادر (صرف)</span>
          </button>
        </div>
      </div>

      {/* Add Cashbook Entry Modal */}
      <Modal
        isOpen={Boolean(modalDir)}
        onClose={() => setModalDir(null)}
        title={modalDir === 'in' ? 'تسجيل حركة وارد (قبض)' : 'تسجيل حركة صادر (صرف)'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-[#FEE2E2] text-[#DC2626] text-xs font-bold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                المبلغ ({currency}) *
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="w-full min-h-[44px] px-3.5 py-2 text-sm border border-[#E7E5E4] rounded-xl tabular-nums focus:outline-none focus:border-[#3730A3]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                التاريخ *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 text-sm border border-[#E7E5E4] rounded-xl focus:outline-none focus:border-[#3730A3]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
              البند / التصنيف
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 text-sm border border-[#E7E5E4] rounded-xl bg-white focus:outline-none focus:border-[#3730A3]"
            >
              {CASH_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
              ملاحظات / وصف الحركة
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="مثال: مبيعات وردية الصباح أو فاتورة كهرباء"
              className="w-full min-h-[44px] px-3.5 py-2 text-sm border border-[#E7E5E4] rounded-xl focus:outline-none focus:border-[#3730A3]"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E7E5E4]">
            <button
              type="button"
              onClick={() => setModalDir(null)}
              className="min-h-[44px] px-4 py-2 text-sm font-semibold text-[#57534E] bg-white border border-[#E7E5E4] rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className={`min-h-[44px] px-5 py-2 text-sm font-bold text-white rounded-xl ${
                modalDir === 'in'
                  ? 'bg-[#15803D] hover:bg-[#166534]'
                  : 'bg-[#DC2626] hover:bg-[#B91C1C]'
              }`}
            >
              حفظ الحركة
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            onDeleteEntry(deleteTarget.id);
            onNotify('تم حذف الحركة النقدية', 'info');
          }
        }}
        title="حذف حركة نقدية"
        message={`هل تريد حذف حركة "${deleteTarget?.note ?? ''}"؟`}
        confirmLabel="حذف"
      />
    </div>
  );
}
