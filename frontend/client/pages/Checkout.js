import React, { useState } from 'react';
import { useCart } from '../../src/context/CartContext';
import { useAuth } from '../../src/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, Truck, CheckCircle, Smartphone, ExternalLink } from 'lucide-react';
import api from '../../src/utils/api';
import SuccessModal from '../../src/components/SuccessModal';
import { useNotifications } from '../../src/context/NotificationContext';
import AuthModal from '../../src/components/AuthModal';
import { LogIn, ShoppingCart as CartIcon, ArrowLeft } from 'lucide-react';

const Checkout = () => {
    const { cart } = useCart();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 999 ? 0 : 50;
    const total = subtotal + shipping;

    const { user } = useAuth();
    const navigate = useNavigate();
    const { showAlert } = useNotifications();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('STRIPE');

    // Saved Addresses (from profile)
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [mapUrl, setMapUrl] = useState('');
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Address State
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        address: '',
        city: '',
        zip: '',
        phone: '',
        utr: ''
    });

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successOrderInfo, setSuccessOrderInfo] = useState({ id: '', total: 0 });

    // Load saved addresses from profile (for quick checkout)
    React.useEffect(() => {
        if (!user) return;

        const fetchAddresses = async () => {
            try {
                const userEmail = user.emailAddresses ? user.emailAddresses[0].emailAddress : user.email;
                if (!userEmail) return;

                const res = await api.get(`/profile/${encodeURIComponent(userEmail)}/`);
                const profile = res.data;

                const addresses = Array.isArray(profile.savedAddresses) ? profile.savedAddresses : [];
                setSavedAddresses(addresses);

                // Prefill form with either the saved address or the profile address
                const selected = addresses.length ? addresses[0] : profile.address;
                if (selected) {
                    setSelectedAddressId(selected.id || null);
                    setFormData(prev => ({
                        ...prev,
                        address: selected.addressLine1 || '',
                        city: selected.city || '',
                        zip: selected.pincode || '',
                        phone: prev.phone || '',
                    }));
                }
            } catch (err) {
                console.warn('Could not load saved addresses:', err);
            }
        };

        fetchAddresses();
    }, [user]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const applySavedAddress = (address) => {
        if (!address) return;
        setSelectedAddressId(address.id);
        setFormData(prev => ({
            ...prev,
            address: address.addressLine1 || '',
            city: address.city || '',
            zip: address.pincode || '',
        }));
        setMapUrl(`https://www.google.com/maps?q=${encodeURIComponent(address.addressLine1 + ' ' + address.city + ' ' + address.state)}&z=15&output=embed`);
    };

    const reverseGeocode = async (lat, lon) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
            const data = await res.json();
            return data;
        } catch (err) {
            console.warn('Reverse geocode failed:', err);
            return null;
        }
    };

    const useCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const coords = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

                const geoData = await reverseGeocode(latitude, longitude);
                
                if (geoData && geoData.address) {
                    const addr = geoData.address;
                    // Extract components specifically for Indian context
                    const road = addr.road || addr.pedestrian || addr.path || '';
                    const area = addr.neighbourhood || addr.suburb || addr.subdistrict || '';
                    const city = addr.city || addr.town || addr.village || addr.city_district || addr.county || '';
                    const zip = addr.postcode || '';

                    // Format address: "Road, Area" or just "Area" if road is missing
                    const formattedAddress = [road, area].filter(Boolean).join(', ');
                    
                    setFormData(prev => ({
                        ...prev,
                        address: formattedAddress || geoData.display_name || coords,
                        city: city,
                        zip: zip
                    }));
                } else {
                    setFormData(prev => ({
                        ...prev,
                        address: coords,
                        city: '',
                        zip: ''
                    }));
                }

                setMapUrl(`https://www.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`);
            },
            (err) => {
                alert('Unable to retrieve location. Please allow location access or try again.');
                console.error('Geolocation error:', err);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
        );
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        setLoading(true);
        try {
            // 1. Create Order base
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
                payment_method: paymentMethod,
                transaction_id: formData.utr || ''
            };

            const res = await api.post('/orders/', orderPayload);

            if (res.status === 201) {
                const orderId = res.data.order_id || res.data._id; // Fallback to raw _id if order_id custom field missing

                // Trigger Notification
                await api.post('/notifications/', {
                    user_email: formData.email,
                    title: 'Order Placed',
                    message: `Order #${orderId.split('-').pop() || orderId} confirmed — ₹${total}`,
                    type: 'placed',
                    order_id: orderId
                }).catch(err => console.error("Notification creation failed:", err));

                showAlert('Order placed successfully! We are processing it.', 'success');

                if (paymentMethod === 'STRIPE') {
                    // Create checkout session
                    const intentRes = await api.post('/create-checkout-session/', { order_id: orderId });
                    const url = intentRes.data.url;

                    if (!url) throw new Error("Could not retrieve checkout session URL from backend");

                    // Redirect to Stripe Checkout
                    window.location.href = url;
                } else {
                    // Show Success Modal for COD/UPI
                    setSuccessOrderInfo({ id: orderId, total: total });
                    setShowSuccessModal(true);
                }
            }
        } catch (error) {
            console.error("Order Error:", error);
            const errorMsg = error.response?.data?.error || error.message || "Failed to place order. Please try again.";
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100 animate-fade-in">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <LogIn size={40} className="text-secondary" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-800 mb-2">Sign In Required</h2>
                    <p className="text-gray-500 mb-8 font-medium">Please sign in to your account to provide shipping details and complete your order.</p>
                    
                    <div className="space-y-4">
                        <button 
                            onClick={() => setShowAuthModal(true)}
                            className="w-full bg-secondary text-white py-4 rounded-xl font-bold hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-secondary/20"
                        >
                            <LogIn size={20} /> Sign In to Continue
                        </button>
                        <button 
                            onClick={() => navigate('/cart')}
                            className="w-full bg-gray-100 text-gray-600 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={20} /> Back to Cart
                        </button>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-2 gap-4">
                        <div className="text-left">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Your Cart</p>
                            <p className="text-lg font-bold text-gray-800">{cart.length} Items</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total</p>
                            <p className="text-lg font-bold text-secondary">₹{total}</p>
                        </div>
                    </div>
                </div>
                <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-6">
                <h1 className="text-3xl font-bold mb-8 text-primary">Checkout</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Form Section */}
                    <div className="md:col-span-2 space-y-6">

                        {/* Saved Addresses (from profile) */}
                        {savedAddresses.length > 0 && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Truck className="text-secondary" /> Saved Delivery Addresses
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {savedAddresses.map((addr) => (
                                        <div key={addr.id} className={`p-4 rounded-xl border ${selectedAddressId === addr.id ? 'border-primary bg-[#f0f4ff]' : 'border-gray-200 bg-white'}`}>
                                            <p className="text-sm font-semibold text-gray-800">{addr.nickname || 'Home'}</p>
                                            <p className="text-xs text-gray-600 mt-1">
                                                {addr.addressLine1}
                                                {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                                                <br />
                                                {addr.city}, {addr.state} {addr.pincode}
                                                <br />
                                                {addr.country}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => applySavedAddress(addr)}
                                                className="mt-3 w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-white hover:bg-indigo-600 transition"
                                            >
                                                Use this address
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

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
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Address</label>
                                        <button
                                            type="button"
                                            onClick={useCurrentLocation}
                                            className="text-xs font-medium text-primary hover:text-indigo-700"
                                        >
                                            Use current location
                                        </button>
                                    </div>
                                    <textarea name="address" value={formData.address} onChange={handleChange} required rows={3} className="w-full p-3 bg-gray-50 rounded-lg border focus:ring-2 ring-secondary/20 outline-none" placeholder="Street Address, Area / Lat, Long" />

                                    {mapUrl && (
                                        <div className="mt-3 rounded-lg overflow-hidden border border-gray-200">
                                            <iframe
                                                title="Selected location"
                                                src={mapUrl}
                                                className="w-full h-40"
                                                loading="lazy"
                                            />
                                            <div className="p-2 text-xs text-gray-500">
                                                <a href={mapUrl.replace('&output=embed','')} target="_blank" rel="noreferrer" className="underline">
                                                    View on map
                                                </a>
                                            </div>
                                        </div>
                                    )}
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

                        {/* Payment Method Selector */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <CreditCard className="text-secondary" /> Payment
                            </h2>
                            <div className="space-y-4">
                                {/* COD */}
                                <label 
                                    onClick={() => setPaymentMethod('COD')}
                                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${paymentMethod === 'COD' ? 'border-primary bg-[#f0f4ff]' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'COD' ? 'border-primary' : 'border-gray-300'}`}>
                                        {paymentMethod === 'COD' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                    </div>
                                    <span className={`font-bold ${paymentMethod === 'COD' ? 'text-primary' : 'text-gray-700'}`}>Cash on Delivery (COD)</span>
                                </label>

                                {/* Stripe */}
                                <div className={`rounded-xl border transition-all ${paymentMethod === 'STRIPE' ? 'border-primary bg-[#f0f4ff]' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                                    <label 
                                        onClick={() => setPaymentMethod('STRIPE')}
                                        className="flex items-center justify-between p-4 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'STRIPE' ? 'border-primary' : 'border-gray-300'}`}>
                                                {paymentMethod === 'STRIPE' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                            </div>
                                            <span className={`font-bold ${paymentMethod === 'STRIPE' ? 'text-primary' : 'text-gray-700'}`}>Credit / Debit Card (Stripe)</span>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <span className="bg-[#1a1f71] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">VISA</span>
                                            <span className="bg-[#eb001b] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">MC</span>
                                            <span className="bg-[#2e77bc] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">AMEX</span>
                                        </div>
                                    </label>
                                    
                                    {/* Stripe secure checkout info */}
                                    {paymentMethod === 'STRIPE' && (
                                        <div className="px-5 pb-5 pt-1 animate-fade-in pl-[52px]">
                                            <div className="bg-[#ebf4ff] p-4 rounded-lg flex items-start gap-3 text-sm text-[#1e40af]">
                                                <ExternalLink className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="font-semibold mb-1">Secure Stripe Checkout</p>
                                                    <p className="text-opacity-80">You'll be redirected to Stripe's secure payment page (buy.stripe.com) to complete your payment safely.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* UPI */}
                                <div className={`rounded-xl border transition-all ${paymentMethod === 'UPI' ? 'border-primary bg-[#f0f4ff]' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                                    <label 
                                        onClick={() => setPaymentMethod('UPI')}
                                        className="flex items-center gap-3 p-4 cursor-pointer"
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'UPI' ? 'border-primary' : 'border-gray-300'}`}>
                                            {paymentMethod === 'UPI' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                        </div>
                                        <span className={`font-bold flex items-center gap-2 ${paymentMethod === 'UPI' ? 'text-primary' : 'text-gray-700'}`}>
                                            <Smartphone size={16} /> UPI / Mobile App
                                        </span>
                                    </label>

                                    {paymentMethod === 'UPI' && (
                                        <div className="px-5 pb-5 pt-1 animate-fade-in flex flex-col items-center">
                                            <p className="font-bold text-gray-800 text-sm mb-3">Scan QR to Pay ₹{total}</p>
                                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=checkout@upi&pn=Store&am=${total}&cu=INR`} alt="UPI QR Code" className="w-[150px] h-[150px] rounded-lg border shadow-sm mb-4" />
                                            <p className="text-xs text-gray-500 mb-4 text-center">Open Google Pay, PhonePe, Paytm, or any UPI app and scan this QR.</p>
                                            <a href={`upi://pay?pa=checkout@upi&pn=Store&am=${total}&cu=INR`} className="w-full bg-[#5a67d8] hover:bg-[#4c51bf] text-white font-medium py-3 rounded-lg flex justify-center items-center gap-2 mb-4 transition-colors">
                                                <Smartphone size={18} /> Open UPI App directly
                                            </a>
                                            <div className="w-full text-left">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase">Transaction Reference (UTR)</label>
                                                <input name="utr" value={formData.utr || ''} onChange={handleChange} required placeholder="Enter 12-digit UTR No." className="w-full mt-1 p-3 bg-white rounded-lg border focus:ring-2 ring-primary/20 outline-none text-sm" />
                                            </div>
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

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                                <p className="text-sm font-semibold text-gray-700">Shipping to</p>
                                <p className="text-sm text-gray-600 mt-1">{formData.name}</p>
                                <p className="text-sm text-gray-600">
                                    {formData.address}
                                    {formData.city ? `, ${formData.city}` : ''}
                                    {formData.zip ? ` - ${formData.zip}` : ''}
                                </p>
                                <p className="text-sm text-gray-600">{formData.phone}</p>
                            </div>

                            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {cart.map((item, idx) => (
                                    <div key={idx} className="flex gap-3 text-sm">
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

                            {paymentMethod === 'STRIPE' && (
                                <div className="bg-[#eff6ff] p-3 rounded-lg flex items-start gap-2 text-xs text-[#1e3a8a] mt-6 border border-[#bfdbfe]">
                                    <ExternalLink className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <p>Clicking "Place Order" will redirect you to Stripe's secure checkout page.</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                form="checkout-form"
                                disabled={loading}
                                className={`w-full mt-6 ${paymentMethod === 'STRIPE' ? 'bg-[#10b981] hover:bg-[#059669]' : 'bg-green-600 hover:bg-green-700'} text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait`}
                            >
                                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 
                                    paymentMethod === 'STRIPE' ? <><CheckCircle size={20} /> Pay with Stripe</> :
                                    <><CheckCircle size={20} /> Place Order</>
                                }
                            </button>

                            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
                                <ShieldCheck size={14} /> TLS Encrypted Transaction
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <SuccessModal 
                isOpen={showSuccessModal} 
                onClose={() => setShowSuccessModal(false)}
                orderId={successOrderInfo.id}
                total={successOrderInfo.total}
            />
        </div>
    );
};

export default Checkout;
