import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidthClass?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidthClass = 'max-w-lg',
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-[#1C1917]/50 backdrop-blur-[2px] no-print"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full ${maxWidthClass} bg-white rounded-t-3xl sm:rounded-2xl border border-[#E7E5E4] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
      >
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center">
          <span className="w-10 h-1.5 rounded-full bg-[#E7E5E4]" />
        </div>
        <div className="flex items-start justify-between gap-4 px-5 py-3.5 border-b border-[#E7E5E4] bg-white">
          <div className="min-w-0">
            <h2 id="modal-title" className="text-base sm:text-lg font-bold text-[#1C1917] leading-snug">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-[#57534E] mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center -ml-2 text-[#57534E] hover:text-[#1C1917] hover:bg-[#F8F7F4] rounded-xl transition-colors shrink-0"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
