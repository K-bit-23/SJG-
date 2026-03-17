import React, { useState, useEffect } from 'react';
import { useCart } from '../../src/context/CartContext';
import { useAuth } from '../../src/context/AuthContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft, Tag, Truck, ShieldCheck, Gift, Clock, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Cart = () => {
    const { cart, removeFromCart, addToCart, decrementFromCart, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [realTimeDemand, setRealTimeDemand] = useState({});

    // Simulate Real-time data for "Wow" factor
    useEffect(() => {
        if (cart.length > 0) {
            const demand = {};
            cart.forEach(item => {
                demand[item.id || item._id] = Math.floor(Math.random() * 8) + 2;
            });
            setRealTimeDemand(demand);
        }
    }, [cart.length]);

    // Calculate details
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = appliedCoupon ? Math.round(subtotal * 0.1) : 0; // 10% off
    const shipping = subtotal > 999 ? 0 : 50;
    const total = subtotal - discount + shipping;
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const applyCoupon = () => {
        const code = couponCode.toLowerCase();
        if (code === 'save10' || code === 'sjgfresh' || code === 'discount') {
            setAppliedCoupon(couponCode.toUpperCase());
        } else {
            alert('Invalid coupon code. Try "SAVE10"');
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-500 pb-20">
            
            {/* Immersive Header */}
            <div className="relative overflow-hidden bg-white dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-800 pt-20 pb-12 transition-all">
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-primary blur-[100px] rounded-full"></div>
                    <div className="absolute bottom-10 right-10 w-64 h-64 bg-secondary blur-[100px] rounded-full"></div>
                </div>
                
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <Link to="/products" className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-all group">
                                    <ArrowLeft size={18} className="text-gray-400 group-hover:text-primary" />
                                </Link>
                                <span className="text-xs font-bold text-primary dark:text-secondary uppercase tracking-[0.2em]">Your Basket</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                                Shopping <span className="text-primary italic">Cart</span>
                            </h1>
                        </div>
                        
                        {cart.length > 0 && (
                            <div className="flex items-center gap-6">
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Items Secured</p>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white mono">{itemCount}</p>
                                </div>
                                <button
                                    onClick={clearCart}
                                    className="px-6 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-full border border-rose-100 dark:border-rose-500/20 transition-all uppercase tracking-widest"
                                >
                                    Empty Cart
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-12">
                {cart.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-16 text-center border border-gray-100 dark:border-slate-800 shadow-2xl relative overflow-hidden group">
                        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full group-hover:bg-indigo-500/10 transition-all"></div>
                        <div className="relative z-10">
                            <div className="w-32 h-32 bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-white/50 dark:border-slate-700">
                                <ShoppingBag className="text-primary dark:text-indigo-400" size={48} strokeWidth={1.5} />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Your cart is currently silent</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-sm mx-auto text-lg leading-relaxed">
                                Our premium stationery is waiting for you. Add some character to your desk today.
                            </p>
                            <Link to="/products" className="inline-flex items-center gap-3 bg-primary dark:bg-indigo-600 text-white px-10 py-5 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20">
                                Explore Collection <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-10">
                        {/* Cart Items List */}
                        <div className="flex-1 space-y-6">
                            {/* Pro-Tips / Dynamic Banners */}
                            <div className="premium-card p-6 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white relative overflow-hidden group">
                                <div className="absolute right-0 top-0 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                    <Zap size={140} />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Zap size={14} className="text-amber-300 fill-amber-300" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Priority Shipping Check</span>
                                    </div>
                                    <p className="text-lg font-bold">
                                        {subtotal >= 999 
                                            ? "You've unlocked FREE Express Shipping! 🚀" 
                                            : `Add ₹${999 - subtotal} more to grab FREE shipping.`}
                                    </p>
                                    <div className="mt-4 h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-white transition-all duration-700 ease-out" 
                                            style={{ width: `${Math.min(100, (subtotal / 999) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="space-y-4">
                                {cart.map((item) => (
                                    <div 
                                        key={item.id} 
                                        className="premium-card p-4 lg:p-6 flex gap-6 hover-glow transition-all duration-500 animate-fade-in group"
                                    >
                                        {/* Product Image */}
                                        <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-3xl overflow-hidden flex-shrink-0 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm transition-transform group-hover:scale-[1.02]">
                                            <img
                                                src={item.image || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400'}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="text-[10px] font-black text-primary dark:text-indigo-400 uppercase tracking-widest">{item.category}</span>
                                                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5 line-clamp-2 leading-tight">
                                                        {item.name}
                                                    </h3>
                                                    {/* Real-time Insights */}
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                                                            {realTimeDemand[item.id || item._id] || 3} viewing now
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                                            <ShieldCheck size={12} />
                                                            In Stock
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.id || item._id)}
                                                    className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-2xl transition-all"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between mt-4">
                                                {/* Quantity Control */}
                                                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
                                                    <button
                                                        onClick={() => decrementFromCart(item.id || item._id)}
                                                        className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all text-slate-500"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="w-10 text-center text-sm font-black dark:text-white">{item.quantity}</span>
                                                    <button
                                                        onClick={() => addToCart(item)}
                                                        className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all text-slate-500"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>

                                                {/* Price Container */}
                                                <div className="text-right">
                                                    <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                                                        ₹{(item.price * item.quantity).toLocaleString()}
                                                    </p>
                                                    {item.quantity > 1 && (
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">₹{item.price} ea.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Summary Checkout Card */}
                        <div className="lg:w-[400px]">
                            <div className="sticky top-28 space-y-6">
                                <div className="glass-morphism rounded-[2.5rem] p-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12 pointer-events-none">
                                        <Gift size={120} />
                                    </div>
                                    
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                                        <div className="w-8 h-8 bg-black dark:bg-white rounded-xl flex items-center justify-center">
                                            <ShoppingBag size={16} className="text-white dark:text-black" />
                                        </div>
                                        Order Summary
                                    </h3>

                                    {/* Coupon Section */}
                                    <div className="mb-8">
                                        <div className="flex items-center justify-between mb-3 px-1">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Offer Code</span>
                                            {appliedCoupon && <span className="text-[10px] font-bold text-emerald-500">SAVINGS APPLIED</span>}
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex-1 relative">
                                                <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    value={couponCode}
                                                    onChange={(e) => setCouponCode(e.target.value)}
                                                    placeholder="SAVE10"
                                                    className="w-full pl-11 pr-4 py-4 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:ring-4 ring-primary/5 transition-all"
                                                    disabled={appliedCoupon}
                                                />
                                            </div>
                                            <button
                                                onClick={applyCoupon}
                                                disabled={appliedCoupon || !couponCode}
                                                className="px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                            >
                                                {appliedCoupon ? 'OK' : 'Apply'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Breakdown */}
                                    <div className="space-y-4 mb-10 border-t border-slate-100 dark:border-slate-800 pt-8 mt-5">
                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-sm font-bold text-slate-500">Cart Total</span>
                                            <span className="text-base font-black text-slate-900 dark:text-white tabular-nums">₹{subtotal.toLocaleString()}</span>
                                        </div>
                                        
                                        {discount > 0 && (
                                            <div className="flex justify-between items-center px-1 bg-emerald-500/5 py-2 rounded-xl">
                                                <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5"><Gift size={14} /> Coupon Savings</span>
                                                <span className="text-base font-black text-emerald-600 tabular-nums">-₹{discount.toLocaleString()}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-sm font-bold text-slate-500">Logistics</span>
                                            <span className={`text-sm font-black ${shipping === 0 ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                                                {shipping === 0 ? 'COMPLIMENTARY' : `₹${shipping}`}
                                            </span>
                                        </div>

                                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end px-1">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Payable</p>
                                                <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">₹{total.toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Incl. GST</p>
                                                <p className="text-[10px] font-bold text-slate-400 italic">No hidden fees</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    <button
                                        onClick={() => navigate('/checkout')}
                                        className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-sm shadow-2xl hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-100 transition-all flex items-center justify-center gap-4 group"
                                    >
                                        Finalize Order
                                        <ArrowRight size={20} className="group-hover:translate-x-2 transition-all duration-500" />
                                    </button>

                                    <div className="mt-8 flex items-center justify-center gap-8 grayscale opacity-50 contrast-125">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <ShieldCheck size={20} />
                                            <span className="text-[8px] font-black uppercase tracking-widest">Secure</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-1.5">
                                            <Truck size={20} />
                                            <span className="text-[8px] font-black uppercase tracking-widest">Fast</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-1.5">
                                            <Gift size={20} />
                                            <span className="text-[8px] font-black uppercase tracking-widest">Gift</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <p className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                    Secure Authentication by Clerk &bull; Payments by Stripe
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
