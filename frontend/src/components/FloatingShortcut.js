import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Package, ShoppingCart, MessageCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const FloatingShortcut = () => {
    const { user } = useAuth();
    const [enabled, setEnabled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (user) {
            api.get(`/settings/${encodeURIComponent(user.email)}/`)
                .then(res => {
                    if (res.data.floating_shortcut) {
                        setEnabled(true);
                    }
                })
                .catch(err => console.error("Error fetching shortcut setting:", err));
        }
    }, [user]);

    if (!enabled) return null;

    return (
        <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3">
            {/* Expanded Menu */}
            {isOpen && (
                <div className="flex flex-col gap-3 mb-2 animate-fade-in-up">
                    <Link 
                        to="/orders" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 hover:scale-110 transition-all text-gray-700 dark:text-gray-200"
                    >
                        <span className="text-xs font-bold">Track Orders</span>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                            <Package size={20} />
                        </div>
                    </Link>
                    <Link 
                        to="/cart" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 hover:scale-110 transition-all text-gray-700 dark:text-gray-200"
                    >
                        <span className="text-xs font-bold">Checkout Cart</span>
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
                            <ShoppingCart size={20} />
                        </div>
                    </Link>
                    <Link 
                        to="/contact" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 hover:scale-110 transition-all text-gray-700 dark:text-gray-200"
                    >
                        <span className="text-xs font-bold">Get Support</span>
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-xl">
                            <MessageCircle size={20} />
                        </div>
                    </Link>
                </div>
            )}

            {/* Main Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-3 rounded-full shadow-2xl transition-all duration-500 flex items-center justify-center ${
                    isOpen 
                    ? 'bg-red-500 text-white rotate-90' 
                    : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:scale-110 hover:shadow-indigo-500/40'
                }`}
            >
                {isOpen ? <X size={20} /> : <Sparkles size={20} className="animate-pulse" />}
            </button>
        </div>
    );
};

export default FloatingShortcut;
