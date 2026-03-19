import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Home, Receipt, ShoppingBag, ArrowRight, Clock } from 'lucide-react';
import { useCart } from '../../src/context/CartContext';
import { useLanguage } from '../../src/context/LanguageContext';
import confetti from 'canvas-confetti';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { clearCart } = useCart();
    const { t } = useLanguage();

    const orderId = searchParams.get('order_id');
    const amount = searchParams.get('amount');
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        // Clear the cart after successful payment
        clearCart();

        // Celebration Shower!
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            // since particles fall down, start a bit higher than random
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        // Auto-redirect timer
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(interval);
            clearInterval(timer);
        };
    }, [clearCart, navigate]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 pt-20 pb-12">
            <div className="max-w-2xl w-full">
                {/* Success Card */}
                <div className="bg-white rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] p-12 md:p-20 text-center relative overflow-hidden backdrop-blur-3xl border border-white">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500"></div>
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"></div>
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-500/10 rounded-full blur-[100px]"></div>

                    <div className="relative z-10">
                        {/* Grand Success Icon */}
                        <div className="mb-12 relative flex justify-center">
                            <div className="absolute inset-0 bg-emerald-400 rounded-full scale-[2.5] blur-[80px] opacity-20 animate-pulse"></div>
                            <div className="relative bg-gradient-to-br from-emerald-400 to-teal-600 text-white p-10 rounded-[2.5rem] shadow-2xl shadow-emerald-200/50 animate-bounce-subtle">
                                <CheckCircle size={72} strokeWidth={3} />
                            </div>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tighter leading-none">
                            {t('paymentverified')}
                        </h1>
                        
                        <p className="text-slate-500 text-xl mb-12 max-w-lg mx-auto font-bold leading-relaxed">
                            {t('paymentmsg')}
                        </p>

                        {/* Order Identity Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                            <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 group hover:border-indigo-200 transition-all">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 text-center">{t('receiptref')}</p>
                                <p className="text-2xl font-black text-slate-800 tracking-tighter text-center">#{orderId?.split('-').pop() || 'SYNCING'}</p>
                            </div>
                            <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 group hover:border-indigo-200 transition-all">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 text-center">{t('transvalue')}</p>
                                <p className="text-2xl font-black text-indigo-600 tracking-tighter text-center">₹{amount || '1,436.00'}</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center gap-6 mb-12">
                            <div className="flex items-center gap-3 bg-emerald-50 px-6 py-3 rounded-2xl">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
                                <p className="text-sm font-black text-emerald-700 uppercase tracking-widest">{t('emaildispatched')}</p>
                            </div>
                            <div className="flex items-center gap-2 text-indigo-500 font-black text-xs uppercase tracking-[0.3em] bg-indigo-50 px-8 py-4 rounded-full border border-indigo-100/50">
                                <Clock size={16} className="animate-spin-slow" />
                                {t('landinghome')} {countdown}s
                            </div>
                        </div>

                        {/* High Impact Actions */}
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <button
                                onClick={() => navigate('/')}
                                className="group px-10 py-6 bg-slate-900 text-white rounded-[2rem] font-black flex items-center justify-center gap-3 transition-all hover:bg-slate-800 hover:-translate-y-2 active:scale-95 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] text-sm uppercase tracking-widest"
                            >
                                <Home size={20} />
                                {t('backtobase')}
                            </button>

                            <button
                                onClick={() => navigate(orderId ? `/track-order/${orderId}` : '/orders')}
                                className="group px-10 py-6 bg-white text-slate-900 border-4 border-slate-100 rounded-[2rem] font-black flex items-center justify-center gap-3 transition-all hover:bg-slate-50 hover:border-indigo-100 active:scale-95 text-sm uppercase tracking-widest"
                            >
                                <Receipt size={20} className="text-indigo-500" />
                                {t('trackmybox')}
                            </button>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-center text-slate-400 text-sm font-medium">
                    {t('needhelp')} <button className="text-blue-500 hover:underline">{t('contactsupport')}</button>
                </p>
            </div>
        </div>
    );
};

export default PaymentSuccess;
