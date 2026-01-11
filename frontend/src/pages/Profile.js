import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
    User, Package, LogOut, Clock, Settings, MapPin, Phone, Mail, Save, CheckCircle,
    Camera, Bell, MapPinned, Moon, MessageSquare, Shield, Calendar, ChevronRight
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Profile = () => {
    const { user, logout } = useAuth();
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

    // Address Form
    const [addressForm, setAddressForm] = useState({
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
    });

    // App Settings
    const [appSettings, setAppSettings] = useState({
        locationAccess: false,
        notifications: true,
        emailUpdates: true,
        smsAlerts: false,
        darkMode: false
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

                if (data.address) {
                    setAddressForm(data.address);
                }

                if (data.appSettings) {
                    setAppSettings(data.appSettings);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                // Use local defaults
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

        // Fetch orders
        const fetchOrders = async () => {
            try {
                const res = await axios.get(`/api/orders/?user_email=${user.email}`);
                setOrders(res.data);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
        fetchOrders();
    }, [user, navigate]);

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await axios.post(`/api/profile/${encodeURIComponent(user.email)}/`, {
                ...profileData,
                address: addressForm,
                appSettings: appSettings
            });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Failed to save profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const requestLocationAccess = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setAppSettings(prev => ({ ...prev, locationAccess: true }));
                    alert(`Location access granted! Lat: ${position.coords.latitude.toFixed(4)}, Long: ${position.coords.longitude.toFixed(4)}`);
                },
                (error) => {
                    alert("Location access denied. Please enable it in your browser settings.");
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
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

                {/* Tab Navigation */}
                <div className="bg-white rounded-xl shadow-sm mb-6 p-1 flex gap-1">
                    {[
                        { id: 'profile', label: 'My Profile', icon: User },
                        { id: 'orders', label: 'Orders', icon: Package },
                        { id: 'settings', label: 'Settings', icon: Settings }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === tab.id ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <tab.icon size={16} /> <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

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
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <MapPin size={18} className="text-green-600" /> Delivery Address
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <input
                                            type="text"
                                            value={addressForm.addressLine1}
                                            onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 ring-secondary/20 outline-none"
                                            placeholder="House/Flat No., Building Name"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <input
                                            type="text"
                                            value={addressForm.addressLine2}
                                            onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 ring-secondary/20 outline-none"
                                            placeholder="Street, Landmark"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            value={addressForm.city}
                                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 ring-secondary/20 outline-none"
                                            placeholder="City"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            value={addressForm.state}
                                            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 ring-secondary/20 outline-none"
                                            placeholder="State"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            value={addressForm.pincode}
                                            onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 ring-secondary/20 outline-none"
                                            placeholder="Pincode"
                                        />
                                    </div>
                                    <div>
                                        <select
                                            value={addressForm.country}
                                            onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 ring-secondary/20 outline-none"
                                        >
                                            <option>India</option>
                                            <option>USA</option>
                                            <option>UK</option>
                                            <option>Canada</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="mt-6 px-8 py-3 bg-secondary text-white rounded-lg font-medium hover:bg-indigo-600 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                <Save size={18} /> {saving ? 'Saving...' : 'Save Profile'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                            <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                                <Package size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-gray-800">Order History</h2>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {loading ? (
                                <div className="p-12 text-center text-gray-400">Loading orders...</div>
                            ) : orders.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Package size={48} className="mx-auto text-gray-200 mb-4" />
                                    <h3 className="text-gray-700 font-medium mb-1">No orders yet</h3>
                                    <p className="text-gray-500 text-sm">Start shopping to see your orders here.</p>
                                </div>
                            ) : (
                                orders.map((order) => (
                                    <div key={order.order_id} className="p-5 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="font-bold text-gray-900">Order #{order.order_id}</span>
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${getStatusColor(order.status)}`}>
                                                        {order.status?.toUpperCase()}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Clock size={12} /> {new Date(order.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-lg font-bold text-primary">₹{order.total_amount}</span>
                                                <span className="text-xs text-gray-500">{order.items?.length || 0} Items</span>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                                            {order.items?.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <span className="text-gray-700">{item.product_name} <span className="text-gray-400">x{item.quantity}</span></span>
                                                    <span className="font-medium text-gray-900">₹{item.price * item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="space-y-4">
                        {/* App Settings */}
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                    <Settings size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">App Settings</h2>
                                    <p className="text-xs text-gray-500">Manage your preferences</p>
                                </div>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {/* Location Access */}
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                            <MapPinned size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-800">Location Access</h4>
                                            <p className="text-xs text-gray-500">Allow app to access your location</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={requestLocationAccess}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${appSettings.locationAccess
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {appSettings.locationAccess ? 'Enabled' : 'Enable'}
                                    </button>
                                </div>

                                {/* Notifications */}
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                            <Bell size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-800">Push Notifications</h4>
                                            <p className="text-xs text-gray-500">Receive order updates and offers</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={appSettings.notifications}
                                            onChange={(e) => setAppSettings({ ...appSettings, notifications: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                                    </label>
                                </div>

                                {/* Email Updates */}
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                                            <Mail size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-800">Email Updates</h4>
                                            <p className="text-xs text-gray-500">Receive newsletters and promotions</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={appSettings.emailUpdates}
                                            onChange={(e) => setAppSettings({ ...appSettings, emailUpdates: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                                    </label>
                                </div>

                                {/* SMS Alerts */}
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                                            <MessageSquare size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-800">SMS Alerts</h4>
                                            <p className="text-xs text-gray-500">Receive order updates via SMS</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={appSettings.smsAlerts}
                                            onChange={(e) => setAppSettings({ ...appSettings, smsAlerts: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="w-full py-3 bg-secondary text-white rounded-xl font-medium hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Save size={18} /> {saving ? 'Saving Settings...' : 'Save All Settings'}
                        </button>

                        {/* Account Info */}
                        <div className="bg-white rounded-2xl shadow-sm p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                                    <Shield size={20} />
                                </div>
                                <h2 className="text-lg font-bold text-gray-800">Account</h2>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-600">Account Type</span>
                                    <span className="text-sm font-medium text-gray-800 capitalize">{user.role || 'User'}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-600">Member Since</span>
                                    <span className="text-sm font-medium text-gray-800">{new Date().getFullYear()}</span>
                                </div>
                                <button
                                    onClick={logout}
                                    className="w-full mt-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                                >
                                    <LogOut size={18} /> Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Profile;
