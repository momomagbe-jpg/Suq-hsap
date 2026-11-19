import { useState, useEffect } from 'react';
import {
  Download,
  Printer,
  RotateCcw,
  Eye,
  EyeOff,
  FolderSync,
  Check,
} from 'lucide-react';
import type { WorkspaceLedger } from '../types';
import { exportFullLedgerCsv } from '../utils/csvExport';
import { ConfirmDialog } from './ConfirmDialog';

interface MoreViewProps {
  ledger: WorkspaceLedger;
  privacyMasked: boolean;
  onTogglePrivacy: () => void;
  onUpdateLedgerMeta: (title: string, currency: string) => void;
  onOpenSwitcher: () => void;
  onResetDemoData: () => void;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const CURRENCIES = ['ج.م', 'ر.س', 'د.إ', 'د.ك', 'د.أ', '$'];

export function MoreView({
  ledger,
  privacyMasked,
  onTogglePrivacy,
  onUpdateLedgerMeta,
  onOpenSwitcher,
  onResetDemoData,
  onNotify,
}: MoreViewProps) {
  const [title, setTitle] = useState(ledger.title);
  const [currency, setCurrency] = useState(ledger.currency);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  useEffect(() => {
    setTitle(ledger.title);
    setCurrency(ledger.currency);
  }, [ledger]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateLedgerMeta(title.trim() || 'خزنة البركة', currency);
    onNotify('تم حفظ إعدادات الدفتر بنجاح');
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Ledger Settings Card */}
      <section className="bg-white border border-[#E7E5E4] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-[#1C1917]">إعدادات الدفتر والعملة</h2>
          <p className="text-xs text-[#57534E] mt-0.5">
            تخصيص اسم الخزنة والعملة المعروضة في الحسابات
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                اسم الدفتر / النشاط
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 text-sm border border-[#E7E5E4] rounded-xl focus:outline-none focus:border-[#3730A3]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                العملة
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 text-sm border border-[#E7E5E4] rounded-xl bg-white focus:outline-none focus:border-[#3730A3]"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="min-h-[42px] px-5 py-2 text-sm font-bold text-white bg-[#3730A3] hover:bg-[#312E81] rounded-xl inline-flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>حفظ الإعدادات</span>
            </button>
          </div>
        </form>
      </section>

      {/* Quick Actions & Privacy */}
      <section className="bg-white border border-[#E7E5E4] rounded-2xl overflow-hidden shadow-xs divide-y divide-[#E7E5E4]">
        <button
          type="button"
          onClick={onTogglePrivacy}
          className="w-full min-h-[58px] px-4 py-3 flex items-center justify-between gap-3 text-right hover:bg-[#F8F7F4] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#3730A3] flex items-center justify-center shrink-0">
              {privacyMasked ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-sm font-bold text-[#1C1917]">إخفاء المبالغ للخصوصية</div>
              <div className="text-xs text-[#57534E]">
                استبدال الأرقام بعلامة *** عند استخدام التطبيق أمام الآخرين
              </div>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
              privacyMasked
                ? 'bg-[#3730A3] text-white'
                : 'bg-[#F8F7F4] text-[#57534E] border border-[#E7E5E4]'
            }`}
          >
            {privacyMasked ? 'مفعّل' : 'متوقف'}
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenSwitcher}
          className="w-full min-h-[58px] px-4 py-3 flex items-center justify-between gap-3 text-right hover:bg-[#F8F7F4] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#3730A3] flex items-center justify-center shrink-0">
              <FolderSync className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#1C1917]">إدارة الدفاتر والمزامنة</div>
              <div className="text-xs text-[#57534E]">
                التبديل بين أكثر من خزنة أو إنشاء دفتر جديد
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-[#3730A3] shrink-0">فتح</span>
        </button>

        <button
          type="button"
          onClick={() => {
            exportFullLedgerCsv(ledger);
            onNotify('تم تصدير جميع البيانات بصيغة CSV');
          }}
          className="w-full min-h-[58px] px-4 py-3 flex items-center justify-between gap-3 text-right hover:bg-[#F8F7F4] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#1C1917]">تصدير نسخة CSV شاملة</div>
              <div className="text-xs text-[#57534E]">
                تصدير العملاء والموردين ودفتر النقدية لبرنامج Excel
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-[#15803D] shrink-0">تنزيل</span>
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="w-full min-h-[58px] px-4 py-3 flex items-center justify-between gap-3 text-right hover:bg-[#F8F7F4] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#C2410C] flex items-center justify-center shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#1C1917]">طباعة تقرير / حفظ PDF</div>
              <div className="text-xs text-[#57534E]">
                طباعة ملخص الأرصدة أو حفظه كملف PDF من المتصفح
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-[#C2410C] shrink-0">طباعة</span>
        </button>

        <button
          type="button"
          onClick={() => setConfirmResetOpen(true)}
          className="w-full min-h-[58px] px-4 py-3 flex items-center justify-between gap-3 text-right hover:bg-[#FEE2E2]/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#DC2626]">
                إعادة ضبط البيانات التجريبية
              </div>
              <div className="text-xs text-[#57534E]">
                استعادة بيانات العملاء والموردين الافتراضية
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-[#DC2626] shrink-0">استعادة</span>
        </button>
      </section>

      <ConfirmDialog
        isOpen={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        onConfirm={() => {
          onResetDemoData();
          onNotify('تمت إعادة ضبط البيانات التجريبية بنجاح', 'info');
        }}
        title="إعادة ضبط البيانات التجريبية"
        message="هل أنت متأكد من مسح التعديلات الحالية واستعادة البيانات التجريبية الأصلية؟"
        confirmLabel="نعم، إعادة الضبط"
      />
    </div>
  );
}
