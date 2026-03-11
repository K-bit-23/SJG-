import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    ShieldCheck, CreditCard, Truck, CheckCircle,
    Smartphone, AlertCircle, ExternalLink, Loader2
} from 'lucide-react';
import axios from 'axios';

const Checkout = () => {
    const { cart, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 999 ? 0 : 50;
    const total = subtotal + shipping;

    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [upiId, setUpiId] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const upiLink = `upi://pay?pa=merchant@upi&pn=SJG%20Ecom&am=${total}&cu=INR`;

    const [formData, setFormData] = useState({
        name: user?.name || user?.displayName || '',
        email: user?.email || '',
        address: '',
        city: '',
        zip: '',
        phone: '',
    });

    const handleChange = (e) => setFormData(f => ({ ...f, [e.target.name]: e.target.value }));

    /* ── Create order in backend ── */
    const createOrder = async () => {
        const items = cart.map(item => ({
            product_id: item.id,
            product_name: item.name,
            quantity: item.quantity,
            price: item.price,
        }));

        const res = await axios.post('/api/orders/', {
            user_email: formData.email,
            user_name: formData.name,
            items,
            total_amount: total,
            shipping_address: `${formData.address}, ${formData.city} - ${formData.zip}. Phone: ${formData.phone}`,
            payment_method: paymentMethod + (paymentMethod === 'UPI' ? ` (${upiId})` : ''),
        });

        if (res.status !== 201) throw new Error('Order creation failed');
        return res.data;
    };

    /* ── Main Place Order handler ── */
    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            const newOrder = await createOrder();

            /* ─── STRIPE: redirect to hosted buy.stripe.com page ─── */
            if (paymentMethod === 'CARD') {
                const origin = window.location.origin;
                const sessionRes = await axios.post('/api/create-checkout-session/', {
                    order_id: newOrder.order_id,
                    success_url: `${origin}/payment-success?order_id=${newOrder.order_id}&session_id={CHECKOUT_SESSION_ID}`,
                    cancel_url: `${origin}/checkout`,
                });

                const { checkout_url } = sessionRes.data;
                if (!checkout_url) throw new Error('No checkout URL returned from Stripe');

                // Redirect to Stripe hosted page
                window.location.href = checkout_url;
                return; // don't setLoading(false) — page is navigating away
            }

            /* ─── UPI ─── */
            if (paymentMethod === 'UPI') {
                if (!upiId) {
                    setErrorMsg('Please enter the UTR / Transaction Reference after making the payment.');
                    setLoading(false);
                    return;
                }
                navigate(`/payment-success?order_id=${newOrder.order_id}`);
                return;
            }

            /* ─── COD ─── */
            navigate(`/payment-success?order_id=${newOrder.order_id}`);

        } catch (err) {
            console.error('Order Error:', err);
            const msg = err?.response?.data?.error || err?.message || 'Failed to place order. Please try again.';
            setErrorMsg(msg);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-6">
                <h1 className="text-3xl font-bold mb-8 text-primary">Checkout</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* ── Form Section ── */}
                    <div className="md:col-span-2 space-y-6">

                        {/* Shipping */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Truck className="text-secondary" /> Shipping Details
                            </h2>
                            <form id="checkout-form" onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Full Name</label>
                                    <input name="name" value={formData.name} onChange={handleChange} required className="w-full p-3 bg-gray-50 rounded-lg border focus:ring-2 ring-secondary/20 outline-none" placeholder="John Doe" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Phone</label>
                                    <input name="phone" value={formData.phone} onChange={handleChange} required className="w-full p-3 bg-gray-50 rounded-lg border focus:ring-2 ring-secondary/20 outline-none" placeholder="+91 98765 43210" />
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-3 bg-gray-50 rounded-lg border focus:ring-2 ring-secondary/20 outline-none" placeholder="john@example.com" />
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Address</label>
                                    <textarea name="address" value={formData.address} onChange={handleChange} required rows={3} className="w-full p-3 bg-gray-50 rounded-lg border focus:ring-2 ring-secondary/20 outline-none" placeholder="Street Address, Area" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">City</label>
                                    <input name="city" value={formData.city} onChange={handleChange} required className="w-full p-3 bg-gray-50 rounded-lg border focus:ring-2 ring-secondary/20 outline-none" placeholder="City" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">ZIP Code</label>
                                    <input name="zip" value={formData.zip} onChange={handleChange} required className="w-full p-3 bg-gray-50 rounded-lg border focus:ring-2 ring-secondary/20 outline-none" placeholder="123456" />
                                </div>
                            </form>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <CreditCard className="text-secondary" /> Payment
                            </h2>
                            <div className="flex flex-col gap-3">

                                {/* COD */}
                                <label
                                    onClick={() => setPaymentMethod('COD')}
                                    className={`border p-4 rounded-xl flex items-center gap-3 w-full cursor-pointer transition-all
                                        ${paymentMethod === 'COD' ? 'border-secondary bg-secondary/5 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === 'COD' ? 'border-secondary' : 'border-gray-300'}`}>
                                        {paymentMethod === 'COD' && <div className="w-2.5 h-2.5 rounded-full bg-secondary" />}
                                    </div>
                                    <span className={`font-bold ${paymentMethod === 'COD' ? 'text-secondary' : 'text-gray-600'}`}>
                                        Cash on Delivery (COD)
                                    </span>
                                </label>

                                {/* STRIPE */}
                                <div
                                    onClick={() => setPaymentMethod('CARD')}
                                    className={`border p-4 rounded-xl flex flex-col gap-3 w-full cursor-pointer transition-all
                                        ${paymentMethod === 'CARD' ? 'border-secondary bg-secondary/5 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === 'CARD' ? 'border-secondary' : 'border-gray-300'}`}>
                                            {paymentMethod === 'CARD' && <div className="w-2.5 h-2.5 rounded-full bg-secondary" />}
                                        </div>
                                        <span className={`font-bold ${paymentMethod === 'CARD' ? 'text-secondary' : 'text-gray-600'}`}>
                                            Credit / Debit Card (Stripe)
                                        </span>
                                        {/* Stripe logo badges */}
                                        <div className="ml-auto flex items-center gap-1.5">
                                            <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">VISA</span>
                                            <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold">MC</span>
                                            <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded font-bold">AMEX</span>
                                        </div>
                                    </div>

                                    {paymentMethod === 'CARD' && (
                                        <div className="mt-1 ml-8 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-3">
                                            <ExternalLink size={18} className="text-indigo-500 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-semibold text-indigo-700">Secure Stripe Checkout</p>
                                                <p className="text-xs text-indigo-500 mt-0.5">
                                                    You'll be redirected to Stripe's secure payment page (buy.stripe.com) to complete your payment safely.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* UPI */}
                                <div
                                    onClick={() => setPaymentMethod('UPI')}
                                    className={`border p-4 rounded-xl flex flex-col gap-3 w-full cursor-pointer transition-all
                                        ${paymentMethod === 'UPI' ? 'border-secondary bg-secondary/5 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === 'UPI' ? 'border-secondary' : 'border-gray-300'}`}>
                                            {paymentMethod === 'UPI' && <div className="w-2.5 h-2.5 rounded-full bg-secondary" />}
                                        </div>
                                        <span className={`font-bold flex items-center gap-2 ${paymentMethod === 'UPI' ? 'text-secondary' : 'text-gray-600'}`}>
                                            <Smartphone size={16} /> UPI / Mobile App
                                        </span>
                                    </div>

                                    {paymentMethod === 'UPI' && (
                                        <div className="mt-4 flex flex-col items-center bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                                            <p className="text-sm font-bold text-gray-700 mb-2">Scan QR to Pay ₹{total}</p>
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiLink)}`}
                                                alt="UPI QR Code"
                                                className="w-32 h-32 mb-3 rounded-lg border border-gray-100 p-1 bg-white"
                                            />
                                            <p className="text-xs text-gray-500 mb-4 text-center px-4">
                                                Open Google Pay, PhonePe, Paytm, or any UPI app and scan this QR.
                                            </p>
                                            <a href={upiLink} className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all mb-4 text-sm">
                                                <Smartphone size={18} /> Open UPI App directly
                                            </a>
                                            <div className="w-full mt-4">
                                                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Transaction Reference (UTR)</label>
                                                <input
                                                    type="text"
                                                    required={paymentMethod === 'UPI'}
                                                    value={upiId}
                                                    onChange={e => setUpiId(e.target.value)}
                                                    placeholder="Enter 12-digit UTR No."
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 ring-secondary/20 shadow-sm text-sm"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* ── Sidebar ── */}
                    <div className="md:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                            <h3 className="font-bold text-gray-800 mb-4 text-lg">Order Summary</h3>
                            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
                                {cart.map(item => (
                                    <div key={item.id} className="flex gap-3 text-sm">
                                        <img src={item.image} alt="" className="w-12 h-12 rounded bg-gray-100 object-cover" />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800 line-clamp-1">{item.name}</p>
                                            <p className="text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <span className="font-semibold">₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">₹{subtotal}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>
                                        {shipping === 0 ? 'FREE' : `₹${shipping}`}
                                    </span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-primary pt-2 border-t mt-2">
                                    <span>Total</span>
                                    <span>₹{total}</span>
                                </div>
                            </div>

                            {/* Error */}
                            {errorMsg && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                                    <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                                    <p className="text-red-600 text-sm">{errorMsg}</p>
                                </div>
                            )}

                            {/* Stripe redirect notice */}
                            {paymentMethod === 'CARD' && (
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2 text-xs text-blue-600">
                                    <ExternalLink size={13} className="flex-shrink-0" />
                                    Clicking "Place Order" will redirect you to Stripe's secure checkout page.
                                </div>
                            )}

                            <button
                                type="submit"
                                form="checkout-form"
                                disabled={loading}
                                className="w-full mt-5 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                            >
                                {loading
                                    ? <><Loader2 size={20} className="animate-spin" />
                                        {paymentMethod === 'CARD' ? 'Opening Stripe...' : 'Placing Order...'}</>
                                    : <><CheckCircle size={20} />
                                        {paymentMethod === 'CARD' ? 'Pay with Stripe' : 'Place Order'}</>
                                }
                            </button>

                            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
                                <ShieldCheck size={14} /> TLS Encrypted Transaction
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
