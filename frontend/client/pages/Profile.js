import React, { useEffect, useState } from 'react';
import { useAuth } from '../../src/context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { useNotifications } from '../../src/context/NotificationContext';
import { useWishlist } from '../../src/context/WishlistContext';
import {
    User, MapPin, Save, CheckCircle, Phone, Mail, 
    Calendar, UserCircle, Globe, Navigation, Trash2, Edit3, 
    Clock, ShieldCheck, Map as MapIcon, Plus, Package, ShoppingBag, Sparkles
} from 'lucide-react';
import api from '../../src/utils/api';
import AccountLayout from '../../src/components/AccountLayout';

const Profile = () => {
    const { user } = useAuth();
    const { wishlist } = useWishlist();
    const { showToast, showAlert } = useNotifications();
    const [searchParams, setSearchParams] = useSearchParams();

    // Tabs
    const tabParam = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState(tabParam === 'address' ? 'address' : (tabParam === 'orders' ? 'orders' : 'details'));

    // State
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [profileData, setProfileData] = useState({
        fullName: '',
        phone: '',
        email: '',
        photoURL: '',
        dateOfBirth: '',
        gender: ''
    });
    const [orders, setOrders] = useState([]);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [addressForm, setAddressForm] = useState({
        id: null,
        nickname: 'Home',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
    });
    const [mapUrl, setMapUrl] = useState('');

    useEffect(() => {
        if (user) {
            fetchProfile();
            fetchOrders();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const email = user.emailAddresses ? user.emailAddresses[0].emailAddress : user.email;
            const res = await api.get(`/profile/${email}/`);
            setProfileData({
                ...res.data,
                email: email,
                fullName: res.data.fullName || user.fullName || '',
                photoURL: res.data.photoURL || user.imageUrl || ''
            });
            if (res.data.savedAddresses) {
                setSavedAddresses(res.data.savedAddresses);
                if (res.data.savedAddresses.length > 0) {
                    setSelectedAddressId(res.data.savedAddresses[0].id);
                }
            }
        } catch (err) {
            console.error("Error fetching profile:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            const email = user.emailAddresses ? user.emailAddresses[0].emailAddress : user.email;
            const res = await api.get(`/user-orders/${email}/`);
            setOrders(res.data);
        } catch (err) {
            console.error("Error fetching orders:", err);
        }
    };

    useEffect(() => {
        if (addressForm.addressLine1 && addressForm.city) {
            const query = `${addressForm.addressLine1}, ${addressForm.city}, ${addressForm.pincode}, India`;
            setMapUrl(`https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=13&ie=UTF8&iwloc=&output=embed`);
        }
    }, [addressForm.addressLine1, addressForm.city, addressForm.pincode]);

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const email = user.emailAddresses ? user.emailAddresses[0].emailAddress : user.email;
            await api.post(`/profile/${email}/`, {
                ...profileData,
                savedAddresses
            });
            setSaveSuccess(true);
            showAlert('Identity data synchronized successfully with central servers', 'success');
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            showAlert('System sync failure: Unable to commit changes to cloud', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleAddOrUpdateAddress = () => {
        if (!addressForm.addressLine1 || !addressForm.city) {
            showToast('Please fill essential fields', 'error');
            return;
        }

        const newAddress = {
            ...addressForm,
            id: addressForm.id || Date.now()
        };

        if (addressForm.id) {
            setSavedAddresses(prev => prev.map(a => a.id === addressForm.id ? newAddress : a));
            showToast('Address updated', 'success');
        } else {
            setSavedAddresses(prev => [...prev, newAddress]);
            showToast('Address added to directory', 'success');
        }

        setAddressForm({
            id: null, nickname: 'Home', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', country: 'India'
        });
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    if (loading) return (
        <AccountLayout>
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        </AccountLayout>
    );

    return (
        <AccountLayout>
            <div className="space-y-8 pb-20">
                
                {/* ── Section 1: Dynamic Dashboard Header ── */}
                <div className="relative bg-white rounded-[2rem] shadow-2xl shadow-indigo-100 overflow-hidden border border-gray-50">
                    <div className="h-40 bg-slate-900 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,#4f46e5_0%,transparent_50%)]"></div>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    </div>
                    
                    <div className="px-10 pb-10">
                        <div className="flex flex-col md:flex-row items-end gap-8 -mt-16 relative z-10">
                            <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 border-[8px] border-white shadow-2xl flex items-center justify-center text-white text-5xl font-black shrink-0">
                                {profileData.photoURL ? (
                                    <img src={profileData.photoURL} alt="" className="w-full h-full object-cover rounded-2xl" />
                                ) : (
                                    getInitials(profileData.fullName)
                                )}
                            </div>
                            
                            <div className="flex-1 pb-2">
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight">{profileData.fullName || 'New User'}</h1>
                                <p className="text-slate-400 font-bold flex items-center gap-2 mt-1">
                                    <Mail size={14} /> {profileData.email}
                                </p>
                            </div>

                            <div className="flex gap-4 mb-2">
                                <div className="bg-indigo-50 px-6 py-4 rounded-2xl text-center border border-indigo-100">
                                    <span className="block text-2xl font-black text-indigo-600">{orders.length}</span>
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Orders</span>
                                </div>
                                <div className="bg-emerald-50 px-6 py-4 rounded-2xl text-center border border-emerald-100">
                                    <span className="block text-2xl font-black text-emerald-600">{wishlist.length}</span>
                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Wishlist</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Section 2: Tabbed Management ── */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Tabs */}
                    <div className="lg:col-span-1 space-y-2">
                        {[
                            { id: 'details', label: 'Identity Settings', icon: User },
                            { id: 'orders', label: 'Order Archive', icon: Package },
                            { id: 'address', label: 'Delivery Registry', icon: MapPin }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setSearchParams({ tab: tab.id });
                                }}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 translate-x-1' : 'bg-white text-slate-400 hover:bg-slate-50'}`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Main Panels */}
                    <div className="lg:col-span-3">
                        {activeTab === 'details' && (
                            <div className="space-y-6 animate-in slide-in-from-right duration-500">
                                <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Full Name</label>
                                                <input 
                                                    type="text" 
                                                    value={profileData.fullName}
                                                    onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                                                    className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                                                <input 
                                                    type="tel" 
                                                    value={profileData.phone}
                                                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                                    className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                                                <input 
                                                    type="date" 
                                                    value={profileData.dateOfBirth}
                                                    onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                                                    className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {['Male', 'Female', 'Other'].map(g => (
                                                        <button
                                                            key={g}
                                                            type="button"
                                                            onClick={() => setProfileData({...profileData, gender: g})}
                                                            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${profileData.gender === g ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-200'}`}
                                                        >
                                                            {g}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleSaveProfile}
                                        disabled={saving}
                                        className={`w-full mt-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl ${saveSuccess ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-slate-900 group'}`}
                                    >
                                        {saveSuccess ? 'Changes Synchronized' : saving ? 'Updating...' : 'Commit Profile Changes'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className="space-y-6 animate-in slide-in-from-right duration-500">
                                <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100">
                                    <h2 className="text-xl font-black text-slate-900 mb-6">Order History</h2>
                                    {orders.length === 0 ? (
                                        <div className="py-20 text-center">
                                            <ShoppingBag size={48} className="mx-auto text-slate-100 mb-4" />
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No orders recorded yet.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {orders.map(order => (
                                                <div key={order.id} className="p-6 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all group flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                                            <Package size={20} />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-black text-slate-900">Order #{order.order_id || order.id.substring(0, 8).toUpperCase()}</h4>
                                                            <p className="text-xs text-slate-400 font-bold mt-1">{new Date(order.created_at).toLocaleDateString()} • {order.items?.length || 0} Items</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm font-black text-indigo-600">₹{order.total_amount}</div>
                                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                            {order.status || 'Processing'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'address' && (
                            <div className="space-y-6 animate-in slide-in-from-right duration-500">
                                <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <h2 className="text-xl font-black text-slate-900">New Address</h2>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2 space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Label/Nickname</label>
                                                    <input 
                                                        value={addressForm.nickname}
                                                        onChange={(e) => setAddressForm({...addressForm, nickname: e.target.value})}
                                                        placeholder="Home / Office / Mom's House"
                                                        className="w-full px-5 py-4 bg-slate-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 ring-emerald-500/20"
                                                    />
                                                </div>
                                                <div className="col-span-2 space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Address</label>
                                                    <input 
                                                        value={addressForm.addressLine1}
                                                        onChange={(e) => setAddressForm({...addressForm, addressLine1: e.target.value})}
                                                        className="w-full px-5 py-4 bg-slate-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 ring-emerald-500/20"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">City</label>
                                                    <input 
                                                        value={addressForm.city}
                                                        onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                                                        className="w-full px-5 py-4 bg-slate-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 ring-emerald-500/20"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pincode</label>
                                                    <input 
                                                        value={addressForm.pincode}
                                                        onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})}
                                                        className="w-full px-5 py-4 bg-slate-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 ring-emerald-500/20"
                                                    />
                                                </div>
                                            </div>
                                            <button 
                                                onClick={handleAddOrUpdateAddress}
                                                className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-slate-900 transition-all"
                                            >
                                                {addressForm.id ? 'Modify Address' : 'Register New Address'}
                                            </button>
                                        </div>

                                        <div className="space-y-6">
                                            <h2 className="text-xl font-black text-slate-900">Saved Locations</h2>
                                            {savedAddresses.length === 0 ? (
                                                <div className="h-40 flex items-center justify-center border-4 border-dashed border-slate-50 rounded-[2rem] text-slate-300">
                                                    <p className="font-bold text-xs uppercase tracking-widest">No addresses yet</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {savedAddresses.map(addr => (
                                                        <div key={addr.id} className={`p-5 rounded-2xl border-2 transition-all group ${selectedAddressId === addr.id ? 'bg-indigo-50 border-indigo-600' : 'bg-white border-slate-50'}`}>
                                                            <div className="flex justify-between items-center">
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <h4 className="text-sm font-bold text-slate-900">{addr.nickname}</h4>
                                                                        {selectedAddressId === addr.id && <CheckCircle size={14} className="text-indigo-600" />}
                                                                    </div>
                                                                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">{addr.addressLine1}, {addr.city}</p>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => setAddressForm(addr)} className="p-2 bg-white text-indigo-600 rounded-lg hover:shadow-md"><Edit3 size={14} /></button>
                                                                    <button onClick={() => setSavedAddresses(prev => prev.filter(a => a.id !== addr.id))} className="p-2 bg-white text-rose-500 rounded-lg hover:shadow-md"><Trash2 size={14} /></button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Section 3: Priority Monitor (Stock Updates) ── */}
                <div className="bg-rose-50 rounded-[2.5rem] p-10 border border-rose-100 overflow-hidden relative group">
                    <Sparkles className="absolute -bottom-10 -right-10 w-40 h-40 text-rose-200/50 group-hover:scale-125 transition-transform duration-700" />
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                        <div className="max-w-md text-center md:text-left">
                            <h3 className="text-2xl font-black text-rose-900 tracking-tight">Priority Inventory Alert</h3>
                            <p className="text-rose-600/80 text-sm mt-2 font-bold leading-relaxed">We monitor your wishlisted items for stock changes. Get them before they disappear!</p>
                        </div>
                        
                        <div className="flex-1 w-full">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {wishlist && wishlist.slice(0, 3).map(item => (
                                    <div key={item.id} className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white">
                                        <h4 className="text-[10px] font-black text-slate-900 truncate">{item.name}</h4>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${(item.stock || 0) < 10 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                {(item.stock || 0) < 10 ? `Only ${item.stock || 0} Left` : 'In Stock'}
                                            </span>
                                            <span className="text-xs font-black text-indigo-600">₹{item.price}</span>
                                        </div>
                                    </div>
                                ))}
                                {(!wishlist || wishlist.length === 0) && (
                                    <div className="col-span-full py-4 text-center text-rose-300 text-[10px] font-black uppercase tracking-widest">
                                        Your watchlist is empty
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .animate-in { animation: animateIn 0.5s ease-out forwards; }
                @keyframes animateIn {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}} />
        </AccountLayout>
    );
};

export default Profile;
