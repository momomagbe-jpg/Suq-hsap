import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import type { ToastNotification } from '../types';

interface ToastContainerProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-20 left-4 right-4 sm:right-auto sm:left-6 z-50 flex flex-col gap-2 sm:max-w-sm pointer-events-none no-print"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const styles =
          toast.type === 'success'
            ? 'bg-[#312E81] text-white border-[#3730A3]'
            : toast.type === 'error'
            ? 'bg-[#DC2626] text-white border-[#B91C1C]'
            : 'bg-white text-[#1C1917] border-[#E7E5E4]';

        const Icon =
          toast.type === 'success'
            ? CheckCircle2
            : toast.type === 'error'
            ? AlertCircle
            : Info;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-semibold ${styles}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  toast.type === 'success'
                    ? 'text-[#A5B4FC]'
                    : toast.type === 'error'
                    ? 'text-white'
                    : 'text-[#3730A3]'
                }`}
              />
              <span className="truncate">{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="p-1 opacity-75 hover:opacity-100 transition-opacity shrink-0"
              aria-label="إغلاق التنبيه"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
