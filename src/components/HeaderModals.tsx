import { useState } from 'react';
import { Check, Plus, Download } from 'lucide-react';
import type { WorkspaceLedger } from '../types';
import { exportFullLedgerCsv } from '../utils/csvExport';
import { Modal } from './Modal';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuideModal({ isOpen, onClose }: GuideModalProps) {
  const steps = [
    {
      title: '1. دفتر الديون (العملاء والموردين)',
      desc: 'تنقّل بين قائمة العملاء وقائمة الموردين من الأعلى. اللون الأحمر (أعطيت / فلوس ليا) يوضح المبالغ المستحقة لك، والأخضر (أخذت / فلوس عليا) يوضح المبالغ التي عليك.',
    },
    {
      title: '2. تسجيل حركة جديدة بضغطة واحدة',
      desc: 'اضغط على أي اسم في القائمة لتسجيل مبلغ «أعطيت» أو «أخذت»، أو اضغط على الزر السفلي «+ إضافة عميل» لإضافة حساب جديد.',
    },
    {
      title: '3. تحصيل الديون والتقارير والخصوصية',
      desc: 'استخدم زر العين في الأعلى لإخفاء المبالغ مؤقتاً، وزر «تحصيل الديون» لإرسال تذكيرات لطيفة أو تسجيل السداد الفوري، وزر «PDF» لطباعة كشف الحساب.',
    },
    {
      title: '4. دفتر النقدية اليومي',
      desc: 'من الشريط السفلي انتقل إلى «دفتر النقدية» لتسجيل حركة الوارد (قبض) والصادر (صرف) ومتابعة صافي السيولة في الخزنة.',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="دليل استخدام خزنة البركة"
      subtitle="شرح سريع لإدارة حساباتك اليومية في دقائق"
    >
      <div className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.title}
            className="p-3.5 rounded-xl bg-[#F8F7F4] border border-[#E7E5E4]"
          >
            <h3 className="text-sm font-bold text-[#3730A3]">{step.title}</h3>
            <p className="text-xs text-[#57534E] leading-relaxed mt-1">{step.desc}</p>
          </div>
        ))}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[44px] rounded-xl bg-[#3730A3] text-white text-sm font-bold"
          >
            فهمت، لنبدأ
          </button>
        </div>
      </div>
    </Modal>
  );
}

interface SwitchLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  ledgers: WorkspaceLedger[];
  activeLedgerId: string;
  onSelectLedger: (id: string) => void;
  onCreateLedger: (title: string) => void;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function SwitchLedgerModal({
  isOpen,
  onClose,
  ledgers,
  activeLedgerId,
  onSelectLedger,
  onCreateLedger,
  onNotify,
}: SwitchLedgerModalProps) {
  const [newLedgerName, setNewLedgerName] = useState('');

  const activeLedger = ledgers.find((l) => l.id === activeLedgerId) ?? ledgers[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLedgerName.trim()) return;
    onCreateLedger(newLedgerName.trim());
    setNewLedgerName('');
    onNotify('تم إنشاء الدفتر الجديد والتبديل إليه');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="الدفاتر والمزامنة والنسخ الاحتياطي"
      subtitle="التبديل بين دفاتر الخزنة أو تصدير بياناتك"
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <div className="text-xs font-bold text-[#57534E]">الدفاتر المتاحة</div>
          <div className="space-y-2">
            {ledgers.map((l) => {
              const active = l.id === activeLedgerId;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => {
                    onSelectLedger(l.id);
                    onClose();
                    onNotify(`تم التبديل إلى ${l.title}`);
                  }}
                  className={`w-full min-h-[52px] px-4 py-2.5 rounded-xl border flex items-center justify-between gap-3 text-right transition-colors ${
                    active
                      ? 'bg-[#EEF2FF] border-[#3730A3] text-[#3730A3]'
                      : 'bg-white border-[#E7E5E4] text-[#1C1917] hover:bg-[#F8F7F4]'
                  }`}
                >
                  <div>
                    <div className="text-sm font-bold">{l.title}</div>
                    <div className="text-xs text-[#57534E] tabular-nums">
                      {l.contacts.length} حساب · {l.cashbook.length} حركة نقدية
                    </div>
                  </div>
                  {active && <Check className="w-5 h-5 text-[#3730A3] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleCreate} className="pt-3 border-t border-[#E7E5E4] space-y-2.5">
          <label className="block text-xs font-bold text-[#57534E]">
            إنشاء دفتر / خزنة جديدة
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newLedgerName}
              onChange={(e) => setNewLedgerName(e.target.value)}
              placeholder="مثال: خزنة فرع الإسكندرية"
              className="flex-1 min-h-[42px] px-3 text-sm border border-[#E7E5E4] rounded-xl focus:outline-none focus:border-[#3730A3]"
            />
            <button
              type="submit"
              className="min-h-[42px] px-4 rounded-xl bg-[#3730A3] hover:bg-[#312E81] text-white text-xs font-bold inline-flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء</span>
            </button>
          </div>
        </form>

        {activeLedger && (
          <div className="pt-3 border-t border-[#E7E5E4] flex items-center justify-between gap-3">
            <div className="text-xs text-[#57534E]">
              تصدير نسخة كاملة من الدفتر الحالي
            </div>
            <button
              type="button"
              onClick={() => {
                exportFullLedgerCsv(activeLedger);
                onNotify('تم تصدير النسخة الشاملة بصيغة CSV');
              }}
              className="min-h-[40px] px-3.5 rounded-xl bg-[#EEF2FF] text-[#3730A3] hover:bg-[#E0E7FF] text-xs font-bold inline-flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>تصدير CSV</span>
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
