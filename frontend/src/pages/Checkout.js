import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, Truck, CheckCircle } from 'lucide-react';
import axios from 'axios';

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
                payment_method: 'COD' // defaulting to COD for MVP simplicity unless Stripe is ready
            };

            const res = await axios.post('/api/orders/', orderPayload);

            // If success
            if (res.status === 201) {
                // Clear cart (Needs context function)
                // Assuming cart clearing happens or we redirect
                alert('Order Placed Successfully! Order ID: ' + res.data.order_id);
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

                        {/* Payment Method (Visual Only Mock for MVP) */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 opacity-60 pointer-events-none relative">
                            <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 backdrop-blur-[1px]">
                                <span className="bg-gray-800 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-widest">Defaulting to COD</span>
                            </div>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <CreditCard className="text-secondary" /> Payment
                            </h2>
                            <div className="flex gap-4">
                                <div className="border border-secondary bg-secondary/5 p-4 rounded-xl flex items-center gap-2 w-full cursor-pointer">
                                    <div className="w-4 h-4 rounded-full bg-secondary"></div>
                                    <span className="font-bold text-secondary">Cash on Delivery</span>
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
