import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    User, Settings, Package, Heart, LogOut, ChevronRight, Menu, X, 
    Bell, Search, Home as HomeIcon, ShieldCheck, Activity, Sparkles,
    LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const UserDashboardLayout = ({ children, title, subtitle }) => {
    const { user, logout } = useAuth();
    const { notifications } = useNotifications();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [notifOpen, setNotifOpen] = useState(false);

    const menuItems = [
        { id: 'profile', label: 'Overview', icon: LayoutDashboard, path: '/profile' },
        { id: 'orders', label: 'Orders', icon: Package, path: '/orders' },
        { id: 'wishlist', label: 'My Vault', icon: Heart, path: '/wishlist' },
        { id: 'settings', label: 'Preferences', icon: Settings, path: '/settings' },
    ];

    const getAvatarColor = (name) => {
        const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-fuchsia-500', 'bg-rose-500', 'bg-emerald-500'];
        const index = name ? [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length : 0;
        return colors[index];
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f1a] flex flex-col lg:flex-row transition-colors duration-500 font-inter">
            
            {/* ── Background Glows ── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[0%] right-[-5%] w-[35%] h-[35%] bg-secondary/10 blur-[100px] rounded-full"></div>
            </div>

            {/* ── Sidebar ── */}
            <aside className={`${sidebarOpen ? 'w-full lg:w-80' : 'w-0 lg:w-24'} bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border-r border-slate-200/50 dark:border-slate-800/50 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] fixed lg:static inset-y-0 left-0 z-50 flex flex-col shadow-2xl lg:shadow-[20px_0_40px_-20px_rgba(0,0,0,0.05)] overflow-hidden`}>
                
                {/* Branding Section */}
                <div className="h-24 px-8 flex items-center justify-between shrink-0">
                    <Link to="/" className="flex items-center gap-4 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/40 blur-lg rounded-2xl group-hover:scale-150 transition-transform"></div>
                            <div className="relative w-12 h-12 bg-gradient-to-br from-primary to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:rotate-[10deg] transition-all">
                                <Sparkles size={24} className="animate-pulse" />
                            </div>
                        </div>
                        {sidebarOpen && (
                            <div className="animate-fade-in translate-y-[-1px]">
                                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">SJG<span className="text-primary truncate">SPACE</span></h1>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Control Center</p>
                            </div>
                        )}
                    </Link>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl">
                        <X size={20} />
                    </button>
                </div>

                {/* User Snapshot - Premium Card */}
                {sidebarOpen && (
                    <div className="px-6 mb-8 animate-fade-in">
                        <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-black rounded-[2rem] shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 blur-2xl rounded-full translate-x-12 translate-y-[-12px] group-hover:scale-150 transition-transform duration-1000"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-14 h-14 rounded-2xl ${getAvatarColor(user?.name)} flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-slate-800 transition-transform group-hover:scale-110`}>
                                        {user?.name ? user.name[0].toUpperCase() : 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-black truncate">{user?.name}</h3>
                                        <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest flex items-center gap-1">
                                            <ShieldCheck size={10} className="text-emerald-400" /> Member Pro
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                                    <div className="text-center">
                                        <p className="text-[10px] text-slate-500 font-black uppercase">Points</p>
                                        <p className="text-sm font-black text-white">4.2k</p>
                                    </div>
                                    <div className="h-6 w-[1px] bg-slate-700/50"></div>
                                    <div className="text-center">
                                        <p className="text-[10px] text-slate-500 font-black uppercase">Level</p>
                                        <p className="text-sm font-black text-white">12</p>
                                    </div>
                                    <div className="h-6 w-[1px] bg-slate-700/50"></div>
                                    <div className="text-center">
                                        <p className="text-[10px] text-slate-500 font-black uppercase">Badge</p>
                                        <p className="text-sm font-black text-amber-400">Elite</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Menu */}
                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.id}
                                to={item.path}
                                className={`flex items-center gap-5 px-6 py-4 rounded-3xl font-black text-[13px] uppercase tracking-wider transition-all relative group overflow-hidden ${
                                    isActive 
                                    ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                {/* Active Indicator Background */}
                                {isActive && (
                                    <div className="absolute left-0 top-0 w-1.5 h-full bg-white/40"></div>
                                )}
                                
                                <div className={`shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary'}`}>
                                    <item.icon size={20} strokeWidth={2.5} />
                                </div>
                                
                                {sidebarOpen ? (
                                    <span className="flex-1">{item.label}</span>
                                ) : (
                                    <div className="absolute left-full ml-4 px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none z-50 shadow-2xl">
                                        {item.label}
                                    </div>
                                )}
                                
                                {!isActive && sidebarOpen && (
                                    <ChevronRight size={14} className="opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Logout Button */}
                <div className="p-6 mt-auto">
                    <button 
                        onClick={handleLogout}
                        className={`w-full flex items-center justify-center gap-3 py-5 rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] transition-all bg-rose-50 dark:bg-rose-950/10 text-rose-500 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 shadow-sm active:scale-95 ${!sidebarOpen && 'px-0'}`}
                    >
                        <LogOut size={16} strokeWidth={3} />
                        {sidebarOpen && <span>Secure Sign Out</span>}
                    </button>
                    {sidebarOpen && (
                        <p className="text-center text-[9px] font-bold text-slate-400 uppercase mt-4 tracking-tighter">SJG Application v2.4.0-Beta</p>
                    )}
                </div>
            </aside>

            {/* ── Main Content Area ── */}
            <main className="flex-1 flex flex-col min-w-0 relative">
                
                {/* ── Dynamic Top Bar ── */}
                <header className="h-24 bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border-b border-slate-200/50 dark:border-slate-800/50 px-6 lg:px-12 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-8">
                        {!sidebarOpen && (
                            <button onClick={() => setSidebarOpen(true)} className="p-3 bg-white dark:bg-slate-800 text-slate-400 hover:text-primary rounded-2xl border border-slate-200/50 dark:border-slate-700 shadow-sm transition-all hidden lg:block hover:rotate-90">
                                <Menu size={20} />
                            </button>
                        )}
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-xl">
                            <Menu size={22} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Link to="/" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">Main Hub</Link>
                                <ChevronRight size={10} className="text-slate-300" />
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">{subtitle || title}</span>
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none drop-shadow-sm">{title}</h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 lg:gap-6">
                        {/* Shimmer Search */}
                        <div className="hidden xl:flex items-center gap-4 px-6 py-3 bg-slate-100 dark:bg-slate-800/50 rounded-[1.5rem] border border-transparent focus-within:border-primary/20 focus-within:bg-white dark:focus-within:bg-slate-950 transition-all group w-72">
                            <Search size={18} className="text-slate-400 group-focus-within:text-primary group-focus-within:rotate-90 transition-all" />
                            <input 
                                type="text" 
                                placeholder="Search everything..."
                                className="bg-transparent border-none outline-none text-[13px] font-bold text-slate-700 dark:text-slate-300 w-full placeholder:text-slate-400"
                            />
                        </div>

                        {/* Interactive Notifications */}
                        <div className="relative">
                            <button 
                                onClick={() => setNotifOpen(!notifOpen)}
                                className="w-14 h-14 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center rounded-2xl border border-slate-200/50 dark:border-slate-700 shadow-sm hover:shadow-xl hover:text-primary hover:border-primary/20 transition-all relative group active:scale-95"
                            >
                                <Bell size={24} className="group-hover:animate-bounce" />
                                {notifications.length > 0 && (
                                    <span className="absolute top-4 right-4 w-3 h-3 bg-rose-500 rounded-full border-2 border-white dark:border-slate-800 shadow-lg"></span>
                                )}
                            </button>

                            {notifOpen && (
                                <div className="absolute right-0 top-full mt-6 w-96 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-slate-800 overflow-hidden animate-dashboard-entry z-50">
                                    <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                                        <div>
                                            <p className="text-xl font-black text-slate-900 dark:text-white">Inbox</p>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Activity & Updates</p>
                                        </div>
                                        <span className="bg-primary text-white text-[10px] px-3 py-1.5 rounded-full font-black shadow-lg shadow-primary/20">{notifications.length} NEW</span>
                                    </div>
                                    <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                                        {notifications.length === 0 ? (
                                            <div className="p-20 text-center">
                                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                                                    <Activity size={32} />
                                                </div>
                                                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Zone is Quiet</p>
                                            </div>
                                        ) : (
                                            notifications.map(n => (
                                                <div key={n.id} className="p-6 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex gap-5 group/notif cursor-pointer">
                                                    <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm group-hover/notif:scale-110 transition-transform ${n.type === 'error' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                                        {n.type === 'error' ? <X size={20} /> : <CheckCircle size={20} />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200 leading-snug group-hover/notif:text-primary transition-colors">{n.message}</p>
                                                        <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest">{new Date(n.time).toLocaleTimeString()}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="p-6 text-center border-t border-slate-50 dark:border-slate-800">
                                        <button className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all shadow-xl shadow-slate-900/10 active:scale-95">Clear Dispatch Cache</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Admin Entry Portal */}
                        {user?.role === 'admin' && (
                            <Link to="/admin" className="hidden sm:flex items-center gap-3 px-6 py-3.5 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-[1.5rem] shadow-xl shadow-amber-500/20 text-[11px] font-black uppercase tracking-wider hover:translate-y-[-2px] hover:shadow-2xl transition-all active:scale-95 group">
                                <ShieldCheck size={18} className="group-hover:rotate-12 transition-transform" />
                                <span className="translate-y-[1px]">Legacy Admin</span>
                            </Link>
                        )}
                    </div>
                </header>

                {/* ── Dynamic Content Container ── */}
                <div className="flex-1 p-6 md:p-12 overflow-y-auto custom-scrollbar relative z-10 transition-all">
                    {/* Background Detail */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>
                    
                    <div className="max-w-7xl mx-auto animate-dashboard-entry">
                        {children}
                    </div>

                    {/* Dashboard Footer / Branding Soft */}
                    <div className="mt-24 pt-12 border-t border-slate-200/30 flex items-center justify-between opacity-50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SJG Workspace © 2026</p>
                        <div className="flex gap-4">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Operational</span>
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                
                .font-inter { font-family: 'Inter', sans-serif; }

                @keyframes dashboardEntry {
                    from { opacity: 0; transform: translateY(30px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-dashboard-entry {
                    animation: dashboardEntry 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #334155;
                }
                
                input:focus {
                    box-shadow: none !important;
                }
            `}</style>
        </div>
    );
};

const CheckCircle = ({ size, ...props }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
    >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

export default UserDashboardLayout;
