import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Sparkles, X } from 'lucide-react';

const typeStyles = {
  success: 'bg-emerald-600 text-white',
  error: 'bg-rose-600 text-white',
  info: 'bg-sky-600 text-white',
  warning: 'bg-amber-600 text-slate-900',
};

const alertStyles = {
  success: 'bg-emerald-500 text-white border-emerald-400',
  error: 'bg-rose-500 text-white border-rose-400',
  info: 'bg-sky-500 text-white border-sky-400',
  warning: 'bg-amber-500 text-slate-900 border-amber-400',
};

const NotificationBar = () => {
    const { barMessage, toast, clearToast, alert, clearAlert } = useNotifications();
    const [isVisible, setIsVisible] = React.useState(true);

    return (
        <div className="fixed top-0 left-0 w-full z-[70]">
            {/* Top Stat Bar - Static Promo */}
            {barMessage && isVisible && (
                <div className="bg-gradient-to-r from-primary via-indigo-600 to-secondary text-white py-2 px-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/5 animate-pulse"></div>
                    <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 relative z-10">
                        <div className="hidden sm:flex items-center gap-2">
                            <div className="bg-white/20 p-1 rounded-md">
                                <Sparkles size={12} className="animate-spin-slow" />
                            </div>
                        </div>
                        <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-center">
                            {barMessage}
                        </p>
                        <button 
                            onClick={() => setIsVisible(false)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Alert Bar - Separator Logic */}
            {alert && (
                <div className={`mx-auto max-w-2xl mt-4 px-4 animate-slide-down`}>
                    <div className={`${alertStyles[alert.type] || alertStyles.info} rounded-2xl p-4 shadow-xl border flex items-center justify-between gap-4 backdrop-blur-md bg-opacity-95`}>
                        <div className="flex items-center gap-3">
                            <Sparkles size={18} />
                            <p className="text-sm font-bold tracking-tight">{alert.message}</p>
                        </div>
                        <button onClick={clearAlert} className="p-1 hover:bg-black/5 rounded-full transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                .animate-spin-slow {
                    animation: spin 5s linear infinite;
                }
                .animate-slide-down {
                    animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes slideDown {
                    from { transform: translateY(-100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default NotificationBar;
