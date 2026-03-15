import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, Package, ShoppingCart, Users, Settings, 
    LogOut, Menu, X, Globe, MessageSquare, BarChart, ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
        { id: 'products', label: 'Products', icon: Package, path: '/admin/products' },
        { id: 'orders', label: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
        { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
        { id: 'analytics', label: 'Analytics', icon: BarChart, path: '/admin/analytics' },
        { id: 'content', label: 'Content Editor', icon: Globe, path: '/admin/content' },
        { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'} flex-shrink-0 bg-slate-900 text-white transition-all duration-300 shadow-2xl flex flex-col min-h-screen`}>
                <div className="h-full flex flex-col">
                    {/* Sidebar Header */}
                    <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                                <span className="text-white font-black text-xl">S</span>
                            </div>
                            <div>
                                <h1 className="font-black text-xl tracking-tighter">SJG <span className="text-secondary">ADMIN</span></h1>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Management</p>
                            </div>
                        </Link>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto scrollbar-hide">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path || (item.id === 'dashboard' && location.pathname === '/admin');
                            return (
                                <Link
                                    key={item.id}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                                        isActive 
                                        ? 'bg-secondary text-white shadow-lg shadow-secondary/20' 
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                                >
                                    <item.icon size={20} className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-secondary'} transition-colors`} />
                                    <span className="font-bold text-sm">{item.label}</span>
                                    {isActive && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Info & Logout */}
                    <div className="p-4 border-t border-slate-800">
                        <div className="bg-slate-800/50 rounded-2xl p-4 mb-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-white shadow-inner">
                                    {user?.email?.charAt(0).toUpperCase()}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-bold truncate">{user?.email}</p>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Administrator</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/10 text-red-400 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                            >
                                <LogOut size={14} /> Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40 backdrop-blur-md bg-white/80">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                            <Menu size={24} />
                        </button>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">
                            {menuItems.find(item => location.pathname === item.path)?.label || 'Admin Panel'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-3 md:gap-4">
                        <Link to="/" target="_blank" className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-gray-100 rounded-xl transition-all border border-transparent hover:border-gray-200">
                            <ExternalLink size={16} /> <span className="hidden sm:inline">View Site</span>
                        </Link>
                        <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
                             <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer hover:bg-slate-200 transition-colors relative">
                                <MessageSquare size={20} />
                                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
                             </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-slate-50">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
