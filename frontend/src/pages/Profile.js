import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
    User, Package, LogOut, Clock, Settings, MapPin, Phone, Mail, Save, CheckCircle,
    Camera, Bell, MapPinned, Moon, MessageSquare, Shield, Calendar, ChevronRight,
    Plus, Trash2, Home, Briefcase
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

const Profile = () => {
    const { user, logout } = useAuth();
    const { showAlert, showToast } = useNotifications();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

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
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [addressForm, setAddressForm] = useState({
        type: 'Home', // Home, Office, Other
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
    });

    // App Settings (Decoupled from profile)
    const [appSettings, setAppSettings] = useState({
        location_access: false,
        notifications: true,
        email_updates: true,
        camera_access: true,
        dark_mode: false,
        floating_shortcut: false,
        overlay_mode: false,
        language: 'English'
    });

    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'settings') setActiveTab('settings');
        else if (tab === 'orders') setActiveTab('orders');
    }, [searchParams]);

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }

        // Fetch profile from backend
        const fetchProfile = async () => {
            try {
                const res = await api.get(`/profile/${encodeURIComponent(user.email)}/`);
                const data = res.data;

                setProfileData({
                    fullName: data.fullName || user.name || '',
                    phone: data.phone || '',
                    email: data.email || user.email || '',
                    photoURL: data.photoURL || user.photoURL || '',
                    dateOfBirth: data.dateOfBirth || '',
                    gender: data.gender || ''
                });

                if (data.addresses) {
                    setAddresses(data.addresses);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                setProfileData({
                    fullName: user.name || '',
                    phone: '',
                    email: user.email || '',
                    photoURL: user.photoURL || '',
                    dateOfBirth: '',
                    gender: ''
                });
            }
        };

        // Fetch user settings from separate endpoint
        const fetchUserSettings = async () => {
            try {
                const res = await api.get(`/user-settings/${encodeURIComponent(user.email)}/`);
                setAppSettings(res.data);
            } catch (error) {
                console.error("Error fetching user settings:", error);
            }
        };

        fetchProfile();
        fetchUserSettings();
    }, [user, navigate]);

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await Promise.all([
                api.post(`/profile/${encodeURIComponent(user.email)}/`, {
                    ...profileData,
                    addresses: addresses
                }),
                api.post(`/user-settings/${encodeURIComponent(user.email)}/`, appSettings)
            ]);
            setSaveSuccess(true);
            showToast("Profile and settings updated", "success");
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error("Error saving profile/settings:", error);
            showAlert("Failed to save changes", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleAddAddress = () => {
        if (!addressForm.addressLine1 || !addressForm.city || !addressForm.pincode) {
            showAlert("Required address fields missing", "warning");
            return;
        }
        if (editingAddressId) {
            setAddresses(addresses.map(a => a.id === editingAddressId ? { ...addressForm, id: editingAddressId } : a));
            setEditingAddressId(null);
        } else {
            setAddresses([...addresses, { ...addressForm, id: Date.now() }]);
        }
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

    const editAddress = (addr) => {
        setAddressForm(addr);
        setEditingAddressId(addr.id);
        setShowAddressForm(true);
    };

    const removeAddress = (id) => {
        setAddresses(addresses.filter(a => a.id !== id));
    };

    const requestLocationAccess = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setAppSettings(prev => ({ ...prev, location_access: true }));
                    showToast("Location access granted", "info");
                },
                (error) => {
                    showAlert("Location access denied. Please enable it in browser settings.", "warning");
                }
            );
        } else {
            showAlert("Geolocation not supported by this browser.", "error");
        }
    };

    if (!user) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-50';
            case 'processing': return 'text-blue-600 bg-blue-50';
            case 'cancelled': return 'text-red-600 bg-red-50';
            default: return 'text-yellow-600 bg-yellow-50';
        }
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

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4 lg:px-6">
            <div className="max-w-5xl mx-auto">

                {/* User Header Card */}
                <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 text-white mb-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative">
                            {profileData.photoURL ? (
                                <img src={profileData.photoURL} alt={profileData.fullName} className="w-20 h-20 rounded-full object-cover ring-4 ring-white/30" />
                            ) : (
                                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getAvatarColor(profileData.fullName)} flex items-center justify-center text-2xl font-bold ring-4 ring-white/30`}>
                                    {getInitials(profileData.fullName)}
                                </div>
                            )}
                            <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full text-gray-600 shadow-lg hover:bg-gray-100">
                                <Camera size={14} />
                            </button>
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-xl lg:text-2xl font-bold">{profileData.fullName || user.name}</h1>
                            <p className="text-white/70 text-sm flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                                <Mail size={14} /> {profileData.email || user.email}
                            </p>
                            {profileData.phone && (
                                <p className="text-white/70 text-sm flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                                    <Phone size={14} /> {profileData.phone}
                                </p>
                            )}
                        </div>
                        <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-sm font-medium">
                            <LogOut size={16} /> Sign Out
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar Navigation */}
                    <div className="md:w-64 space-y-2">
                        {[
                            { id: 'profile', label: 'My Account', icon: User, color: 'text-blue-500', bg: 'bg-blue-50' },
                            { id: 'orders', label: 'Order History', icon: Package, color: 'text-orange-500', bg: 'bg-orange-50' },
                            { id: 'settings', label: 'App Settings', icon: Settings, color: 'text-purple-500', bg: 'bg-purple-50' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    if (tab.id === 'orders') {
                                        navigate('/orders');
                                    } else {
                                        setActiveTab(tab.id);
                                    }
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform ${activeTab === tab.id
                                    ? 'bg-white shadow-md scale-[1.02] text-gray-900 border-l-4 border-secondary'
                                    : 'text-gray-500 hover:bg-white/50 hover:translate-x-1'
                                    }`}
                            >
                                <div className={`p-1.5 rounded-lg ${activeTab === tab.id ? tab.bg + ' ' + tab.color : 'bg-gray-100 text-gray-400'}`}>
                                    <tab.icon size={18} />
                                </div>
                                {tab.label}
                                {activeTab === tab.id && <ChevronRight size={16} className="ml-auto text-gray-400" />}
                            </button>
                        ))}

                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-bold text-sm hover:bg-red-50 rounded-xl transition-all"
                            >
                                <LogOut size={18} /> Sign Out
                            </button>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 animate-fade-in">

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <User size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">Personal Information</h2>
                                    <p className="text-xs text-gray-500">Update your personal details</p>
                                </div>
                            </div>
                            {saveSuccess && (
                                <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                    <CheckCircle size={16} /> Saved!
                                </span>
                            )}
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={profileData.fullName}
                                        onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 ring-secondary/20 outline-none"
                                        placeholder="Enter full name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 ring-secondary/20 outline-none"
                                        placeholder="+91 XXXXX XXXXX"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        disabled
                                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                    <input
                                        type="date"
                                        value={profileData.dateOfBirth}
                                        onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 ring-secondary/20 outline-none"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                    <div className="flex gap-4">
                                        {['Male', 'Female', 'Other'].map(g => (
                                            <label key={g} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value={g}
                                                    checked={profileData.gender === g}
                                                    onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                                                    className="w-4 h-4 text-secondary"
                                                />
                                                <span className="text-sm text-gray-600">{g}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Address Section */}
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                        <MapPin size={18} className="text-green-600" /> Saved Addresses
                                    </h3>
                                    <button
                                        onClick={() => setShowAddressForm(!showAddressForm)}
                                        className="text-secondary text-sm font-bold flex items-center gap-1 hover:underline"
                                    >
                                        <Plus size={16} /> Add New
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {addresses.length === 0 && !showAddressForm && (
                                        <div className="md:col-span-2 p-8 border-2 border-dashed border-gray-200 rounded-xl text-center">
                                            <p className="text-gray-400 text-sm">No addresses saved yet.</p>
                                        </div>
                                    )}

                                    {addresses.map((addr) => (
                                        <div key={addr.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50 flex justify-between items-start group">
                                            <div className="flex gap-3">
                                                <div className="p-2 bg-white rounded-lg text-gray-400">
                                                    {addr.type === 'Office' ? <Briefcase size={16} /> : <Home size={16} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-gray-800">{addr.type}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                                        {addr.addressLine1}, {addr.addressLine2 && addr.addressLine2 + ','} {addr.city}, {addr.state} - {addr.pincode}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => editAddress(addr)} className="p-1.5 text-blue-400 hover:bg-blue-50 rounded-lg transition-colors">
                                                    <Edit2 size={14} />
                                                </button>
                                                <button onClick={() => removeAddress(addr.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {showAddressForm && (
                                    <div className="bg-gray-50 p-6 rounded-2xl border border-secondary/20 animate-fade-in mb-6">
                                        <h4 className="font-bold text-gray-800 mb-4 text-sm">{editingAddressId ? 'Edit Address' : 'Add New Address'}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Address Type</label>
                                                <div className="flex gap-2">
                                                    {['Home', 'Office', 'Other'].map(t => (
                                                        <button
                                                            key={t}
                                                            onClick={() => setAddressForm({ ...addressForm, type: t })}
                                                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${addressForm.type === t ? 'bg-secondary text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
                                                        >
                                                            {t}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="md:col-span-2">
                                                <input
                                                    type="text"
                                                    value={addressForm.addressLine1}
                                                    onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 ring-secondary/20"
                                                    placeholder="House/Flat No., Building Name"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <input
                                                    type="text"
                                                    value={addressForm.addressLine2}
                                                    onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 ring-secondary/20"
                                                    placeholder="Street, Landmark"
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    value={addressForm.city}
                                                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 ring-secondary/20"
                                                    placeholder="City"
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    value={addressForm.state}
                                                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 ring-secondary/20"
                                                    placeholder="State"
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    value={addressForm.pincode}
                                                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 ring-secondary/20"
                                                    placeholder="Pincode"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={handleAddAddress} className="flex-1 bg-secondary text-white py-2.5 rounded-lg text-sm font-bold shadow-lg hover:bg-indigo-600 transition-all">
                                                    {editingAddressId ? 'Update Address' : 'Add Address'}
                                                </button>
                                                <button onClick={() => { setShowAddressForm(false); setEditingAddressId(null); }} className="px-4 bg-white text-gray-500 border border-gray-200 rounded-lg text-sm font-bold">
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="mt-6 px-8 py-3 bg-secondary text-white rounded-lg font-medium hover:bg-indigo-600 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Settings Tab Redesign */}
                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        {/* Settings Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
                                <p className="text-sm text-gray-500">Customize your SJG experience</p>
                            </div>
                            {saveSuccess && (
                                <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-xs font-bold animate-bounce flex items-center gap-2">
                                    <CheckCircle size={14} /> Changes Applied
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Group: Appearance */}
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Appearance
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl">
                                                <Moon size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 dark:text-gray-100">Dark Theme</p>
                                                <p className="text-xs text-gray-400">Reduce eye strain at night</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={appSettings.dark_mode}
                                            onChange={(isDark) => {
                                                setAppSettings({ ...appSettings, dark_mode: isDark });
                                                if (isDark) document.documentElement.classList.add('dark');
                                                else document.documentElement.classList.remove('dark');
                                            }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-2xl">
                                                <MessageSquare size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 dark:text-gray-100">Floating Menu</p>
                                                <p className="text-xs text-gray-400">Enable quick action bubble</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={appSettings.floating_shortcut}
                                            onChange={(v) => setAppSettings({ ...appSettings, floating_shortcut: v })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Group: Notifications */}
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Notifications
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-pink-50 dark:bg-pink-900/30 text-pink-600 rounded-2xl">
                                                <Bell size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 dark:text-gray-100">Push Updates</p>
                                                <p className="text-xs text-gray-400">Order & delivery alerts</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={appSettings.notifications}
                                            onChange={(v) => setAppSettings({ ...appSettings, notifications: v })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 rounded-2xl">
                                                <Mail size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 dark:text-gray-100">Marketing Email</p>
                                                <p className="text-xs text-gray-400">New arrivals & promotions</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={appSettings.email_updates}
                                            onChange={(v) => setAppSettings({ ...appSettings, email_updates: v })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Group: Regional */}
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div> Connectivity & Localization
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-teal-50 dark:bg-teal-900/30 text-teal-600 rounded-2xl">
                                                <MapPinned size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 dark:text-gray-100">Location Services</p>
                                                <p className="text-xs text-gray-400">Used for faster delivery address</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={requestLocationAccess}
                                            className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${appSettings.location_access ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                        >
                                            {appSettings.location_access ? 'Active' : 'Enable'}
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-violet-50 dark:bg-violet-900/30 text-violet-600 rounded-2xl">
                                                <Camera size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 dark:text-gray-100">Camera Permission</p>
                                                <p className="text-xs text-gray-400">Used for QR scanning</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                                                    navigator.mediaDevices.getUserMedia({ video: true })
                                                        .then(() => {
                                                            setAppSettings(prev => ({ ...prev, camera_access: true }));
                                                            showToast("Camera access granted", "info");
                                                        })
                                                        .catch(() => showAlert("Camera access denied", "warning"));
                                                }
                                            }}
                                            className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${appSettings.camera_access ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                        >
                                            {appSettings.camera_access ? 'Active' : 'Enable'}
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-violet-50 dark:bg-violet-900/30 text-violet-600 rounded-2xl">
                                                <Settings size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 dark:text-gray-100">App Language</p>
                                                <p className="text-xs text-gray-400">Select preferred language</p>
                                            </div>
                                        </div>
                                        <select
                                            value={appSettings.language}
                                            onChange={(e) => setAppSettings({ ...appSettings, language: e.target.value })}
                                            className="bg-gray-50 dark:bg-gray-700 border-none text-gray-800 dark:text-gray-100 text-sm font-bold rounded-xl p-2 outline-none focus:ring-2 ring-secondary/20 transition-all cursor-pointer"
                                        >
                                            <option value="English">🇬🇧 EN</option>
                                            <option value="Tamil">🇮🇳 TA</option>
                                            <option value="Hindi">🇮🇳 HI</option>
                                            <option value="Spanish">🇪🇸 ES</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Group: Security */}
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div> Security & Account
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl">
                                                <Shield size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 dark:text-gray-100">Account Type</p>
                                                <p className="text-xs text-gray-400 uppercase tracking-widest">{user.role || 'Standard'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-gray-50 dark:border-gray-700 pt-4">
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Data Synchronization</p>
                                        <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Live
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save Floating Bar */}
                        <div className="sticky bottom-6 flex justify-center mt-8">
                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="px-10 py-4 bg-secondary text-white rounded-full font-bold shadow-2xl hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Saving Settings...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} />
                                        <span>Apply All Settings</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

// --- Custom Reusable Components for Redesign ---

const Switch = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer group">
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only peer"
        />
        <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-all after:shadow-sm peer-checked:bg-secondary group-active:after:w-6 transition-all"></div>
    </label>
);

export default Profile;
