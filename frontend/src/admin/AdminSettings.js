import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import api from '../utils/api';
import { useNotifications } from '../context/NotificationContext';

const AdminSettings = () => {
    const { showToast } = useNotifications();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        storeName: "SJG Stationery",
        currency: "INR (₹)",
        whatsapp: "+91 93600 24821",
        address: "Sakthi Nagar, Thindal, Erode - 638 012",
        adminPassword: ""
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                const { data } = await api.get('/settings/');
                if (data) {
                    setSettings({
                        storeName: data.brand_name || "SJG Stationery",
                        currency: data.currency || "INR (₹)",
                        whatsapp: data.whatsapp || "+91 93600 24821",
                        address: data.address || "Sakthi Nagar, Thindal, Erode - 638 012",
                        adminPassword: ""
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
                brand_name: settings.storeName,
                currency: settings.currency,
                whatsapp: settings.whatsapp,
                address: settings.address,
                ...(settings.adminPassword && { password: settings.adminPassword })
            });
            showToast("Settings updated successfully", "success");
            setSettings(prev => ({ ...prev, adminPassword: "" }));
        } catch (err) {
            showToast("Failed to update settings", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <Loader2 className="animate-spin text-secondary" size={32} />
        </div>
    );

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in">
            <h3 className="text-lg font-bold mb-6">Store Settings</h3>
            <div className="space-y-6 max-w-2xl">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                    <input 
                        type="text" 
                        value={settings.storeName} 
                        onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                        className="w-full p-3 border rounded-lg focus:ring-2 ring-secondary/20 outline-none" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select 
                        value={settings.currency}
                        onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                        className="w-full p-3 border rounded-lg focus:ring-2 ring-secondary/20 outline-none"
                    >
                        <option>INR (₹)</option>
                        <option>USD ($)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                    <input 
                        type="text" 
                        value={settings.whatsapp} 
                        onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                        className="w-full p-3 border rounded-lg focus:ring-2 ring-secondary/20 outline-none" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Address</label>
                    <textarea 
                        value={settings.address} 
                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                        className="w-full p-3 border rounded-lg focus:ring-2 ring-secondary/20 outline-none resize-none" 
                        rows={3} 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Password</label>
                    <input 
                        type="password" 
                        value={settings.adminPassword}
                        onChange={(e) => setSettings({ ...settings, adminPassword: e.target.value })}
                        placeholder="Change admin password…" 
                        className="w-full p-3 border rounded-lg focus:ring-2 ring-secondary/20 outline-none" 
                    />
                    <p className="text-xs text-gray-400 mt-1">Leave blank to keep current password.</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-secondary text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-600 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
};

export default AdminSettings;
