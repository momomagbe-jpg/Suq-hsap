import { useEffect, useMemo, useState } from 'react';
import { Copy, Phone, Check, ExternalLink } from 'lucide-react';
import type { LedgerContact } from '../types';
import {
  buildWhatsAppUrl,
  normalizeEgyptianWhatsAppPhone,
  validatePhoneNumber,
} from '../utils/formatters';
import { WhatsAppIcon } from './LedgerIcons';
import { Modal } from './Modal';

type TemplateKey = 'friendly' | 'formal' | 'custom';

interface WhatsAppReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: LedgerContact | null;
  amount: number;
  daysElapsed: number;
  currency: string;
  ledgerTitle: string;
  onSavePhone: (contactId: string, phone: string) => void;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

function generateTemplateText(
  key: Exclude<TemplateKey, 'custom'>,
  name: string,
  amount: number,
  days: number,
  currency: string,
  ledgerTitle: string
): string {
  const amtText = amount.toFixed(1);
  if (key === 'friendly') {
    return `أهلاً أستاذ/ة ${name}، تحية طيبة من ${ledgerTitle}. نذكّر حضرتك بلطف بوجود رصيد مستحق بقيمة ${amtText} ${currency} منذ ${days} أيام. يسعدنا تواصلكم لتسوية الحساب في الوقت المناسب لحضرتك، وشكراً لتعاملكم معنا.`;
  }
  return `السلام عليكم ${name}، نود إشعاركم بأن المبلغ المتبقي لحسابكم في ${ledgerTitle} هو ${amtText} ${currency} (مضت ${days} أيام). نرجو تأكيد موعد السداد المناسب لكم، مع جزيل الشكر.`;
}

