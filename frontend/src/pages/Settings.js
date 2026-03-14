import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
    Settings as SettingsIcon, Moon, Bell, Shield, Globe, 
    Save, CheckCircle, ChevronRight, Layout, Smartphone, MapPin, Mail
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    
    const [appSettings, setAppSettings] = useState({
        location_access: false,
        notifications: true,
        email_updates: true,
        sms_alerts: false,
        dark_mode: false,
        floating_shortcut: false,
        overlay_mode: false,
        language: 'English'
    });

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }

        const fetchUserSettings = async () => {
            try {
                const res = await axios.get(`/api/user-settings/${encodeURIComponent(user.email)}/`);
                setAppSettings(res.data);
            } catch (error) {
                console.error("Error fetching user settings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserSettings();
    }, [user, navigate]);

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            await axios.post(`/api/user-settings/${encodeURIComponent(user.email)}/`, appSettings);
            
            // Apply dark mode immediately
            if (appSettings.dark_mode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error("Error saving settings:", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 pt-24 pb-12 px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-8 animate-fade-in">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <div className="p-2 bg-purple-100 text-purple-600 rounded-xl dark:bg-purple-900/30 dark:text-purple-400">
                                <SettingsIcon size={24} />
                             </div>
                             <nav className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <span>Home</span> <ChevronRight size={10} /> <span className="text-purple-500">App Settings</span>
                             </nav>
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">System Settings</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Personalize your application experience</p>
                    </div>

                    {saveSuccess && (
                        <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-xs font-bold animate-bounce flex items-center gap-2 border border-emerald-100">
                            <CheckCircle size={14} /> Preferences Saved
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
                    {/* Appearance */}
                    <Section title="Appearance" icon={<Layout size={18} />} color="text-blue-500" bgColor="bg-blue-50 dark:bg-blue-900/20">
                        <Toggle 
                            label="Dark Mode" 
                            description="Use a darker palette for night browsing"
                            icon={<Moon size={18} />}
                            checked={appSettings.dark_mode}
                            onChange={(checked) => setAppSettings({...appSettings, dark_mode: checked})}
                        />
                        <Toggle 
                            label="Floating Menu" 
                            description="Show quick access shortcut bubble"
                            icon={<Smartphone size={18} />}
                            checked={appSettings.floating_shortcut}
                            onChange={(checked) => setAppSettings({...appSettings, floating_shortcut: checked})}
                        /> section contains personal information for each user.
                    </Section>

                    {/* Notifications */}
                    <Section title="Notifications" icon={<Bell size={18} />} color="text-orange-500" bgColor="bg-orange-50 dark:bg-orange-900/20">
                        <Toggle 
                            label="Push Notifications" 
                            description="Get real-time order updates"
                            icon={<Bell size={18} />}
                            checked={appSettings.notifications}
                            onChange={(checked) => setAppSettings({...appSettings, notifications: checked})}
                        />
                        <Toggle 
                            label="Email Updates" 
                            description="Receive marketing and news emails"
                            icon={<Mail size={18} />}
                            checked={appSettings.email_updates}
                            onChange={(checked) => setAppSettings({...appSettings, email_updates: checked})}
                        />
                    </Section>

                    {/* Regional & Privacy */}
                    <Section title="Regional & Privacy" icon={<Globe size={18} />} color="text-emerald-500" bgColor="bg-emerald-50 dark:bg-emerald-900/20">
                         <Toggle 
                            label="Location Access" 
                            description="Provide faster delivery experience"
                            icon={<MapPin size={18} />}
                            checked={appSettings.location_access}
                            onChange={(checked) => setAppSettings({...appSettings, location_access: checked})}
                        />
                        <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">App Language</label>
                            <select 
                                value={appSettings.language}
                                onChange={(e) => setAppSettings({...appSettings, language: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 outline-none focus:ring-2 ring-primary/20"
                            >
                                <option value="English">🇺🇸 English (US)</option>
                                <option value="Tamil">🇮🇳 Tamil (தமிழ்)</option>
                                <option value="Hindi">🇮🇳 Hindi (हिन्दी)</option>
                                <option value="Spanish">🇪🇸 Spanish (Español)</option>
                            </select>
                        </div>
                    </Section>

                    {/* Security */}
                     <Section title="Security" icon={<Shield size={18} />} color="text-indigo-500" bgColor="bg-indigo-50 dark:bg-indigo-900/20">
                        <div className="flex items-center justify-between p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg text-indigo-500">
                                    <Shield size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-indigo-400 uppercase">Account Status</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">Professional Account</p>
                                </div>
                            </div>
                            <span className="bg-emerald-500/20 text-emerald-500 text-[10px] px-2 py-0.5 rounded font-black">ACTIVE</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 px-1">Your data is synchronized and encrypted across all devices.</p>
                    </Section>
                </div>

                {/* Sticky Save Bar */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 animate-fade-in-up">
                    <div className="bg-gray-900/90 dark:bg-white/90 backdrop-blur-xl rounded-2xl p-3 shadow-2x border border-white/10 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 pl-2">
                             <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                                <ShieldCheck size={18} />
                             </div>
                             <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Safe Sync</p>
                                <p className="text-xs font-bold text-white dark:text-gray-900">End-to-end encrypted</p>
                             </div>
                        </div>
                        <button 
                            onClick={handleSaveSettings}
                            disabled={saving}
                            className="bg-primary hover:bg-secondary text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Save size={16} />}
                            {saving ? 'Syncing...' : 'Apply Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Section = ({ title, icon, children, color, bgColor }) => (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:border-primary/10 transition-all duration-500">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-3">
             <div className={`p-2 rounded-xl ${bgColor} ${color}`}>{icon}</div>
             {title}
        </h3>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const Toggle = ({ label, description, icon, checked, onChange }) => (
    <div className="flex items-center justify-between group">
        <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-all`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{label}</p>
                <p className="text-[10px] text-gray-400 font-medium">{description}</p>
            </div>
        </div>
        <button 
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${checked ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);

const ShieldCheck = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
);

export default Settings;
