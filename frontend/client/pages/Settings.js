import React, { useState, useEffect } from 'react';
import { useAuth } from '../../src/context/AuthContext';
import { useNotifications } from '../../src/context/NotificationContext';
import { Settings as SettingsIcon, MapPinned, Bell, Mail, MessageSquare, Shield, LogOut, Save } from 'lucide-react';
import api from '../../src/utils/api';
import AccountLayout from '../../src/components/AccountLayout';

const Settings = () => {
    const { user, logout } = useAuth();
    const { showToast } = useNotifications();
    const [saving, setSaving] = useState(false);
    
    // App Settings
    const [appSettings, setAppSettings] = useState({
        locationAccess: false,
        notifications: true,
        emailUpdates: true,
        smsAlerts: false,
        darkMode: false
    });

    useEffect(() => {
        if (!user) return;
        
        const fetchSettings = async () => {
            try {
                const userEmail = user.emailAddresses ? user.emailAddresses[0].emailAddress : user.email;
                if (!userEmail) return;

                const res = await api.get(`/profile/${encodeURIComponent(userEmail)}/`);
                if (res.data.appSettings) {
                    setAppSettings(res.data.appSettings);
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            }
        };

        fetchSettings();
    }, [user]);

    const requestLocationAccess = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setAppSettings(prev => ({ ...prev, locationAccess: true }));
                    showToast(`Location access granted! Lat: ${position.coords.latitude.toFixed(4)}, Long: ${position.coords.longitude.toFixed(4)}`, 'success');
                },
                (error) => {
                    showToast("Location access denied. Please enable it in your browser settings.", 'error');
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            const userEmail = user.emailAddresses ? user.emailAddresses[0].emailAddress : user.email;
            await api.post(`/profile/${encodeURIComponent(userEmail)}/`, {
                appSettings: appSettings
            });
            showToast('Settings saved successfully!', 'success');
        } catch (error) {
            console.error("Error saving settings:", error);
            showToast('Failed to save settings. Please try again.', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (!user) return null;

    const firstName = user?.name?.split(' ')[0] || 'User';
    const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';

    return (
        <AccountLayout>
            <div className="max-w-4xl mx-auto space-y-8 pb-16">
                {/* Header */}
                <header className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Good Evening, {firstName} <span className="text-2xl">👋</span></h1>
                        <p className="mt-2 text-sm text-gray-500">Customize your application preferences</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow">
                            {initials}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">{user.name || user.email}</p>
                            <p className="text-xs text-gray-500">{user.emailAddresses?.[0]?.emailAddress || user.email}</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Settings Card */}
                    <section className="lg:col-span-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-secondary/10 text-secondary">
                                    <SettingsIcon size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">App Settings</h2>
                                    <p className="text-xs text-gray-500">Manage your preferences</p>
                                </div>
                            </div>
                            <button
                                onClick={handleSaveSettings}
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600 disabled:opacity-60"
                            >
                                <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {/** Setting Row Component **/}
                            {/** Location Access Row **/}
                            <ToggleRow
                                icon={<MapPinned size={18} />}
                                iconBg="bg-green-50 text-green-600 border border-green-100"
                                title="Location Access"
                                description="Allow the app to access your location"
                                checked={appSettings.locationAccess}
                                onChange={(checked) => {
                                    if (checked) {
                                        requestLocationAccess();
                                    } else {
                                        setAppSettings(prev => ({ ...prev, locationAccess: false }));
                                    }
                                }}
                            />

                            {/** Toggle rows **/}
                            <ToggleRow
                                icon={<Bell size={18} />}
                                iconBg="bg-blue-50 text-blue-600 border border-blue-100"
                                title="Push Notifications"
                                description="Receive order updates and offers"
                                checked={appSettings.notifications}
                                onChange={(checked) => setAppSettings(prev => ({ ...prev, notifications: checked }))}
                            />

                            <ToggleRow
                                icon={<Mail size={18} />}
                                iconBg="bg-orange-50 text-orange-600 border border-orange-100"
                                title="Email Updates"
                                description="Receive newsletters and promotions"
                                checked={appSettings.emailUpdates}
                                onChange={(checked) => setAppSettings(prev => ({ ...prev, emailUpdates: checked }))}
                            />

                            <ToggleRow
                                icon={<MessageSquare size={18} />}
                                iconBg="bg-teal-50 text-teal-600 border border-teal-100"
                                title="SMS Alerts"
                                description="Receive order updates via SMS"
                                checked={appSettings.smsAlerts}
                                onChange={(checked) => setAppSettings(prev => ({ ...prev, smsAlerts: checked }))}
                            />
                        </div>
                    </section>

                    {/* Account Panel */}
                    <aside className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-6 border-b border-gray-100 flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-gray-100 text-gray-700">
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Account</h3>
                                    <p className="text-xs text-gray-500">Manage your profile and security</p>
                                </div>
                            </div>

                            <div className="divide-y divide-gray-100">
                                <Row label="Account Type" value={user.publicMetadata?.role || 'Customer'} />
                                <Row label="Member Since" value={new Date(user.createdAt || Date.now()).getFullYear()} />
                                <Row label="Email" value={user.emailAddresses?.[0]?.emailAddress || user.email} />
                                <Row label="Name" value={user.name || '—'} />
                            </div>

                            <div className="p-6">
                                <button
                                    onClick={logout}
                                    className="w-full rounded-xl bg-red-50 text-red-600 font-semibold py-3 flex items-center justify-center gap-2 hover:bg-red-100 transition"
                                >
                                    <LogOut size={18} /> Sign Out of All Devices
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </AccountLayout>
    );
};

const ToggleRow = ({ icon, iconBg, title, description, checked, onChange }) => (
    <div className="px-6 py-5 flex items-center justify-between gap-4">
        <div className="flex items-start gap-4">
            <span className={`p-3 rounded-xl ${iconBg}`}>{icon}</span>
            <div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="text-xs text-gray-500">{description}</p>
            </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer-focus:ring-4 peer-focus:ring-secondary/30 peer peer-checked:bg-secondary transition"></div>
            <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition peer-checked:translate-x-5"></span>
        </label>
    </div>
);

const Row = ({ label, value }) => (
    <div className="px-6 py-4 flex items-center justify-between">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
);

export default Settings;
