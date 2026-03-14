import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { X, CheckCircle, AlertCircle, Info, ShieldCheck } from 'lucide-react';

const GlobalToaster = () => {
    const { toast, clearToast } = useNotifications();

    if (!toast) return null;

    const styles = {
        success: {
            bg: 'bg-emerald-50 border-emerald-100',
            text: 'text-emerald-700',
            icon: <CheckCircle className="text-emerald-500" size={20} />
        },
        error: {
            bg: 'bg-red-50 border-red-100',
            text: 'text-red-700',
            icon: <AlertCircle className="text-red-500" size={20} />
        },
        info: {
            bg: 'bg-blue-50 border-blue-100',
            text: 'text-blue-700',
            icon: <Info className="text-blue-500" size={20} />
        }
    };

    const style = styles[toast.type] || styles.info;

    return (
        <div 
            className={`fixed bottom-6 right-6 z-[100] max-w-sm w-full animate-fade-in-up`}
            style={{ animation: 'toastIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
            <div className={`p-4 rounded-2xl shadow-2xl border ${style.bg} flex items-center gap-4 backdrop-blur-xl bg-opacity-95`}>
                <div className="shrink-0">
                    {style.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${style.text} leading-tight`}>
                        {toast.message}
                    </p>
                </div>
                <button 
                    onClick={clearToast}
                    className="shrink-0 p-1 hover:bg-black/5 rounded-full transition-colors"
                >
                    <X size={16} className="text-gray-400" />
                </button>
            </div>

            <style>{`
                @keyframes toastIn {
                    from { transform: translateX(100%) scale(0.9); opacity: 0; }
                    to { transform: translateX(0) scale(1); opacity: 1; }
                }
                .animate-fade-in-up {
                    transition: all 0.3s ease;
                }
            `}</style>
        </div>
    );
};

export default GlobalToaster;
