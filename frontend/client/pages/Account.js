import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
    User, Mail, Phone, Calendar, MapPin, Plus, Trash2, Home, 
    Briefcase, Save, CheckCircle, Camera, ChevronRight, MapPinned
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Account = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Profile Data
    const [profileData, setProfileData] = useState({
        fullName: '',
        phone: '',
        email: '',
        photoURL: '',
        dateOfBirth: '',
        gender: ''
    });

    // Addresses Management
    const [addresses, setAddresses] = useState([]);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addressForm, setAddressForm] = useState({
        type: 'Home',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
    });

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }

        const fetchProfile = async () => {
            try {
                const res = await axios.get(`/api/profile/${encodeURIComponent(user.email)}/`);
                const data = res.data;

                setProfileData({
                    fullName: data.fullName || user.name || '',
                    phone: data.phone || '',
                    email: data.email || user.email || '',
                    photoURL: data.photoURL || user.photoURL || '',
                    dateOfBirth: data.dateOfBirth || '',
                    gender: data.gender || ''
                });

                if (data.addresses) setAddresses(data.addresses);
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user, navigate]);

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await axios.post(`/api/profile/${encodeURIComponent(user.email)}/`, {
                ...profileData,
                addresses
            });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error("Error saving profile:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleAddAddress = () => {
        if (!addressForm.addressLine1 || !addressForm.city || !addressForm.pincode) return;
        const newAddress = { ...addressForm, id: Date.now() };
        setAddresses([...addresses, newAddress]);
        setAddressForm({
            type: 'Home',
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India'
        });
        setShowAddressForm(false);
    };

    const removeAddress = (id) => {
        setAddresses(addresses.filter(a => a.id !== id));
    };

    const getAvatarColor = (name) => {
        const colors = ['from-blue-500 to-blue-600', 'from-purple-500 to-purple-600', 'from-green-500 to-green-600', 'from-orange-500 to-orange-600', 'from-pink-500 to-pink-600', 'from-indigo-500 to-indigo-600'];
        const index = name ? name.charCodeAt(0) % colors.length : 0;
        return colors[index];
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50 pt-24 pb-12 px-4 lg:px-6">
            <div className="max-w-4xl mx-auto">
                
                {/* User Header Card */}
                <div className="bg-gradient-to-br from-primary via-indigo-600 to-secondary rounded-3xl p-8 text-white mb-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl transition-transform duration-700 group-hover:scale-110"></div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                        <div className="relative">
                            {profileData.photoURL ? (
                                <img src={profileData.photoURL} alt={profileData.fullName} className="w-24 h-24 rounded-3xl object-cover ring-4 ring-white/30 shadow-2xl transform transition-transform group-hover:scale-105" />
                            ) : (
                                <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${getAvatarColor(profileData.fullName)} flex items-center justify-center text-3xl font-bold ring-4 ring-white/30 shadow-2xl`}>
                                    {getInitials(profileData.fullName)}
                                </div>
                            )}
                            <button className="absolute -bottom-2 -right-2 p-2.5 bg-white rounded-xl text-primary shadow-xl hover:bg-gray-50 hover:scale-110 transition-all">
                                <Camera size={18} />
                            </button>
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-2xl lg:text-3xl font-black tracking-tight">{profileData.fullName || user?.name}</h1>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2">
                                <p className="text-white/80 text-sm flex items-center gap-1.5 font-medium">
                                    <Mail size={14} /> {profileData.email || user?.email}
                                </p>
                                {profileData.phone && (
                                    <p className="text-white/80 text-sm flex items-center gap-1.5 font-medium">
                                        <Phone size={14} /> {profileData.phone}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                             <button onClick={() => navigate('/settings')} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all" title="Settings">
                                <SettingsIcon size={20} />
                            </button>
                            <button onClick={logout} className="p-3 bg-red-500/20 hover:bg-red-500/30 text-white rounded-2xl transition-all" title="Logout">
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
                    {/* Left: Personal Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 animate-fade-in">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-500 rounded-xl">
                                        <User size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Personal Info</h2>
                                </div>
                                {saveSuccess && (
                                    <span className="flex items-center gap-1 text-emerald-600 text-xs font-black uppercase tracking-widest animate-pulse">
                                        <CheckCircle size={14} /> Synced
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Field label="Full Name" value={profileData.fullName} onChange={(val) => setProfileData({...profileData, fullName: val})} icon={<User size={16} />} />
                                <Field label="Phone" value={profileData.phone} onChange={(val) => setProfileData({...profileData, phone: val})} icon={<Phone size={16} />} placeholder="+91 XXXXX XXXXX" />
                                <div className="md:col-span-2">
                                     <Field label="Email" value={profileData.email} disabled icon={<Mail size={16} />} />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">DOB</label>
                                    <input 
                                        type="date" 
                                        className="w-full px-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 ring-primary/5 outline-none font-bold text-sm text-gray-700 transition-all"
                                        value={profileData.dateOfBirth}
                                        onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Gender</label>
                                    <div className="flex gap-3">
                                        {['Male', 'Female', 'Other'].map(g => (
                                            <button 
                                                key={g} 
                                                onClick={() => setProfileData({...profileData, gender: g})}
                                                className={`flex-1 py-3.5 rounded-2xl text-xs font-bold transition-all border ${profileData.gender === g ? 'bg-primary text-white border-primary shadow-lg scale-[1.02]' : 'bg-gray-50 text-gray-500 border-transparent hover:border-gray-200'}`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="w-full mt-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95"
                            >
                                {saving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Save size={18} />}
                                {saving ? 'Updating Database...' : 'Save Profile Changes'}
                            </button>
                        </div>
                    </div>

                    {/* Right: Addresses */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl">
                                        <MapPinned size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Addresses</h2>
                                </div>
                                <button 
                                    onClick={() => setShowAddressForm(!showAddressForm)}
                                    className="p-2 bg-gray-50 hover:bg-primary hover:text-white rounded-xl transition-all shadow-sm"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>

                            {showAddressForm && (
                                <div className="bg-gray-50 rounded-2xl p-5 mb-6 animate-fade-in border border-primary/10">
                                    <div className="flex gap-2 mb-4">
                                        {['Home', 'Office'].map(t => (
                                            <button 
                                                key={t}
                                                onClick={() => setAddressForm({...addressForm, type: t})}
                                                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${addressForm.type === t ? 'bg-primary text-white' : 'bg-white text-gray-400'}`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                    <input 
                                        placeholder="Address Line 1"
                                        className="w-full px-3 py-2.5 bg-white border border-transparent rounded-xl mb-2 text-xs font-bold outline-none focus:ring-2 ring-primary/10"
                                        value={addressForm.addressLine1}
                                        onChange={(e) => setAddressForm({...addressForm, addressLine1: e.target.value})}
                                    />
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        <input 
                                            placeholder="City"
                                            className="w-full px-3 py-2.5 bg-white border border-transparent rounded-xl text-xs font-bold outline-none"
                                            value={addressForm.city}
                                            onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                                        />
                                        <input 
                                            placeholder="Pincode"
                                            className="w-full px-3 py-2.5 bg-white border border-transparent rounded-xl text-xs font-bold outline-none"
                                            value={addressForm.pincode}
                                            onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})}
                                        />
                                    </div>
                                    <button onClick={handleAddAddress} className="w-full py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                                        Add Now
                                    </button>
                                </div>
                            )}

                            <div className="space-y-4 flex-1">
                                {addresses.length === 0 ? (
                                    <div className="h-40 flex flex-col items-center justify-center text-gray-300 gap-3 border-2 border-dashed border-gray-50 rounded-3xl">
                                        <MapPin size={32} />
                                        <p className="text-[10px] font-black uppercase">No saved spots</p>
                                    </div>
                                ) : (
                                    addresses.map(addr => (
                                        <div key={addr.id} className="group p-4 bg-gray-50 hover:bg-white rounded-2xl border border-transparent hover:border-gray-100 hover:shadow-md transition-all relative">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-white rounded-xl text-gray-400 group-hover:text-primary transition-colors">
                                                    {addr.type === 'Office' ? <Briefcase size={16} /> : <Home size={16} />}
                                                </div>
                                                <div className="pr-8">
                                                    <p className="text-xs font-black text-gray-800 uppercase tracking-tighter">{addr.type}</p>
                                                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-0.5">{addr.addressLine1}, {addr.city}</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => removeAddress(addr.id)}
                                                className="absolute top-4 right-4 p-1.5 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Field = ({ label, value, onChange, disabled, icon, placeholder }) => (
    <div className="group">
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{label}</label>
        <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors">
                {icon}
            </div>
            <input 
                type="text" 
                disabled={disabled}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange && onChange(e.target.value)}
                className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 ring-primary/5 outline-none font-bold text-sm text-gray-700 transition-all ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''}`}
            />
        </div>
    </div>
);

const SettingsIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);

export default Account;
