import React from 'react';
import { Info, AlertTriangle, CheckCircle, XCircle, Bell } from 'lucide-react';

const styles = {
    info: {
        bg: 'bg-blue-50/80',
        border: 'border-blue-200',
        text: 'text-blue-800',
        icon: Info,
        iconColor: 'text-blue-500'
    },
    warning: {
        bg: 'bg-amber-50/80',
        border: 'border-amber-200',
        text: 'text-amber-800',
        icon: AlertTriangle,
        iconColor: 'text-amber-500'
    },
    error: {
        bg: 'bg-rose-50/80',
        border: 'border-rose-200',
        text: 'text-rose-800',
        icon: XCircle,
        iconColor: 'text-rose-500'
    },
    success: {
        bg: 'bg-emerald-50/80',
        border: 'border-emerald-200',
        text: 'text-emerald-800',
        icon: CheckCircle,
        iconColor: 'text-emerald-500'
    },
    premium: {
        bg: 'bg-gradient-to-r from-indigo-50 to-purple-50',
        border: 'border-indigo-200',
        text: 'text-indigo-900',
        icon: Bell,
        iconColor: 'text-indigo-600'
    }
};

const Callout = ({ type = 'info', title, message, children, icon: CustomIcon, className = '' }) => {
    const style = styles[type] || styles.info;
    const Icon = CustomIcon || style.icon;

    return (
        <div className={`p-4 rounded-2xl border ${style.bg} ${style.border} ${className} flex gap-4 transition-all duration-300 hover:shadow-md`}>
            <div className={`mt-0.5 ${style.iconColor}`}>
                <Icon size={20} />
            </div>
            <div className="flex-1">
                {title && <h4 className={`text-sm font-bold mb-1 ${style.text}`}>{title}</h4>}
                <div className={`text-sm leading-relaxed opacity-90 ${style.text}`}>
                    {message || children}
                </div>
            </div>
        </div>
    );
};

export default Callout;
