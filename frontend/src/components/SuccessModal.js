import React, { useEffect } from 'react';
import { CheckCircle, X, ArrowRight, ShoppingBag, Truck, Receipt, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

const SuccessModal = ({ isOpen, onClose, orderId, total }) => {
    const navigate = useNavigate();
    const [countdown, setCountdown] = React.useState(5);

    useEffect(() => {
        if (isOpen) {
            // Celebration!
            const count = 200;
            const defaults = { origin: { y: 0.7 }, zIndex: 10000 };
            const fire = (particleRatio, opts) => {
                confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
            };

            fire(0.25, { spread: 26, startVelocity: 55 });
            fire(0.2, { spread: 60 });
            fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
            fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
            fire(0.1, { spread: 120, startVelocity: 45 });

            // Auto-redirect timer
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        navigate('/');
                        onClose();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [isOpen, navigate, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-zoom-in">
                {/* Top Banner Gradient */}
                <div className="h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-600"></div>

                <div className="p-8 md:p-12">
                    {/* Close Button */}
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    {/* Success Icon */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-100 rounded-full scale-150 blur-2xl opacity-50 animate-pulse"></div>
                            <div className="relative bg-emerald-500 text-white p-6 rounded-full shadow-lg shadow-emerald-200">
                                <CheckCircle size={48} strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="text-center space-y-3 mb-10">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Order Confirmed!</h2>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            Thank you for your purchase. Your items are being prepared for a spectacular delivery.
                        </p>
                    </div>

                    {/* Order Summary Plate */}
                    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 mb-8">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Reference</span>
                                <span className="block text-sm font-bold text-slate-700">#{orderId?.split('-').pop() || 'Processing'}</span>
                            </div>
                            <div className="space-y-1 text-right">
                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount Paid</span>
                                <span className="block text-sm font-bold text-emerald-600">₹{total}</span>
                            </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-2">
                            <Truck size={14} className="text-slate-400" />
                            <span className="text-[11px] font-bold text-slate-500">Scheduled for delivery registry update</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            onClick={() => {
                                onClose();
                                navigate('/orders');
                            }}
                            className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-95 shadow-xl shadow-slate-200"
                        >
                            <ShoppingBag size={18} />
                            <span>My Orders</span>
                        </button>
                        
                        <button
                            onClick={() => {
                                onClose();
                                navigate('/');
                            }}
                            className="flex items-center justify-center gap-2 px-6 py-4 bg-white text-slate-700 border-2 border-slate-100 rounded-2xl font-bold transition-all hover:bg-slate-50 hover:border-slate-200 active:scale-95"
                        >
                            <ArrowRight size={18} />
                            <span>Continue</span>
                        </button>
                    </div>
                </div>

                {/* Footer Micro-copy */}
                <div className="bg-slate-50 py-4 text-center border-t border-slate-100">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center justify-center gap-2">
                        <Clock size={12} className="animate-pulse" /> Redirecting to home in {countdown}s
                    </p>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes zoom-in { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                .animate-zoom-in { animation: zoom-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
            `}} />
        </div>
    );
};

export default SuccessModal;
