import React, { useEffect, useState } from 'react';
import { useAuth } from '../../src/context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { useNotifications } from '../../src/context/NotificationContext';
import {
    User, MapPin, Save, CheckCircle, Phone, Mail, 
    Calendar, UserCircle, Globe, Navigation, Trash2, Edit3, 
    Clock, ShieldCheck, Map as MapIcon, Plus
} from 'lucide-react';
import api from '../../src/utils/api';
import AccountLayout from '../../src/components/AccountLayout';

const Profile = () => {
    const { user } = useAuth();
    const { showToast } = useNotifications();
    const [searchParams, setSearchParams] = useSearchParams();

    // Tabs
    const tabParam = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState(tabParam === 'address' ? 'address' : 'details');

    // Profile Data
    const [profileData, setProfileData] = useState({
        fullName: '',
        phone: '',
        email: '',
        photoURL: '',
        dateOfBirth: '',
        gender: ''
    });

    // Address Form + Saved Addresses
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
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [mapUrl, setMapUrl] = useState('');

    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Sync tab state with query param (deep linking)
        const tab = searchParams.get('tab');
        if (tab === 'address' || tab === 'details') {
            setActiveTab(tab);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!user) return;

        const fetchProfile = async () => {
            try {
                const userEmail = user.emailAddresses ? user.emailAddresses[0].emailAddress : user.email;
                if (!userEmail) return;
                
                const res = await api.get(`/profile/${encodeURIComponent(userEmail)}/`);
                const data = res.data;

                setProfileData({
                    fullName: data.fullName || user.fullName || user.name || '',
                    phone: data.phone || '',
                    email: data.email || userEmail || '',
                    photoURL: data.photoURL || user.imageUrl || user.photoURL || '',
                    dateOfBirth: data.dateOfBirth || '',
                    gender: data.gender || ''
                });

                const addresses = Array.isArray(data.savedAddresses) ? data.savedAddresses : [];
                setSavedAddresses(addresses);

                if (addresses.length > 0) {
                    const latest = addresses[0];
                    setAddressForm(latest);
                    setSelectedAddressId(latest.id);
                } else if (data.address) {
                    setAddressForm(data.address);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };

        fetchProfile();
    }, [user]);

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const userEmail = user.emailAddresses ? user.emailAddresses[0].emailAddress : user.email;
            await api.post(`/profile/${encodeURIComponent(userEmail)}/`, {
                ...profileData,
                address: addressForm,
                savedAddresses
            });
            setSaveSuccess(true);
            showToast('Profile settings saved successfully!', 'success');
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error("Error saving profile:", error);
            showToast('Failed to save profile. Please try again.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleAddOrUpdateAddress = () => {
        if (!addressForm.addressLine1 || !addressForm.city) return;
        
        setSavedAddresses(prev => {
            const existingIndex = prev.findIndex(addr => addr.id === addressForm.id);
            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = { ...addressForm };
                return updated;
            }
            return [...prev, { ...addressForm, id: Date.now().toString() }];
        });
        
        // Reset form to empty
        setAddressForm({
            id: null,
            nickname: 'Home',
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India'
        });
    };

    const updateMap = async (address) => {
        const query = `${address.addressLine1} ${address.city} ${address.state}`.trim();
        const _q = encodeURIComponent(query);
        setMapUrl(`https://maps.google.com/maps?q=${_q}&z=15&output=embed`);
    };

    useEffect(() => {
        if (addressForm.addressLine1 || addressForm.city) {
            const timer = setTimeout(() => updateMap(addressForm), 1000);
            return () => clearTimeout(timer);
        }
    }, [addressForm.addressLine1, addressForm.city, addressForm.state]);

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (!user) return null;

    return (
        <AccountLayout>
            <div className="space-y-8 pb-12">
                
                {/* ── Section 1: Identity Header Card ── */}
                <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 group">
                    <div className="h-48 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 relative">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                        <div className="absolute -bottom-16 left-8 flex items-end gap-6">
                            <div className="relative group/avatar">
                                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 border-4 border-white shadow-2xl flex items-center justify-center text-white text-4xl font-black">
                                    {profileData.photoURL ? (
                                        <img src={profileData.photoURL} alt="" className="w-full h-full object-cover rounded-2xl" />
                                    ) : (
                                        getInitials(profileData.fullName)
                                    )}
                                </div>
                                <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-lg border border-gray-100 text-indigo-600 hover:scale-110 transition-transform">
                                    <Edit3 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="pt-20 pb-8 px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 leading-tight">{profileData.fullName || 'New User'}</h1>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4">
                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab('details');
                            setSearchParams({ tab: 'details' });
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition ${activeTab === 'details' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                    >
                        Profile Details
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab('address');
                            setSearchParams({ tab: 'address' });
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition ${activeTab === 'address' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                    >
                        Addresses
                    </button>
                </div>

                {activeTab === 'details' ? (
                    <div className="grid grid-cols-1 gap-8">
                        <div className="space-y-6">
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-gray-900 leading-none">Personal Info</h2>
                                        <p className="text-xs text-gray-400 mt-1 font-bold">Your basic profile settings</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Identity Name</label>
                                        <div className="relative group">
                                            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                            <input 
                                                type="text" 
                                                value={profileData.fullName}
                                                onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact Channel</label>
                                        <div className="relative group">
                                            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                            <input 
                                                type="tel" 
                                                value={profileData.phone}
                                                placeholder="+91 XXXXX XXXX"
                                                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Birth Timeline</label>
                                        <div className="relative group">
                                            <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                            <input 
                                                type="date" 
                                                value={profileData.dateOfBirth}
                                                onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 pt-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gender Expression</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['Male', 'Female', 'Other'].map(g => (
                                                <button
                                                    key={g}
                                                    type="button"
                                                    onClick={() => setProfileData({...profileData, gender: g})}
                                                    className={`py-2.5 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${profileData.gender === g ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200' : 'bg-white text-gray-500 border-gray-100 hover:border-indigo-200'}`}
                                                >
                                                    {g}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* New Save Button at the bottom of Personal Info */}
                                    <div className="pt-4">
                                        <button 
                                            onClick={handleSaveProfile}
                                            disabled={saving}
                                            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl ${saveSuccess ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                        >
                                            {saveSuccess ? <><CheckCircle size={18}/> Saved Successfully</> : <>{saving ? 'Syncing...' : 'Save Profile Changes'}</>}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 overflow-hidden relative group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                                <h3 className="text-lg font-black leading-tight relative z-10">Account Security</h3>
                                <p className="text-white/70 text-xs mt-2 relative z-10 font-bold tracking-wide">Manage your login credentials and secondary authentication methods.</p>
                                <button className="mt-6 w-full py-3 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-colors relative z-10">
                                    Update Credentials
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-gray-900 leading-none">Address Book</h2>
                                        <p className="text-xs text-gray-400 mt-1 font-bold">Manage your delivery locations</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                     <button 
                                        onClick={() => setAddressForm({id: null, nickname: 'Home', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', country: 'India'})}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors"
                                    >
                                        <Plus size={14}/> Add New
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Form & Map */}
                                <div className="space-y-6 order-2 md:order-1">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2 space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nickname</label>
                                            <input 
                                                value={addressForm.nickname}
                                                onChange={(e) => setAddressForm({...addressForm, nickname: e.target.value})}
                                                placeholder="Home / Work / Other"
                                                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 ring-emerald-500/20 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Street Address</label>
                                            <input 
                                                value={addressForm.addressLine1}
                                                onChange={(e) => setAddressForm({...addressForm, addressLine1: e.target.value})}
                                                placeholder="Flat/House No, Building"
                                                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 ring-emerald-500/20 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City</label>
                                            <input 
                                                value={addressForm.city}
                                                onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                                                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 ring-emerald-500/20 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pincode</label>
                                            <input 
                                                value={addressForm.pincode}
                                                onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})}
                                                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 ring-emerald-500/20 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={handleAddOrUpdateAddress}
                                        className="w-full py-4 bg-gray-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl active:scale-[0.98]"
                                    >
                                        {addressForm.id ? 'Save Changes' : 'Add to Collection'}
                                    </button>

                                    {mapUrl && (
                                        <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-inner group relative h-40">
                                            <iframe src={mapUrl} className="w-full h-full grayscale-[0.5] group-hover:grayscale-0 transition-all" title="map"></iframe>
                                            <div className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-xl shadow-sm">
                                                <MapIcon size={14} className="text-emerald-600" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Saved Addresses List */}
                                <div className="order-1 md:order-2 space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-2">Registry ({savedAddresses.length})</label>
                                    {savedAddresses.length === 0 ? (
                                        <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl p-6 text-center">
                                            <Navigation size={24} className="text-gray-200 mb-2" />
                                            <p className="text-xs font-bold text-gray-400">No addresses on file.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                            {savedAddresses.map(addr => (
                                                <div 
                                                    key={addr.id} 
                                                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer group ${selectedAddressId === addr.id ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-gray-50 hover:border-emerald-100'}`}
                                                    onClick={() => setSelectedAddressId(addr.id)}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="text-sm font-black text-gray-900">{addr.nickname}</h4>
                                                                {selectedAddressId === addr.id && <CheckCircle size={14} className="text-emerald-600" />}
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1 font-bold leading-relaxed pr-8">
                                                                {addr.addressLine1}, {addr.city} - {addr.pincode}
                                                            </p>
                                                        </div>
                                                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); setAddressForm(addr); }}
                                                                className="p-1.5 bg-white shadow-sm rounded-lg text-emerald-600 hover:bg-emerald-50"
                                                            >
                                                                <Edit3 size={14} />
                                                            </button>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); setSavedAddresses(prev => prev.filter(a => a.id !== addr.id)); }}
                                                                className="p-1.5 bg-white shadow-sm rounded-lg text-red-500 hover:bg-red-50"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-emerald-600 p-8 rounded-3xl text-white shadow-xl shadow-emerald-100 relative overflow-hidden group">
                                <Navigation className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 group-hover:scale-125 transition-transform duration-700" />
                                <h3 className="text-lg font-black leading-tight">Fast Delivery</h3>
                                <p className="text-emerald-100/70 text-xs mt-2 font-bold uppercase tracking-wider">Estimated delivery within 24-48 hours to your primary address.</p>
                            </div>
                            <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl shadow-slate-200 relative overflow-hidden group">
                                <Globe className="absolute -bottom-4 -right-4 w-24 h-24 text-white/5 group-hover:scale-125 transition-transform duration-700" />
                                <h3 className="text-lg font-black leading-tight">Pan-India Support</h3>
                                <p className="text-slate-400 text-xs mt-2 font-bold uppercase tracking-wider">We deliver to over 19,000+ pincodes across the country.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}} />
        </AccountLayout>
    );
};

export default Profile;
