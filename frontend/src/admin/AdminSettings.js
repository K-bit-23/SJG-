import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Globe, Percent, Phone, Mail, MapPin, ShieldCheck, DollarSign } from 'lucide-react';
import api from '../../src/utils/api';
import { useNotifications } from '../../src/context/NotificationContext';

const AdminSettings = () => {
    const { showToast } = useNotifications();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        store_name: 'SJG Stationery',
        currency: 'INR (₹)',
        whatsapp: '+91 93600 24821',
        email: 'sjgvxerox@gmail.com',
        address: 'Sakthi Nagar, Thindal, Erode - 638012.',
        gst_percentage: 18,
        service_gst: 18,
        is_online_payment_enabled: true,
        is_cod_enabled: true
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/settings/');
                if (res.data) {
                    setSettings(prev => ({ ...prev, ...res.data }));
                }
            } catch (err) {
                console.error("Failed to fetch settings:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post('/settings/', settings);
            localStorage.setItem('admin_settings', JSON.stringify(settings));
            localStorage.setItem('appSettings', JSON.stringify(settings));
            showToast('Settings saved successfully!', 'success');
        } catch (err) {
            showToast('Failed to save settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <RefreshCw className="animate-spin text-secondary" size={32} />
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Store Identity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Globe size={20} /></div>
                    <h3 className="font-bold text-gray-800">Store Identity</h3>
                </div>
                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">Store Name</label>
                        <input 
                            name="store_name"
                            value={settings.store_name}
                            onChange={handleChange}
                            type="text" 
                            className="w-full p-3 bg-gray-50 border-0 rounded-xl focus:ring-2 ring-indigo-500/20 outline-none transition-all" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Default Currency</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <select 
                                name="currency"
                                value={settings.currency}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 ring-indigo-500/20 outline-none appearance-none"
                            >
                                <option>INR (₹)</option>
                                <option>USD ($)</option>
                                <option>EUR (€)</option>
                                <option>GBP (£)</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                            <MapPin size={16}/> Address
                        </label>
                        <textarea 
                            name="address"
                            value={settings.address}
                            onChange={handleChange}
                            rows={3}
                            className="w-full p-3 bg-gray-50 border-0 rounded-xl focus:ring-2 ring-indigo-500/20 outline-none resize-none transition-all" 
                        />
                    </div>
                </div>
            </div>

            {/* Tax & Payments */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Percent size={20} /></div>
                    <h3 className="font-bold text-gray-800">Financial Setup</h3>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 flex items-end gap-3 pb-2 border-b border-gray-50 mb-2">
                             <div className="flex-1">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Government GST Portal</p>
                                <p className="text-[10px] text-gray-500 italic">Open official portal to check latest tax segments daily.</p>
                             </div>
                             <a 
                                href="https://www.gst.gov.in/" 
                                target="_blank" 
                                rel="noreferrer"
                                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center gap-2"
                             >
                                <Globe size={14} /> Open gst.gov.in
                             </a>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product GST (%)</label>
                            <input 
                                name="gst_percentage"
                                value={settings.gst_percentage}
                                onChange={handleChange}
                                type="number" 
                                className="w-full p-3 bg-gray-50 border-0 rounded-xl focus:ring-2 ring-emerald-500/20 outline-none transition-all" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Service GST (%)</label>
                            <input 
                                name="service_gst"
                                value={settings.service_gst}
                                onChange={handleChange}
                                type="number" 
                                className="w-full p-3 bg-gray-50 border-0 rounded-xl focus:ring-2 ring-emerald-500/20 outline-none transition-all" 
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer group hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600"><ShieldCheck size={18} /></div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800">Online Payments</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Stripe / UPI Gateway</p>
                                </div>
                            </div>
                            <input 
                                type="checkbox"
                                name="is_online_payment_enabled"
                                checked={settings.is_online_payment_enabled}
                                onChange={handleChange}
                                className="w-6 h-6 rounded-lg border-2 border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                        </label>

                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer group hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-orange-600"><Phone size={18} /></div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800">Cash on Delivery</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Pay at door-step</p>
                                </div>
                            </div>
                            <input 
                                type="checkbox"
                                name="is_cod_enabled"
                                checked={settings.is_cod_enabled}
                                onChange={handleChange}
                                className="w-6 h-6 rounded-lg border-2 border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                            />
                        </label>
                    </div>
                </div>
            </div>

            {/* Support Channels */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2">
                <div className="bg-slate-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-pink-100 text-pink-600 rounded-lg"><Phone size={20} /></div>
                        <h3 className="font-bold text-gray-800">Support & Contact</h3>
                    </div>
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-secondary text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-600 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                    >
                        {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                        Save All Settings
                    </button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">WhatsApp Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                name="whatsapp"
                                value={settings.whatsapp}
                                onChange={handleChange}
                                type="text" 
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 ring-indigo-500/20 outline-none" 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">Support Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                name="email"
                                value={settings.email}
                                onChange={handleChange}
                                type="email" 
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 ring-indigo-500/20 outline-none" 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
