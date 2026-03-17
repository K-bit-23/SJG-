import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Sparkles, X, CheckCircle, Info, AlertTriangle, XCircle } from 'lucide-react';
import Callout from './Callout';

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
    const { toast, clearToast, alert, clearAlert, callout, clearCallout } = useNotifications();

    return (
        <>
            {/* Global Persistent Callout / Banner - fixed so it doesn't push layout */}
            {callout && (
                <div className="fixed top-0 left-0 right-0 z-[60] bg-indigo-600 flex justify-center py-1.5 px-4 shadow-sm">
                    <div className="max-w-7xl w-full flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="flex h-2 w-2 relative shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                            </span>
                            <p className="text-sm font-semibold text-white tracking-tight">
                                {callout.title && <span className="text-yellow-300 mr-2">{callout.title}</span>}
                                {callout.message}
                            </p>
                        </div>
                        <button onClick={clearCallout} className="p-1 hover:bg-white/20 rounded-full transition-colors text-white/80">
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}
            {/* Top-Center Alert (Blocking / High Priority) */}
            {alert && (
                <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4 animate-slide-down">
                    <div className={`${alertStyles[alert.type] || alertStyles.info} rounded-3xl p-6 shadow-2xl border-2 flex items-start justify-between gap-5 backdrop-blur-xl bg-opacity-95`}>
                        <div className="flex-shrink-0 mt-1">
                            {alert.type === 'success' && <CheckCircle size={28} className="text-white/80" />}
                            {alert.type === 'error' && <XCircle size={28} className="text-white/80" />}
                            {alert.type === 'warning' && <AlertTriangle size={28} className="text-slate-800/80" />}
                            {alert.type === 'info' && <Info size={28} className="text-white/80" />}
                        </div>
                        <div className="flex-1">
                            {alert.title && <h4 className={`text-sm font-black uppercase tracking-[0.2em] mb-1.5 ${alert.type === 'warning' ? 'text-slate-900' : 'text-white'}`}>{alert.title}</h4>}
                            <p className={`text-sm font-bold leading-relaxed ${alert.type === 'warning' ? 'text-slate-800/90' : 'text-white/90'}`}>{alert.message}</p>
                        </div>
                        <button onClick={clearAlert} className={`flex-shrink-0 p-2 rounded-xl transition-all ${alert.type === 'warning' ? 'hover:bg-black/5 text-slate-900' : 'hover:bg-white/10 text-white'}`}>
                            <X size={20} />
                        </button>
                    </div>
                    {/* Glass refraction effect */}
                    <div className="absolute inset-0 bg-white/10 blur-3xl -z-10 rounded-full scale-110 opacity-50"></div>
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
