import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Sparkles, X, ChevronRight, megaphone } from 'lucide-react';

const NotificationBar = () => {
    const { barMessage, updateBarMessage } = useNotifications();
    const [isVisible, setIsVisible] = React.useState(true);

    if (!isVisible || !barMessage) return null;

    return (
        <div className="bg-gradient-to-r from-primary via-indigo-600 to-secondary text-white py-2 px-4 relative overflow-hidden z-[60]">
            {/* Animated Background Pulse */}
            <div className="absolute inset-0 bg-white/5 animate-pulse"></div>
            
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 relative z-10">
                <div className="hidden sm:flex items-center gap-2">
                    <div className="bg-white/20 p-1 rounded-md">
                        <Sparkles size={12} className="animate-spin-slow" />
                    </div>
                </div>
                
                <p className="text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] text-center">
                    {barMessage}
                </p>

                <button 
                    onClick={() => setIsVisible(false)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                    <X size={14} />
                </button>
            </div>

            <style>{`
                .animate-spin-slow {
                    animation: spin 5s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default NotificationBar;
