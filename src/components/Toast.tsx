import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-[0_12px_32px_-4px_rgba(37,36,58,0.08)] backdrop-blur-md transition-all duration-300 animate-in slide-in-from-right ${
              isSuccess
                ? 'bg-[#F2FBF9]/95 border-[#C2E8E1]'
                : isError
                ? 'bg-[#FEF9F9]/95 border-[#FCD5D6]'
                : 'bg-white/95 border-[#EAEAF2]'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#4FAE9B] shrink-0 mt-0.5" />}
            {isError && <AlertCircle className="w-5 h-5 text-[#F47174] shrink-0 mt-0.5" />}
            {!isSuccess && !isError && <Info className="w-5 h-5 text-[#8275D8] shrink-0 mt-0.5" />}

            <div className="flex-1 text-xs sm:text-sm">
              <p className="font-bold text-[#25243A]">{toast.title}</p>
              {toast.description && <p className="text-xs text-[#77778A] mt-0.5 leading-relaxed">{toast.description}</p>}
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#77778A] hover:text-[#25243A] p-1 rounded-lg hover:bg-black/5 transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
