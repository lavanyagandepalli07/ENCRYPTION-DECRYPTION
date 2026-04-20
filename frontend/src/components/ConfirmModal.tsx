import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'warning',
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-100',
      button: 'bg-red-600 hover:bg-red-700 shadow-xl shadow-red-500/20',
    },
    warning: {
      icon: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      button: 'bg-amber-600 hover:bg-amber-700 shadow-xl shadow-amber-500/20',
    },
    info: {
      icon: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      button: 'bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-blue-950/20 backdrop-blur-md"
        onClick={onCancel}
      />
      {/* Modal */}
      <div className="relative glass border-blue-100 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(37,99,235,0.1)] max-w-sm w-full p-10 animate-scale-in">
        <div className={`w-20 h-20 rounded-3xl ${styles.bg} border ${styles.border} flex items-center justify-center mx-auto mb-8 shadow-xl`}>
          <AlertTriangle className={`w-10 h-10 ${styles.icon}`} />
        </div>
        <h2 className="text-2xl font-black text-blue-950 text-center mb-3 tracking-tighter">{title}</h2>
        <p className="text-blue-900/40 text-center text-xs font-bold uppercase tracking-widest leading-relaxed mb-10">{message}</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className={`w-full py-4 rounded-2xl text-white font-bold transition-all uppercase tracking-widest text-xs active:scale-[0.98] ${styles.button}`}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="w-full py-4 rounded-2xl border border-blue-100 text-blue-900/40 hover:bg-blue-50 font-bold uppercase tracking-widest text-xs transition-all active:scale-[0.98]"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
