import React, { useState, useEffect } from 'react';
import { Save, Loader2, Store, CreditCard, User, Shield, Image as ImageIcon } from 'lucide-react';
import api from '../utils/api';
import { useNotifications } from '../context/NotificationContext';

const AdminSettings = () => {
    const { showToast } = useNotifications();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState({
        storeName: "SJG Stationery",
        currency: "INR (₹)",
        whatsapp: "+91 93600 24821",
        address: "Sakthi Nagar, Thindal, Erode - 638 012",
        email: "sjgvxerox@gmail.com",
        gstPercentage: 18,
        serviceGst: 18,
        isOnlinePaymentEnabled: true,
        isCodEnabled: true,
        freeShippingThreshold: 999,
        shippingFee: 50,
        isShopOpen: true,
        adminPassword: "",
        adminName: "Administrator",
        adminAvatar: "",
        shopOpeningTime: "09:00",
        shopClosingTime: "20:00"
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                const { data } = await api.get('/settings/');
                if (data) {
                    setSettings({
                        storeName: data.store_name || "SJG Stationery",
                        currency: data.currency || "INR (₹)",
                        whatsapp: data.whatsapp || "+91 93600 24821",
                        address: data.address || "Sakthi Nagar, Thindal, Erode - 638 012",
                        email: data.email || "sjgvxerox@gmail.com",
                        gstPercentage: data.gst_percentage !== undefined ? data.gst_percentage : 18,
                        serviceGst: data.service_gst !== undefined ? data.service_gst : 18,
                        isOnlinePaymentEnabled: data.is_online_payment_enabled !== undefined ? data.is_online_payment_enabled : true,
                        isCodEnabled: data.is_cod_enabled !== undefined ? data.is_cod_enabled : true,
                        freeShippingThreshold: data.free_shipping_threshold !== undefined ? data.free_shipping_threshold : 999,
                        shippingFee: data.shipping_fee !== undefined ? data.shipping_fee : 50,
                        isShopOpen: data.is_shop_open !== undefined ? data.is_shop_open : true,
                        adminPassword: "",
                        adminName: data.admin_name || "Administrator",
                        adminAvatar: data.admin_avatar || "",
                        shopOpeningTime: data.shop_opening_time || "09:00",
                        shopClosingTime: data.shop_closing_time || "20:00"
                    });
                }
            } catch (err) {
                console.error("Failed to fetch settings:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post('/settings/', {
                store_name: settings.storeName,
                currency: settings.currency,
                whatsapp: settings.whatsapp,
                address: settings.address,
                email: settings.email,
                gst_percentage: Number(settings.gstPercentage),
                service_gst: Number(settings.serviceGst),
                is_online_payment_enabled: settings.isOnlinePaymentEnabled,
                is_cod_enabled: settings.isCodEnabled,
                free_shipping_threshold: Number(settings.freeShippingThreshold),
                shipping_fee: Number(settings.shippingFee),
                is_shop_open: settings.isShopOpen,
                shop_opening_time: settings.shopOpeningTime,
                shop_closing_time: settings.shopClosingTime,
                admin_name: settings.adminName,
                admin_avatar: settings.adminAvatar,
                ...(settings.adminPassword && { password: settings.adminPassword })
            });
            
            // Sync with local session if needed
            const adminSession = JSON.parse(localStorage.getItem('admin_settings') || '{}');
            localStorage.setItem('admin_settings', JSON.stringify({
                ...adminSession,
                ...settings
            }));

            showToast("System configuration updated", "success");
            setSettings(prev => ({ ...prev, adminPassword: "" }));
        } catch (err) {
            showToast("Configuration sync failed", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-32">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
        </div>
    );

    const tabs = [
        { id: 'general', label: 'General', icon: Store },
        { id: 'payments', label: 'Payments & Tax', icon: CreditCard },
        { id: 'profile', label: 'Admin Profile', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
    ];

    return (
        <div className="max-w-4xl animate-fade-in pb-20">
            {/* Header / Tabs */}
            <div className="flex items-center gap-2 mb-8 bg-white/50 p-2 rounded-[2rem] border border-white max-w-fit shadow-sm">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-sm font-black transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-white hover:text-slate-900'}`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-10">
                    {activeTab === 'general' && (
                        <div className="space-y-8 animate-fade-in-up">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Enterprise Name</label>
                                    <input 
                                        type="text" 
                                        value={settings.storeName} 
                                        onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Base Currency</label>
                                    <select 
                                        value={settings.currency}
                                        onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 ring-indigo-500/10 outline-none transition-all font-bold appearance-none"
                                    >
                                        <option>INR (₹)</option>
                                        <option>USD ($)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Corporate Email</label>
                                    <input 
                                        type="email" 
                                        value={settings.email} 
                                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 ring-indigo-500/10 outline-none transition-all font-bold" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp Telemetry</label>
                                    <input 
                                        type="text" 
                                        value={settings.whatsapp} 
                                        onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 ring-indigo-500/10 outline-none transition-all font-bold" 
                                    />
                                </div>
                            </div>

                            <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-slate-900 flex items-center gap-2">Shop Availability {settings.isShopOpen ? <span className="bg-emerald-500 w-2 h-2 rounded-full animate-pulse"></span> : <span className="bg-rose-500 w-2 h-2 rounded-full"></span>}</p>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">Toggle to show the shop as Open or Closed on the public site.</p>
                                    </div>
                                    <button
                                        onClick={() => setSettings({ ...settings, isShopOpen: !settings.isShopOpen })}
                                        className={`relative w-14 h-8 transition-colors rounded-full shrink-0 flex items-center border ${settings.isShopOpen ? 'bg-emerald-500 border-emerald-600' : 'bg-slate-300 border-slate-400'}`}
                                    >
                                        <span className={`absolute top-[3px] left-1 w-6 h-6 bg-white rounded-full transition-transform shadow-md ${settings.isShopOpen ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div className="space-y-1 mt-2 lg:mt-0">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Opening Time</label>
                                        <input 
                                            type="time" 
                                            value={settings.shopOpeningTime} 
                                            onChange={(e) => setSettings({ ...settings, shopOpeningTime: e.target.value })}
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 ring-indigo-500/20 outline-none font-bold" 
                                        />
                                    </div>
                                    <div className="space-y-1 mt-2 lg:mt-0">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Closing Time</label>
                                        <input 
                                            type="time" 
                                            value={settings.shopClosingTime} 
                                            onChange={(e) => setSettings({ ...settings, shopClosingTime: e.target.value })}
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 ring-indigo-500/20 outline-none font-bold" 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Physical Headquarters (Billing Address)</label>
                                <textarea 
                                    value={settings.address} 
                                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 ring-indigo-500/10 outline-none transition-all font-bold resize-none" 
                                    rows={3} 
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'payments' && (
                        <div className="space-y-8 animate-fade-in-up">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Standard Sales GST (%)</label>
                                    <input 
                                        type="number" 
                                        value={settings.gstPercentage} 
                                        onChange={(e) => setSettings({ ...settings, gstPercentage: e.target.value })}
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 ring-indigo-500/10 outline-none font-bold" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Execution GST (%)</label>
                                    <input 
                                        type="number" 
                                        value={settings.serviceGst} 
                                        onChange={(e) => setSettings({ ...settings, serviceGst: e.target.value })}
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 ring-indigo-500/10 outline-none font-bold" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logistics: Free Threshold (₹)</label>
                                    <input 
                                        type="number" 
                                        value={settings.freeShippingThreshold} 
                                        onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value })}
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 ring-indigo-500/10 outline-none font-bold" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Base Logistics Fee (₹)</label>
                                    <input 
                                        type="number" 
                                        value={settings.shippingFee} 
                                        onChange={(e) => setSettings({ ...settings, shippingFee: e.target.value })}
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 ring-indigo-500/10 outline-none font-bold" 
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <button 
                                    onClick={() => setSettings({...settings, isOnlinePaymentEnabled: !settings.isOnlinePaymentEnabled})}
                                    className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all font-black text-sm ${settings.isOnlinePaymentEnabled ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
                                >
                                    Online Gateways {settings.isOnlinePaymentEnabled ? 'Enabled' : 'Disabled'}
                                </button>
                                <button 
                                    onClick={() => setSettings({...settings, isCodEnabled: !settings.isCodEnabled})}
                                    className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all font-black text-sm ${settings.isCodEnabled ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
                                >
                                    Cash Delivery {settings.isCodEnabled ? 'Enabled' : 'Disabled'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="space-y-8 animate-fade-in-up">
                            <div className="flex items-center gap-10 p-8 bg-slate-900 rounded-[2.5rem] text-white overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[120px] rounded-full"></div>
                                <div className="relative group">
                                    <div className="w-28 h-28 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                                        {settings.adminAvatar ? (
                                            <img src={settings.adminAvatar} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={48} className="text-white/40" />
                                        )}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center border-4 border-slate-900 shadow-xl">
                                        <ImageIcon size={18} />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-2xl font-black tracking-tight">{settings.adminName}</h4>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-1">System Controller Identity</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Display Identity Name</label>
                                    <input 
                                        type="text" 
                                        value={settings.adminName} 
                                        onChange={(e) => setSettings({ ...settings, adminName: e.target.value })}
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 ring-indigo-500/10 outline-none font-bold" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Avatar Content URL</label>
                                    <input 
                                        type="text" 
                                        value={settings.adminAvatar} 
                                        onChange={(e) => setSettings({ ...settings, adminAvatar: e.target.value })}
                                        placeholder="https://images.unsplash.com/..."
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 ring-indigo-500/10 outline-none font-bold" 
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-8 animate-fade-in-up max-w-xl">
                            <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl mb-8 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center text-white"><Shield size={24} /></div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Critical Access</p>
                                    <p className="text-xs font-bold text-rose-700">Changing the admin password will immediately invalidate existing sessions.</p>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Master Override Password</label>
                                <input 
                                    type="password" 
                                    value={settings.adminPassword}
                                    onChange={(e) => setSettings({ ...settings, adminPassword: e.target.value })}
                                    placeholder="Enter new master key…" 
                                    className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-4 ring-indigo-500/10 outline-none font-mono text-xl tracking-[0.5em] focus:border-indigo-500 transition-all placeholder:text-xs placeholder:tracking-normal placeholder:font-sans" 
                                />
                                <p className="text-[10px] text-slate-400 font-bold mt-2 ml-2">AUTHENTICATION PROTOCOL: LEAVE VOID TO PERSIST CURRENT STATE.</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-100 mt-4 flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Synced: {new Date().toLocaleTimeString()}</p>
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-slate-950 text-white px-10 py-5 rounded-2xl font-black text-sm hover:bg-indigo-600 transition-all flex items-center gap-3 disabled:opacity-50 shadow-xl hover:shadow-indigo-500/25 active:scale-95 duration-200"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {saving ? 'Synchronizing Systems...' : 'Apply Global Configuration'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