export function WhatsAppReminderModal({
  isOpen,
  onClose,
  contact,
  amount,
  daysElapsed,
  currency,
  ledgerTitle,
  onSavePhone,
  onNotify,
}: WhatsAppReminderModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>('friendly');
  const [messageText, setMessageText] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !contact) return;
    setSelectedTemplate('friendly');
    setMessageText(
      generateTemplateText(
        'friendly',
        contact.name,
        amount,
        daysElapsed,
        currency,
        ledgerTitle
      )
    );
    setPhoneInput(contact.phone ?? '');
    setPhoneError(null);
    setCopied(false);
  }, [isOpen, contact, amount, daysElapsed, currency, ledgerTitle]);

  const handleSelectTemplate = (key: TemplateKey) => {
    setSelectedTemplate(key);
    if (!contact) return;
    if (key === 'friendly' || key === 'formal') {
      setMessageText(
        generateTemplateText(
          key,
          contact.name,
          amount,
          daysElapsed,
          currency,
          ledgerTitle
        )
      );
    } else if (key === 'custom') {
      // Keep current text or give a clean starter if empty
      if (!messageText.trim()) {
        setMessageText(
          `مرحباً ${contact.name}، تذكير بالرصيد المستحق (${amount.toFixed(1)} ${currency}) لدى ${ledgerTitle}.`
        );
      }
    }
  };

  const normalizedPhone = useMemo(
    () => normalizeEgyptianWhatsAppPhone(phoneInput),
    [phoneInput]
  );

  const whatsappUrl = useMemo(() => {
    const validPhone = phoneError ? undefined : normalizedPhone ?? undefined;
    return buildWhatsAppUrl(validPhone, messageText);
  }, [normalizedPhone, phoneError, messageText]);

  const handlePhoneChange = (val: string) => {
    setPhoneInput(val);
    setPhoneError(validatePhoneNumber(val));
  };

  const handleSavePhoneOnly = () => {
    if (!contact) return;
    const err = validatePhoneNumber(phoneInput);
    if (err) {
      setPhoneError(err);
      return;
    }
    onSavePhone(contact.id, phoneInput.trim());
    onNotify('تم حفظ رقم الواتساب للحساب');
  };

  const handleSendClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!contact) return;
    if (!messageText.trim()) {
      e.preventDefault();
      onNotify('يرجى كتابة نص الرسالة أولاً', 'error');
      return;
    }
    const err = validatePhoneNumber(phoneInput);
    if (err) {
      e.preventDefault();
      setPhoneError(err);
      return;
    }
    // Auto-save phone if entered/updated
    const trimmed = phoneInput.trim();
    if (trimmed && trimmed !== (contact.phone ?? '')) {
      onSavePhone(contact.id, trimmed);
    }
    onNotify(
      normalizedPhone
        ? 'جاري فتح محادثة واتساب مع العميل...'
        : 'جاري فتح واتساب لاختيار جهة الاتصال...'
    );
  };

  const handleCopyMessage = async () => {
    if (!messageText.trim()) return;
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      onNotify('تم نسخ نص التذكير للحافظة');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      onNotify('تعذر النسخ التلقائي', 'info');
    }
  };

  if (!contact) return null;

  const hasSavedPhone = Boolean(contact.phone?.trim());
  const phoneChanged = phoneInput.trim() !== (contact.phone ?? '').trim();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تذكير عبر واتساب"
      subtitle={`${contact.name} · الرصيد المستحق: ${amount.toFixed(1)} ${currency}`}
      maxWidthClass="max-w-lg"
    >
      <div className="space-y-4">
        {/* Phone Number Field with Egyptian formatting feedback */}
        <div className="p-3.5 rounded-2xl bg-[#F8F7F4] border border-[#E7E5E4] space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#3730A3]" />
              <span>رقم الواتساب / الهاتف</span>
            </label>
            {normalizedPhone && !phoneError && (
              <span className="text-[11px] font-semibold text-[#15803D] tabular-nums">
                رابط دولي: {normalizedPhone}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="tel"
              dir="ltr"
              value={phoneInput}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="01012345678"
              className="flex-1 min-h-[42px] px-3 py-2 text-sm text-right bg-white border border-[#E7E5E4] rounded-xl tabular-nums focus:outline-none focus:border-[#3730A3]"
            />
            {phoneChanged && !phoneError && (
              <button
                type="button"
                onClick={handleSavePhoneOnly}
                className="min-h-[42px] px-3 rounded-xl bg-[#EEF2FF] text-[#3730A3] hover:bg-[#E0E7FF] text-xs font-bold shrink-0 inline-flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>حفظ</span>
              </button>
            )}
          </div>

          {phoneError ? (
            <p className="text-[11px] font-bold text-[#DC2626]">{phoneError}</p>
          ) : !hasSavedPhone && !phoneInput.trim() ? (
            <p className="text-[11px] text-[#57534E]">
              لا يوجد رقم محفوظ لهذا الحساب. يمكنك إدخال رقم مصري (مثل 010...) أو الإرسال
              مباشرة لاختيار جهة الاتصال داخل واتساب.
            </p>
          ) : null}
        </div>

        {/* Ready-made Templates Selector */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-[#57534E]">اختر قالب الرسالة</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'friendly' as TemplateKey, label: 'تذكير ودي لطيف' },
              { id: 'formal' as TemplateKey, label: 'الرصيد والمدة' },
              { id: 'custom' as TemplateKey, label: 'نص مخصص' },
            ].map((tpl) => {
              const active = selectedTemplate === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl.id)}
                  className={`min-h-[40px] px-2.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    active
                      ? 'bg-[#3730A3] text-white border-[#3730A3]'
                      : 'bg-white text-[#1C1917] border-[#E7E5E4] hover:bg-[#F8F7F4]'
                  }`}
                >
                  {tpl.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Editable Message Box */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#1C1917]">
              نص الرسالة (قابل للتعديل)
            </label>
            <button
              type="button"
              onClick={handleCopyMessage}
              className="text-xs font-bold text-[#3730A3] hover:underline inline-flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
            </button>
          </div>
          <textarea
            rows={4}
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value);
              if (selectedTemplate !== 'custom') {
                setSelectedTemplate('custom');
              }
            }}
            placeholder="اكتب رسالة التذكير هنا..."
            className="w-full p-3 text-sm leading-relaxed bg-white border border-[#E7E5E4] rounded-xl focus:outline-none focus:border-[#3730A3]"
          />
        </div>

        {/* Live Final Message Preview */}
        <div className="rounded-2xl bg-[#ECFDF5] border border-[#BBF7D0] p-3.5 space-y-1">
          <div className="text-[11px] font-bold text-[#15803D]">
            معاينة الرسالة النهائية
          </div>
          <p className="text-xs text-[#1C1917] leading-relaxed whitespace-pre-wrap">
            {messageText.trim() || 'سيظهر نص الرسالة النهائية هنا...'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E7E5E4]">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 text-sm font-semibold text-[#57534E] bg-white border border-[#E7E5E4] rounded-xl hover:bg-[#F8F7F4]"
          >
            إغلاق
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleSendClick}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-sm font-bold inline-flex items-center gap-2 transition-colors"
          >
            <WhatsAppIcon className="w-4 h-4 shrink-0" />
            <span>إرسال عبر واتساب</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80 shrink-0" />
          </a>
        </div>
      </div>
    </Modal>
  );
}
