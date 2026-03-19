import React, { useState } from 'react';
import { useCart } from '../../src/context/CartContext';
import { useAuth } from '../../src/context/AuthContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft, Tag, Truck, ShieldCheck, Gift } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../src/utils/api';

const Cart = () => {
    const { t } = useLanguage();
    const { cart, removeFromCart, addToCart, decrementFromCart, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);

    // Calculate details
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = appliedCoupon 
        ? (appliedCoupon.discount_type === 'flat' 
            ? appliedCoupon.discount_value 
            : Math.round(subtotal * (appliedCoupon.discount_value / 100))) 
        : 0;
    const shipping = subtotal > 999 ? 0 : 50;
    const total = subtotal - discount + shipping;
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const applyCoupon = async () => {
        try {
            const { data } = await api.post('/coupons/verify/', { code: couponCode });
            setAppliedCoupon(data);
        } catch (err) {
            alert(err.response?.data?.error || 'Invalid coupon code');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b sticky top-16 z-30">
                <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to="/products" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <ArrowLeft size={20} className="text-gray-600" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">{t('shoppingcart')}</h1>
                                <p className="text-sm text-gray-500">{itemCount} {t('itemsincart')}</p>
                            </div>
                        </div>
                        {cart.length > 0 && (
                            <button
                                onClick={clearCart}
                                className="text-sm text-red-500 hover:text-red-600 font-medium"
                            >
                                {t('clearall')}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
                {cart.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="text-gray-300" size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('cartempty')}</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">{t('cartempty_desc')}</p>
                        <Link to="/products" className="inline-flex items-center gap-2 bg-secondary text-white px-8 py-3.5 rounded-full font-semibold hover:bg-indigo-600 transition-all shadow-lg hover:shadow-xl">
                            {t('startshopping')} <ArrowRight size={18} />
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Cart Items */}
                        <div className="flex-1">
                            {/* Free Shipping Banner */}
                            {subtotal < 999 && (
                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-center gap-3">
                                    <div className="p-2 bg-amber-100 rounded-full">
                                        <Truck size={18} className="text-amber-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-amber-800">
                                            {t('addmoreforfree', { amount: 999 - subtotal })}
                                        </p>
                                        <div className="w-full bg-amber-200 rounded-full h-1.5 mt-2">
                                            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${(subtotal / 999) * 100}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Items List */}
                            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                <div className="divide-y divide-gray-100">
                                    {cart.map((item, index) => (
                                        <div key={item._id || item.id} className="p-4 lg:p-5 hover:bg-white hover:shadow-md hover-scale hover-glow rounded-xl transition-all m-2 border border-transparent">
                                            <div className="flex gap-4">
                                                {/* Product Image */}
                                                <div className="w-24 h-24 lg:w-28 lg:h-28 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={item.image || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400'}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                {/* Product Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <div>
                                                            <span className="text-xs text-secondary font-medium">{item.category}</span>
                                                            <h3 className="font-semibold text-gray-800 line-clamp-2">{item.name}</h3>
                                                        </div>
                                                        <button
                                                            onClick={() => removeFromCart(item._id || item.id)}
                                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>

                                                    <div className="flex items-end justify-between mt-3">
                                                        {/* Quantity Controls */}
                                                        <div className="flex items-center bg-gray-100 rounded-full">
                                                            <button
                                                                onClick={() => decrementFromCart(item._id || item.id)}
                                                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                                            >
                                                                <Minus size={14} className="text-gray-600" />
                                                            </button>
                                                            <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                                                            <button
                                                                onClick={() => addToCart(item)}
                                                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                                            >
                                                                <Plus size={14} className="text-gray-600" />
                                                            </button>
                                                        </div>

                                                        {/* Price */}
                                                        <div className="text-right">
                                                            <p className="text-lg font-bold text-primary">₹{item.price * item.quantity}</p>
                                                            {item.quantity > 1 && (
                                                                <p className="text-xs text-gray-400">₹{item.price} each</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Continue Shopping */}
                            <Link to="/products" className="flex items-center gap-2 text-secondary font-medium mt-4 hover:underline">
                                <ArrowLeft size={16} /> {t('continueshopping')}
                            </Link>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:w-96">
                            <div className="bg-white rounded-2xl shadow-sm overflow-hidden sticky top-32 hover-glow transition-all">
                                <div className="p-5 border-b border-gray-100">
                                    <h2 className="text-lg font-bold text-gray-800">{t('ordersummary')}</h2>
                                </div>

                                <div className="p-5">
                                    {/* Coupon Code */}
                                    <div className="mb-5">
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">{t('couponcode')}</label>
                                        <div className="flex gap-2">
                                            <div className="flex-1 relative">
                                                <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={couponCode}
                                                    onChange={(e) => setCouponCode(e.target.value)}
                                                    placeholder={t('enter_code')}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 ring-secondary/20"
                                                    disabled={appliedCoupon}
                                                />
                                            </div>
                                            <button
                                                onClick={applyCoupon}
                                                disabled={appliedCoupon || !couponCode}
                                                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {appliedCoupon ? t('applied') : t('apply')}
                                            </button>
                                        </div>
                                        {appliedCoupon && (
                                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                                <Gift size={12} /> {t('couponcode')} "{appliedCoupon.code}" {t('applied').toLowerCase()}
                                            </p>
                                        )}
                                    </div>

                                    {/* Price Breakdown */}
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between text-gray-600">
                                            <span>{t('subtotal')} ({itemCount} items)</span>
                                            <span className="font-medium text-gray-900">₹{subtotal}</span>
                                        </div>
                                        {discount > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Discount</span>
                                                <span className="font-medium">-₹{discount}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-gray-600">
                                            <span>{t('shipping')}</span>
                                            <span className={`font-medium ${shipping === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                                                {shipping === 0 ? t('free') : `₹${shipping}`}
                                            </span>
                                        </div>
                                        <div className="pt-3 border-t border-dashed border-gray-200 flex justify-between text-base font-bold text-gray-900">
                                            <span>{t('total')}</span>
                                            <span className="text-xl">₹{total}</span>
                                        </div>
                                    </div>

                                    {/* Checkout Button */}
                                    <button
                                        onClick={() => navigate('/checkout')}
                                        className="w-full mt-5 bg-gradient-to-r from-secondary to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                                    >
                                        {t('proceed')}
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </button>

                                    {/* Trust Badges */}
                                    <div className="mt-5 pt-5 border-t border-gray-100">
                                        <div className="flex justify-center gap-6 text-gray-400">
                                            <div className="flex flex-col items-center gap-1">
                                                <ShieldCheck size={20} />
                                                <span className="text-[10px]">{t('securepayment')}</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1">
                                                <Truck size={20} />
                                                <span className="text-[10px]">{t('freeshipping')}</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1">
                                                <Gift size={20} />
                                                <span className="text-[10px]">Gift Wrap</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
