import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Sparkles, X, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const alertStyles = {
  success: 'bg-emerald-500 text-white border-emerald-400',
  error: 'bg-rose-500 text-white border-rose-400',
  info: 'bg-sky-500 text-white border-sky-400',
  warning: 'bg-amber-500 text-slate-900 border-amber-400',
};

const toastStyles = {
  success: 'bg-white border-l-4 border-emerald-500 text-gray-800',
  error: 'bg-white border-l-4 border-rose-500 text-gray-800',
  info: 'bg-white border-l-4 border-sky-500 text-gray-800',
  warning: 'bg-white border-l-4 border-amber-500 text-gray-800',
};

const NotificationBar = () => {
    const { toast, clearToast, alert, clearAlert } = useNotifications();

    return (
        <>
            {/* Top-Center Alert (Blocking / High Priority) */}
            {alert && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4 animate-slide-down">
                    <div className={`${alertStyles[alert.type] || alertStyles.info} rounded-2xl p-4 shadow-xl border flex items-center justify-between gap-4 backdrop-blur-md bg-opacity-95`}>
                        <div className="flex items-center gap-3">
                            <Sparkles size={18} />
                            <p className="text-sm font-bold tracking-tight">{alert.message}</p>
                        </div>
                        <button onClick={clearAlert} className="p-1 hover:bg-black/10 rounded-full transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Top-Right Toast (Non-blocking / Info) */}
            {toast && (
                <div className="fixed top-4 right-4 z-[100] animate-slide-left max-w-sm">
                    <div className={`${toastStyles[toast.type] || toastStyles.info} shadow-xl rounded-xl p-4 flex items-start gap-3`}>
                        <div className="mt-0.5">
                            {toast.type === 'success' && <CheckCircle className="text-emerald-500" size={18} />}
                            {toast.type === 'error' && <AlertTriangle className="text-rose-500" size={18} />}
                            {toast.type === 'info' && <Info className="text-sky-500" size={18} />}
                            {toast.type === 'warning' && <AlertTriangle className="text-amber-500" size={18} />}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold">{toast.message}</p>
                        </div>
                        <button onClick={clearToast} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                .animate-slide-down {
                    animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .animate-slide-left {
                    animation: slideLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes slideDown {
                    from { transform: translate(-50%, -100%); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
                @keyframes slideLeft {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </>
    );
};

export default NotificationBar;
