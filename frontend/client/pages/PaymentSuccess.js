import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Home, Receipt, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../src/context/CartContext';
import confetti from 'canvas-confetti';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { clearCart } = useCart();

    const orderId = searchParams.get('order_id');
    const amount = searchParams.get('amount');

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

        return () => clearInterval(interval);
    }, [clearCart]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 pt-20 pb-12">
            <div className="max-w-2xl w-full">
                {/* Success Card */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-100/50 p-8 md:p-12 text-center relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"></div>
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-50 rounded-full blur-3xl opacity-50"></div>
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50"></div>

                    <div className="relative z-10">
                        {/* Animated Icon */}
                        <div className="mb-8 relative flex justify-center">
                            <div className="absolute inset-0 bg-green-100 rounded-full scale-150 blur-xl opacity-50 animate-pulse"></div>
                            <div className="relative bg-green-500 text-white p-6 rounded-full shadow-lg shadow-green-200 animate-bounce-subtle">
                                <CheckCircle size={48} strokeWidth={2.5} />
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight">
                            Success! <span className="text-green-500">Order Placed</span>
                        </h1>
                        
                        <p className="text-slate-500 text-lg mb-10 max-w-md mx-auto leading-relaxed">
                            Your payment was processed successfully. We've started preparing your items for delivery!
                        </p>

                        {/* Order Info Plate */}
                        <div className="bg-slate-50 rounded-3xl p-6 md:p-8 mb-10 border border-slate-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center md:text-left">Order Reference</p>
                                    <p className="text-lg font-bold text-slate-700 text-center md:text-left">#{orderId || 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center md:text-left">Amount Paid</p>
                                    <p className="text-lg font-bold text-slate-700 text-center md:text-left">₹{amount || '1,436.00'}</p>
                                </div>
                            </div>
                            
                            <div className="mt-6 pt-6 border-t border-slate-200/60 flex items-center justify-center md:justify-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <p className="text-sm font-semibold text-slate-600">Confirmation email sent to your inbox</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => navigate('/')}
                                className="group relative px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:bg-slate-800 hover:scale-105 active:scale-95 shadow-xl shadow-slate-200"
                            >
                                <Home size={20} />
                                <span>Return Home</span>
                                <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <button
                                onClick={() => navigate(orderId ? `/track-order/${orderId}` : '/orders')}
                                className="px-8 py-4 bg-white text-slate-700 border-2 border-slate-100 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:bg-slate-50 hover:border-slate-200 active:scale-95 shadow-sm"
                            >
                                <Receipt size={20} className="text-slate-400" />
                                <span>Track Order</span>
                            </button>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-center text-slate-400 text-sm font-medium">
                    Need help? <button className="text-blue-500 hover:underline">Contact our support team</button>
                </p>
            </div>
        </div>
    );
};

export default PaymentSuccess;
