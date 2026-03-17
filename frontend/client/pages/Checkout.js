import React, { useState } from 'react';
import { useCart } from '../../src/context/CartContext';
import { useAuth } from '../../src/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, Truck, CheckCircle, Smartphone, ExternalLink, User, Plus, RefreshCw, Map as MapIcon, Lock, Navigation, Package } from 'lucide-react';
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

    const fetchAddresses = async () => {
        if (!user) return;
        try {
            const userEmail = user.emailAddresses ? user.emailAddresses[0].emailAddress : user.email;
            if (!userEmail) return;

            const res = await api.get(`/profile/${encodeURIComponent(userEmail)}/`);
            const profile = res.data;

            const addresses = Array.isArray(profile.savedAddresses) ? profile.savedAddresses : [];
            setSavedAddresses(addresses);

            const selected = addresses.length ? addresses[0] : profile.address;
            if (selected) {
                setSelectedAddressId(selected.id || null);
                setFormData(prev => ({
                    ...prev,
                    name: profile.fullName || prev.name,
                    email: profile.email || prev.email,
                    address: selected.addressLine1 || '',
                    city: selected.city || '',
                    zip: selected.pincode || '',
                    phone: profile.phone || prev.phone || '',
                }));
            } else if (profile.phone) {
                setFormData(prev => ({ ...prev, phone: profile.phone, name: profile.fullName || prev.name }));
            }
        } catch (err) {
            console.warn('Could not load saved addresses:', err);
        }
    };

    React.useEffect(() => {
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
        <div className="min-h-screen bg-[#f8fafc] py-12">
            <div className="max-w-5xl mx-auto px-6">
                <div className="mb-10">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Checkout</h1>
                    <p className="text-slate-400 font-bold mt-1">Finalize your order and choose delivery options</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Form Section */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Quick Selection: Saved Identity */}
                        {user && (
                            <div className="bg-white p-10 rounded-[2rem] shadow-xl shadow-indigo-100/50 border border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                <div className="flex items-center justify-between w-full mb-4 md:mb-0 relative z-10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200 flex items-center justify-center text-white font-black text-xl">
                                            {user.fullName?.[0] || user.name?.[0] || 'U'}
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-black text-slate-900">{user.fullName || user.name}</h2>
                                            <p className="text-sm text-slate-400 font-bold">{user.primaryEmailAddress?.emailAddress || user.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact Number</p>
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-slate-900">{formData.phone || 'Not provided'}</span>
                                            {formData.phone && <CheckCircle size={14} className="text-emerald-500" />}
                                        </div>
                                        <button 
                                            onClick={fetchAddresses} 
                                            className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                                        >
                                            <RefreshCw size={10} /> Sync
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Saved Addresses (from profile) */}
                        <div className="bg-white p-10 rounded-[2rem] shadow-xl shadow-indigo-100/50 border border-gray-50">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                    <Truck className="text-indigo-600" /> Delivery Registry
                                </h2>
                                {!selectedAddressId && savedAddresses.length > 0 && (
                                    <span className="animate-pulse text-[10px] font-black text-amber-500 uppercase px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-100">Action Required: Select Location</span>
                                )}
                            </div>
                            
                            {savedAddresses.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {savedAddresses.map((addr) => (
                                        <div 
                                            key={addr.id} 
                                            className={`p-6 rounded-2xl border-2 transition-all cursor-pointer group relative ${selectedAddressId === addr.id ? 'bg-indigo-50/50 border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white border-slate-50 hover:border-indigo-100'}`} 
                                            onClick={() => applySavedAddress(addr)}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{addr.nickname || 'Home'}</h4>
                                                {selectedAddressId === addr.id ? (
                                                    <div className="bg-indigo-600 text-white p-1 rounded-lg">
                                                        <CheckCircle size={14} />
                                                    </div>
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full border-2 border-slate-100 group-hover:border-indigo-200"></div>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-400 font-bold leading-relaxed line-clamp-2">
                                                {addr.addressLine1}
                                                {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                                                <br />
                                                {addr.city}, {addr.state} {addr.pincode}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center border-4 border-dashed border-slate-50 rounded-[2rem] bg-slate-50/30">
                                    <MapIcon size={40} className="mx-auto text-slate-200 mb-4" />
                                    <p className="text-xs text-slate-400 font-black uppercase tracking-widest">No saved locations detected</p>
                                    <p className="text-[10px] text-slate-400 mt-2">Enter your destination details manually below.</p>
                                </div>
                            )}
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white p-10 rounded-[2rem] shadow-xl shadow-indigo-100/50 border border-gray-50">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                    <MapIcon className="text-indigo-600" /> Shipping Details
                                </h2>
                                {selectedAddressId && (
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setSelectedAddressId(null);
                                            setFormData(prev => ({ ...prev, address: '', city: '', zip: '' }));
                                            setMapUrl('');
                                        }}
                                        className="group flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                    >
                                        <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" /> Add New
                                    </button>
                                )}
                            </div>
                            <form id="checkout-form" onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Consignee Name</label>
                                    <input name="name" value={formData.name} onChange={handleChange} required className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all" placeholder="Enter full name" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile Contact</label>
                                        {formData.phone && <span className="text-[9px] font-black text-emerald-500 uppercase flex items-center gap-1"><CheckCircle size={10} /> Verified</span>}
                                    </div>
                                    <input name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all" placeholder="Enter contact number" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Electronic Mail</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all" placeholder="name@domain.com" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Destination</label>
                                        <button
                                            type="button"
                                            onClick={useCurrentLocation}
                                            className="text-[10px] font-black text-indigo-600 hover:text-slate-900 uppercase tracking-widest transition-colors flex items-center gap-1"
                                        >
                                            <Navigation size={12} /> Live Location
                                        </button>
                                    </div>
                                    <textarea name="address" value={formData.address} onChange={handleChange} required rows={3} className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all resize-none" placeholder="House/Apt No, Street name, Landmark" />

                                    {mapUrl && (
                                        <div className="mt-4 rounded-[1.5rem] overflow-hidden border-2 border-slate-50 shadow-inner group relative">
                                            <iframe
                                                title="Selected location"
                                                src={mapUrl}
                                                className="w-full h-44 grayscale-[0.5] contrast-[1.1] hover:grayscale-0 transition-all duration-700"
                                                loading="lazy"
                                            />
                                            <div className="absolute bottom-3 right-3">
                                                <a href={mapUrl.replace('&output=embed','')} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-[9px] font-black text-indigo-600 uppercase tracking-widest shadow-lg">
                                                    Open Maps <ExternalLink size={10} />
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City / Region</label>
                                    <input name="city" value={formData.city} onChange={handleChange} required className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all" placeholder="e.g. Mumbai" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Postal Code</label>
                                    <input name="zip" value={formData.zip} onChange={handleChange} required className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all" placeholder="123456" />
                                </div>
                            </form>
                        </div>

                        {/* Payment Method Selector */}
                        <div className="bg-white p-10 rounded-[2rem] shadow-xl shadow-indigo-100/50 border border-gray-50">
                            <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                <CreditCard className="text-secondary" /> Transaction Protocol
                            </h2>
                            <div className="grid grid-cols-1 gap-4">
                                {/* COD */}
                                <div 
                                    onClick={() => setPaymentMethod('COD')}
                                    className={`group flex items-center justify-between p-6 rounded-2xl border-2 transition-all cursor-pointer ${paymentMethod === 'COD' ? 'bg-emerald-50 border-emerald-500 shadow-md shadow-emerald-100' : 'bg-white border-slate-50 hover:border-slate-100'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${paymentMethod === 'COD' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                                            <div className="w-3 h-3 rounded-full border-2 border-current"></div>
                                        </div>
                                        <div>
                                            <p className={`font-black uppercase tracking-widest text-xs ${paymentMethod === 'COD' ? 'text-emerald-700' : 'text-slate-600'}`}>Cash on Delivery</p>
                                            <p className="text-[10px] text-slate-400 font-bold">Pay upon secure delivery package</p>
                                        </div>
                                    </div>
                                    <CheckCircle size={20} className={`transition-all ${paymentMethod === 'COD' ? 'text-emerald-500 scale-110 opacity-100' : 'text-slate-100 opacity-0'}`} />
                                </div>

                                {/* Stripe */}
                                <div className={`relative rounded-2xl border-2 transition-all group overflow-hidden ${paymentMethod === 'STRIPE' ? 'bg-indigo-50 border-indigo-600 shadow-md shadow-indigo-100' : 'bg-white border-slate-50 hover:border-slate-100'}`}>
                                    <div 
                                        onClick={() => setPaymentMethod('STRIPE')}
                                        className="flex items-center justify-between p-6 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4 text-left">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${paymentMethod === 'STRIPE' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                                                <CreditCard size={16} />
                                            </div>
                                            <div>
                                                <p className={`font-black uppercase tracking-widest text-xs ${paymentMethod === 'STRIPE' ? 'text-indigo-700' : 'text-slate-600'}`}>Digital Payment / Stripe</p>
                                                <p className="text-[10px] text-slate-400 font-bold">Instant verification & faster shipping</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="bg-slate-800 text-white text-[9px] font-black px-2 py-1 rounded-lg">VISA</div>
                                            <div className="bg-slate-800 text-white text-[9px] font-black px-2 py-1 rounded-lg">UPI</div>
                                        </div>
                                    </div>
                                    
                                    {paymentMethod === 'STRIPE' && (
                                        <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top duration-300">
                                            <div className="bg-indigo-600/5 p-5 rounded-2xl flex items-start gap-4 text-sm text-indigo-700 border border-indigo-100">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                                                    <Lock size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-xs uppercase tracking-widest mb-1">Encrypted Tunnel</p>
                                                    <p className="text-[10px] leading-relaxed opacity-80 font-bold font-medium uppercase tracking-[0.05em]">You will be redirected to Stripe's Level 1 PCI Compliant portal to process your sensitive payment safely.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-10 rounded-[2rem] shadow-2xl shadow-indigo-100/50 border border-gray-50 sticky top-24">
                            <h3 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-tight">Consignment Summary</h3>

                            <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 mb-8">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Destination</p>
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-slate-900">{formData.name || 'Anonymous'}</p>
                                    <p className="text-xs text-slate-500 font-bold leading-relaxed pr-2">
                                        {formData.address || 'Street details pending'}
                                        {formData.city ? `, ${formData.city}` : ''}
                                        {formData.zip ? ` ${formData.zip}` : ''}
                                    </p>
                                    <p className="text-xs font-black text-indigo-600 mt-2">{formData.phone || 'Contact missing'}</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8 max-h-[16rem] overflow-y-auto pr-2 scrollbar-none">
                                {cart.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 items-center group">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-50 p-2 border border-slate-100 flex-shrink-0 relative overflow-hidden">
                                            <img src={item.image} alt="" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                                            <div className="absolute top-0 right-0 bg-slate-900 text-white text-[9px] font-black px-1.5 py-0.5 rounded-bl-lg">x{item.quantity}</div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-slate-800 line-clamp-1 truncate uppercase tracking-tight">{item.name}</p>
                                            <p className="text-[10px] text-indigo-600 font-black mt-1">₹{item.price}</p>
                                        </div>
                                        <span className="text-sm font-black text-slate-900 shrink-0">₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 pt-6 mt-6 border-t border-slate-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Total</span>
                                    <span className="text-sm font-black text-slate-900">₹{subtotal}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logistic Fee</span>
                                    <span className={`text-sm font-black ${shipping === 0 ? 'text-emerald-500' : 'text-slate-900'}`}>{shipping === 0 ? 'COMPLIMENTARY' : `₹${shipping}`}</span>
                                </div>
                                <div className="flex justify-between items-center pt-6 mt-6 border-t-2 border-slate-900">
                                    <span className="text-sm font-black text-slate-900 uppercase tracking-[0.1em]">Grand Total</span>
                                    <span className="text-2xl font-black text-indigo-600">₹{total}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                form="checkout-form"
                                disabled={loading || cart.length === 0}
                                className={`w-full mt-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${paymentMethod === 'STRIPE' ? 'bg-indigo-600 hover:bg-slate-900 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
                            >
                                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 
                                    paymentMethod === 'STRIPE' ? <><CheckCircle size={18} /> Initiate Stripe</> :
                                    <><Package size={18} /> Confirm Order</>
                                }
                            </button>

                            <div className="flex items-center justify-center gap-2 mt-6 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                <ShieldCheck size={12} /> Secure Checkout Protocol Active
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
                .animate-in { animation: animateIn 0.5s ease-out forwards; }
                @keyframes animateIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .scrollbar-none::-webkit-scrollbar { display: none; }
                .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
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
