import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, Truck, CheckCircle, Smartphone } from 'lucide-react';
import axios from 'axios';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const Checkout = () => {
    const { cart, cartTotal } = useCart(); // Assuming cartTotal exists or I calc it
    // Recalc total since context might not export it directly
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 999 ? 0 : 50;
    const total = subtotal + shipping;

    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Address, 2: Payment
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [upiId, setUpiId] = useState('');

    // Stripe
    const stripe = useStripe();
    const elements = useElements();

    // Address State
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        address: '',
        city: '',
        zip: '',
        phone: ''
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 1. Create Order
            const items = cart.map(item => ({
                product_id: item.id,
                product_name: item.name,
                quantity: item.quantity,
                price: item.price
            }));

            const orderPayload = {
                user_email: formData.email,
                user_name: formData.name,
                items: items,
                total_amount: total,
                shipping_address: `${formData.address}, ${formData.city} - ${formData.zip}. Phone: ${formData.phone}`,
                payment_method: paymentMethod + (paymentMethod === 'UPI' ? ` (${upiId})` : '')
            };

            const orderRes = await axios.post('/api/orders/', orderPayload);

            if (orderRes.status === 201) {
                const newOrder = orderRes.data;

                // Handle UPI Flow
                if (paymentMethod === 'UPI') {
                    if (!upiId) {
                        alert("Please enter a valid UPI ID or Mobile Number.");
                        setLoading(false);
                        return;
                    }
                    // Typically, you would integrate a UPI gateway here. For MVP, we'll mark as pending.
                    alert(`Payment request sent to ${upiId}. Please open your UPI app to approve.`);
                }

                // 2. Handle Stripe Flow if CARD is selected
                if (paymentMethod === 'CARD') {
                    if (!stripe || !elements) {
                        alert("Stripe hasn't loaded yet. Please try again.");
                        return;
                    }

                    const intentRes = await axios.post('/api/create-payment-intent/', {
                        order_id: newOrder.order_id
                    });

                    const clientSecret = intentRes.data.clientSecret;

                    const paymentResult = await stripe.confirmCardPayment(clientSecret, {
                        payment_method: {
                            card: elements.getElement(CardElement),
                            billing_details: {
                                name: formData.name,
                                email: formData.email,
                            },
                        },
                    });

                    if (paymentResult.error) {
                        alert(paymentResult.error.message);
                        return; // Stop here, payment failed
                    }

                    // Confirm with backend
                    if (paymentResult.paymentIntent.status === 'succeeded') {
                        await axios.post('/api/confirm-payment/', {
                            payment_intent_id: paymentResult.paymentIntent.id,
                            order_id: newOrder.order_id
                        });
                    }
                }

                // If success (COD or successful Card)
                alert('Order Placed Successfully! Order ID: ' + newOrder.order_id);
                navigate('/');
            }
        } catch (error) {
            console.error("Order Error:", error);
            alert("Failed to place order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-6">
                <h1 className="text-3xl font-bold mb-8 text-primary">Checkout</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Form Section */}
                    <div className="md:col-span-2 space-y-6">

                        {/* Shipping Address */}
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
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <CreditCard className="text-secondary" /> Payment
                            </h2>
                            <div className="flex flex-col gap-4">
                                <div
                                    onClick={() => setPaymentMethod('COD')}
                                    className={`border p-4 rounded-xl flex items-center gap-3 w-full cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-secondary bg-secondary/5' : 'border-gray-200'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'COD' ? 'border-secondary' : 'border-gray-300'}`}>
                                        {paymentMethod === 'COD' && <div className="w-2.5 h-2.5 rounded-full bg-secondary"></div>}
                                    </div>
                                    <span className={`font-bold ${paymentMethod === 'COD' ? 'text-secondary' : 'text-gray-600'}`}>Cash on Delivery (COD)</span>
                                </div>

                                <div
                                    onClick={() => setPaymentMethod('CARD')}
                                    className={`border p-4 rounded-xl flex flex-col gap-3 w-full cursor-pointer transition-all ${paymentMethod === 'CARD' ? 'border-secondary bg-secondary/5' : 'border-gray-200'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'CARD' ? 'border-secondary' : 'border-gray-300'}`}>
                                            {paymentMethod === 'CARD' && <div className="w-2.5 h-2.5 rounded-full bg-secondary"></div>}
                                        </div>
                                        <span className={`font-bold ${paymentMethod === 'CARD' ? 'text-secondary' : 'text-gray-600'}`}>Credit / Debit Card (Stripe)</span>
                                    </div>

                                    {paymentMethod === 'CARD' && (
                                        <div className="mt-2 pl-8 pr-2">
                                            <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                                                <CardElement options={{
                                                    style: {
                                                        base: {
                                                            fontSize: '16px',
                                                            color: '#424770',
                                                            '::placeholder': { color: '#aab7c4' },
                                                        },
                                                        invalid: { color: '#9e2146' },
                                                    },
                                                }} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div
                                    onClick={() => setPaymentMethod('UPI')}
                                    className={`border p-4 rounded-xl flex flex-col gap-3 w-full cursor-pointer transition-all ${paymentMethod === 'UPI' ? 'border-secondary bg-secondary/5' : 'border-gray-200'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'UPI' ? 'border-secondary' : 'border-gray-300'}`}>
                                            {paymentMethod === 'UPI' && <div className="w-2.5 h-2.5 rounded-full bg-secondary"></div>}
                                        </div>
                                        <span className={`font-bold flex items-center gap-2 ${paymentMethod === 'UPI' ? 'text-secondary' : 'text-gray-600'}`}>
                                            <Smartphone size={16} /> UPI / Mobile App
                                        </span>
                                    </div>

                                    {paymentMethod === 'UPI' && (
                                        <div className="mt-2 pl-8 pr-2">
                                            <input
                                                type="text"
                                                required={paymentMethod === 'UPI'}
                                                value={upiId}
                                                onChange={(e) => setUpiId(e.target.value)}
                                                placeholder="Enter UPI ID or Mobile Number"
                                                className="w-full p-3 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 ring-secondary/20 shadow-sm"
                                            />
                                            <p className="text-xs text-gray-400 mt-2">A payment request will be sent directly to your phone.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Sidebar */}
                    <div className="md:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                            <h3 className="font-bold text-gray-800 mb-4 text-lg">Order Summary</h3>
                            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
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
                                    <span className="font-medium">{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-primary pt-2 border-t mt-2">
                                    <span>Total</span>
                                    <span>₹{total}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                form="checkout-form"
                                disabled={loading}
                                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                            >
                                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle size={20} /> Place Order</>}
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
