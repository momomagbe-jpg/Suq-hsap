import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  danger = true,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidthClass="max-w-md">
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              danger ? 'bg-[#FEE2E2] text-[#DC2626]' : 'bg-[#EEF2FF] text-[#3730A3]'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="text-sm text-[#57534E] leading-relaxed pt-0.5">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E7E5E4]">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[42px] px-4 py-2 text-sm font-semibold text-[#57534E] bg-white border border-[#E7E5E4] rounded-xl hover:bg-[#F8F7F4] transition-colors whitespace-nowrap"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`min-h-[42px] px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors whitespace-nowrap ${
              danger
                ? 'bg-[#DC2626] hover:bg-[#B91C1C]'
                : 'bg-[#3730A3] hover:bg-[#312E81]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
