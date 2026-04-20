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
      icon: 'text-red-400',
      bg: 'bg-red-500/20',
      border: 'border-red-500/30',
      button: 'bg-red-600 hover:bg-red-500 shadow-[0_0_20px_-5px_rgba(239,68,68,0.5)]',
    },
    warning: {
      icon: 'text-yellow-400',
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500/30',
      button: 'bg-yellow-600 hover:bg-yellow-500 shadow-[0_0_20px_-5px_rgba(234,179,8,0.5)]',
    },
    info: {
      icon: 'text-blue-400',
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/30',
      button: 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)]',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Modal */}
      <div className="relative bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        <div className={`w-14 h-14 rounded-2xl ${styles.bg} border ${styles.border} flex items-center justify-center mx-auto mb-4`}>
          <AlertTriangle className={`w-7 h-7 ${styles.icon}`} />
        </div>
        <h2 className="text-xl font-bold text-white text-center mb-2">{title}</h2>
        <p className="text-gray-400 text-center text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:bg-zinc-900 font-semibold transition-all"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-xl text-white font-bold transition-all ${styles.button}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
