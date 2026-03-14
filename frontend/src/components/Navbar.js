import React, { useState, useEffect, createContext, useContext } from 'react';
import { ShoppingBag, ShoppingCart, Search, Menu, X, LogIn, Home, Grid, ChevronDown, Settings, LogOut, ShieldCheck, Package, User, Heart, Clock, Bell, Fingerprint, Lock, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';


// Wishlist Context
const WishlistContext = createContext();

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        // Return default values if not wrapped in provider
        return { wishlist: [], addToWishlist: () => { }, removeFromWishlist: () => { }, isInWishlist: () => false };
    }
    return context;
};

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState(() => {
        const saved = localStorage.getItem('wishlist');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    const addToWishlist = (product) => {
        setWishlist(prev => {
            if (prev.find(p => p.id === product.id)) return prev;
            return [...prev, product];
        });
    };

    const removeFromWishlist = (productId) => {
        setWishlist(prev => prev.filter(p => p.id !== productId));
    };

    const isInWishlist = (productId) => {
        return wishlist.some(p => p.id === productId);
    };

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

const Navbar = () => {
    const { showToast, notifications } = useNotifications();
    const [notificationsDropdownOpen, setNotificationsDropdownOpen] = useState(false);

    const [wishlistCount, setWishlistCount] = useState(0);
    const [isCartBumping, setIsCartBumping] = useState(false);
    const [isWishlistBumping, setIsWishlistBumping] = useState(false);

    const updateWishlistCount = () => {
        try {
            const saved = localStorage.getItem('wishlist');
            if (saved) {
                const parsed = JSON.parse(saved);
                setWishlistCount(Array.isArray(parsed) ? parsed.length : 0);
            } else {
                setWishlistCount(0);
            }
        } catch (e) {
            console.error("Error parsing wishlist:", e);
            setWishlistCount(0);
        }
    };

    useEffect(() => {
        const handleWishlistUpdate = () => {
            updateWishlistCount();
            setIsWishlistBumping(true);
            setTimeout(() => setIsWishlistBumping(false), 400);
        };

        handleWishlistUpdate();
        window.addEventListener('storage', updateWishlistCount);
        window.addEventListener('wishlistUpdate', handleWishlistUpdate);
        return () => {
            window.removeEventListener('storage', updateWishlistCount);
            window.removeEventListener('wishlistUpdate', handleWishlistUpdate);
        };
    }, []);

    useEffect(() => {
        const handleCartUpdate = () => {
            setIsCartBumping(true);
            setTimeout(() => setIsCartBumping(false), 400); // Match animation duration
        };

        window.addEventListener('cartUpdate', handleCartUpdate);
        return () => window.removeEventListener('cartUpdate', handleCartUpdate);
    }, []);

    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.profile-dropdown')) {
                setProfileDropdownOpen(false);
            }
            if (!e.target.closest('.notifications-dropdown')) {
                setNotificationsDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/products?search=${searchTerm}`);
            setSearchTerm('');
        }
    };

    const handleLogout = async () => {
        await logout();
        setProfileDropdownOpen(false);
        navigate('/');
    };

    const handleAdminLogin = (e) => {
        e.preventDefault();
        setAdminError('');
        const ADMIN_EMAIL = 'admin@sjg.com';
        const ADMIN_PASSWORD = 'admin@123';
        if (adminCredentials.email === ADMIN_EMAIL && adminCredentials.password === ADMIN_PASSWORD) {
            // Set local admin session so AdminPanel guard lets us in
            localStorage.setItem('admin_session', 'true');
            setAdminModalOpen(false);
            setAdminCredentials({ email: '', password: '' });
            showToast('Admin logged in successfully', 'success');
            navigate('/admin');
        } else {
            setAdminError('Invalid admin credentials. Please try again.');
            showToast('Invalid admin credentials. Please try again.', 'error');
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getAvatarColor = (name) => {
        const colors = ['bg-gradient-to-br from-blue-500 to-blue-600', 'bg-gradient-to-br from-purple-500 to-purple-600', 'bg-gradient-to-br from-green-500 to-green-600', 'bg-gradient-to-br from-orange-500 to-orange-600', 'bg-gradient-to-br from-pink-500 to-pink-600', 'bg-gradient-to-br from-indigo-500 to-indigo-600'];
        const index = name ? name.charCodeAt(0) % colors.length : 0;
        return colors[index];
    };

    // Get greeting based on time of day
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            return { text: 'Good Morning', emoji: '☀️', color: 'text-orange-500' };
        } else if (hour >= 12 && hour < 17) {
            return { text: 'Good Afternoon', emoji: '🌤️', color: 'text-yellow-600' };
        } else if (hour >= 17 && hour < 21) {
            return { text: 'Good Evening', emoji: '🌅', color: 'text-purple-500' };
        } else {
            return { text: 'Good Night', emoji: '🌙', color: 'text-indigo-500' };
        }
    };

    const greeting = getGreeting();

    return (
        <>

            <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white shadow-sm'}`}>
                <div className="max-w-7xl mx-auto px-4 lg:px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Left: Logo + Nav */}
                        <div className="flex items-center gap-8">
                            <Link to="/" className="flex items-center gap-2 group">
                                <img src="/logo.png" alt="SJG" className="h-10 w-10 object-contain transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[360deg]" />
                                <span className="text-xl font-bold tracking-tight text-primary hidden sm:block">SJG<span className="text-secondary">.</span></span>
                            </Link>

                            <div className="hidden lg:flex items-center gap-6">
                                <Link to="/" className="text-gray-600 hover:text-secondary transition-colors font-medium text-sm flex items-center gap-1.5">
                                    <Home size={16} /> Home
                                </Link>
                                <Link to="/products" className="text-gray-600 hover:text-secondary transition-colors font-medium text-sm flex items-center gap-1.5">
                                    <Grid size={16} /> Shop
                                </Link>
                            </div>
                        </div>

                        {/* Center: Search */}
                        <div className="hidden md:block flex-1 max-w-xl px-8">
                            <form onSubmit={handleSearch} className="relative">
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-2.5 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 ring-secondary/30 transition-all"
                                />
                            </form>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-1 lg:gap-2">
                            {/* Wishlist */}
                            <Link to="/wishlist" className={`relative p-2.5 hover:bg-gray-100 rounded-full transition-all group hover-scale ${isWishlistBumping ? 'animate-wishlist-pulse' : ''}`}>
                                <Heart size={20} className={`text-gray-500 group-hover:text-red-500 transition-colors ${isWishlistBumping ? 'text-red-500 fill-red-500' : ''}`} />
                                {wishlistCount > 0 && (
                                    <span className={`absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] min-w-[16px] h-[16px] rounded-full flex items-center justify-center font-bold transition-transform duration-200 ${isWishlistBumping ? 'scale-125' : 'scale-100'}`}>
                                        {wishlistCount}
                                    </span>
                                )}
                            </Link>

                            {/* Cart */}
                            <Link to="/cart" className={`relative p-2.5 hover:bg-gray-100 rounded-full transition-all group hover-scale ${isCartBumping ? 'animate-cart-bump' : ''}`}>
                                {isCartBumping ? (
                                    <ShoppingCart size={20} className="text-secondary transition-colors" />
                                ) : (
                                    <ShoppingBag size={20} className="text-gray-500 group-hover:text-secondary transition-colors" />
                                )}
                                {cart.length > 0 && (
                                    <span className={`absolute -top-0.5 -right-0.5 bg-secondary text-white text-[10px] min-w-[16px] h-[16px] rounded-full flex items-center justify-center font-bold transition-transform duration-200 ${isCartBumping ? 'scale-125' : 'scale-100'}`}>
                                        {cart.length}
                                    </span>
                                )}
                            </Link>

                            {/* Notifications Bell */}
                            <div className="relative notifications-dropdown">
                                <button 
                                    onClick={() => setNotificationsDropdownOpen(!notificationsDropdownOpen)}
                                    className="relative p-2.5 hover:bg-gray-100 rounded-full transition-all group hover-scale"
                                >
                                    <Bell size={20} className={`text-gray-500 group-hover:text-primary transition-colors ${notifications.length > 0 ? 'animate-swing' : ''}`} />
                                    {notifications.length > 0 && (
                                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                                    )}
                                </button>

                                {notificationsDropdownOpen && (
                                    <div className="absolute right-0 top-full mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
                                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Alert Center</h3>
                                            <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">{notifications.length} New</span>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-8 text-center">
                                                    <Bell size={32} className="mx-auto text-gray-200 mb-2" />
                                                    <p className="text-xs text-gray-400 font-bold uppercase">All caught up!</p>
                                                </div>
                                            ) : (
                                                notifications.map(n => (
                                                    <div key={n.id} className="p-4 border-b border-gray-50 hover:bg-gray-50/80 transition-colors flex gap-3">
                                                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-bold text-gray-800 leading-tight">{n.message}</p>
                                                            <p className="text-[10px] text-gray-400 mt-1 font-medium italic">{new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
                                            <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors">Clear All History</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {user && (
                                <Link to="/orders" className="relative p-2.5 hover:bg-gray-100 rounded-full transition-all group hover-scale" title="My Orders">
                                    <Package size={20} className="text-gray-500 group-hover:text-secondary transition-colors" />
                                </Link>
                            )}

                            {/* User Profile */}
                            {user ? (
                                <div className="relative profile-dropdown flex items-center gap-2">
                                    {/* Avatar Button */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setProfileDropdownOpen(!profileDropdownOpen); }}
                                        className="flex items-center gap-1 group"
                                    >
                                        <div className="relative">
                                            {/* Outer Ring Animation */}
                                            <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-secondary via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm scale-110`}></div>
                                            {/* Avatar Container */}
                                            <div className={`relative w-9 h-9 rounded-full ${getAvatarColor(user.name)} flex items-center justify-center text-white font-bold text-sm ring-2 ring-white shadow-lg overflow-hidden`}>
                                                {user.photoURL ? (
                                                    <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="drop-shadow-sm">{getInitials(user.name)}</span>
                                                )}
                                            </div>
                                            {/* Online Indicator */}
                                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white"></span>
                                        </div>
                                        <ChevronDown size={14} className={`text-gray-400 hidden lg:block transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Greeting - After Avatar */}
                                    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-gray-50 to-white rounded-full border border-gray-100">
                                        <span className="text-base">{greeting.emoji}</span>
                                        <div>
                                            <p className={`text-[10px] font-bold ${greeting.color}`}>{greeting.text},</p>
                                            <p className="text-xs font-semibold text-gray-700">{user.name?.split(' ')[0] || 'User'}</p>
                                        </div>
                                    </div>

                                    {/* Sign Out Button */}
                                    <button
                                        onClick={handleLogout}
                                        className="hidden lg:flex items-center justify-center p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-full transition-all"
                                        title="Sign Out"
                                    >
                                        <LogOut size={16} />
                                    </button>

                                    {profileDropdownOpen && (
                                        <div className="absolute right-0 top-full mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
                                            {/* User Header */}
                                            <div className="p-4 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <div className={`w-14 h-14 rounded-xl ${getAvatarColor(user.name)} flex items-center justify-center text-white font-bold text-xl shadow-lg overflow-hidden`}>
                                                            {user.photoURL ? (
                                                                <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                getInitials(user.name)
                                                            )}
                                                        </div>
                                                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full ring-2 ring-slate-800 flex items-center justify-center">
                                                            <span className="w-2 h-2 bg-white rounded-full"></span>
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-lg truncate">{user.name}</p>
                                                        <p className="text-xs text-white/60 truncate">{user.email}</p>
                                                        {user.role === 'admin' && (
                                                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-secondary/80 rounded text-[10px] font-bold">
                                                                <ShieldCheck size={10} /> ADMIN
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="py-2">
                                                <Link to="/profile" onClick={() => setProfileDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors">
                                                    <User size={18} className="text-gray-400" />
                                                    <span className="font-medium">My Profile</span>
                                                </Link>
                                                <Link to="/orders" onClick={() => setProfileDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors">
                                                    <Package size={18} className="text-gray-400" />
                                                    <span className="font-medium">My Orders</span>
                                                </Link>
                                                <Link to="/wishlist" onClick={() => setProfileDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors">
                                                    <Heart size={18} className="text-gray-400" />
                                                    <span className="font-medium">Wishlist</span>
                                                    {wishlistCount > 0 && <span className="ml-auto bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold">{wishlistCount}</span>}
                                                </Link>
                                                <Link to="/settings" onClick={() => setProfileDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors">
                                                    <Settings size={18} className="text-gray-400" />
                                                    <span className="font-medium">Settings</span>
                                                </Link>

                                                {user.role === 'admin' && (
                                                    <>
                                                        <div className="border-t border-gray-100 my-1"></div>
                                                        <Link to="/admin" onClick={() => setProfileDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-secondary hover:bg-secondary/5 transition-colors">
                                                            <ShieldCheck size={18} />
                                                            <span className="font-medium">Admin Dashboard</span>
                                                        </Link>
                                                    </>
                                                )}

                                                <div className="border-t border-gray-100 my-1"></div>
                                                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 transition-colors">
                                                    <LogOut size={18} />
                                                    <span className="font-medium">Sign Out</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 ml-2">
                                    <button
                                        onClick={() => login()}
                                        className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary hover:shadow-lg text-white px-6 py-2 rounded-full text-sm font-bold transition-all transform hover:scale-105 active:scale-95 shadow-md"
                                    >
                                        <LogIn size={16} />
                                        <span className="hidden sm:inline">Sign In</span>
                                    </button>
                                    {/* Admin Login Button */}
                                    <button
                                        onClick={() => setAdminModalOpen(true)}
                                        className="flex items-center gap-2 bg-amber-50 border-2 border-amber-400 text-amber-700 hover:bg-amber-400 hover:text-white px-3 py-2 rounded-full text-sm font-bold transition-all shadow-sm hover:shadow-md group"
                                        title="Admin Login"
                                    >
                                        <ShieldCheck size={16} className="group-hover:scale-110 transition-transform" />
                                        <span className="hidden lg:inline">Admin</span>
                                    </button>
                                </div>
                            )}

                            <button className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full ml-1" onClick={() => setMobileMenuOpen(true)}>
                                <Menu size={22} />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Search */}
                    <div className="md:hidden pb-3">
                        <form onSubmit={handleSearch} className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-full text-sm outline-none"
                            />
                        </form>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)}>
                    <div className="absolute top-0 right-0 w-4/5 max-w-xs h-full bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 border-b">
                            <span className="text-lg font-bold text-primary">Menu</span>
                            <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X size={20} />
                            </button>
                        </div>

                        {user && (
                            <div className="p-4 bg-gray-50 border-b">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full ${getAvatarColor(user.name)} flex items-center justify-center text-white font-bold`}>
                                        {getInitials(user.name)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 text-sm">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="p-3 space-y-1">
                            <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 text-gray-700 text-sm" onClick={() => setMobileMenuOpen(false)}>
                                <Home size={18} className="text-gray-400" /> Home
                            </Link>
                            <Link to="/products" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 text-gray-700 text-sm" onClick={() => setMobileMenuOpen(false)}>
                                <Grid size={18} className="text-gray-400" /> Shop
                            </Link>
                            <Link to="/wishlist" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 text-gray-700 text-sm" onClick={() => setMobileMenuOpen(false)}>
                                <Heart size={18} className="text-gray-400" /> Wishlist
                            </Link>
                            <Link to="/cart" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 text-gray-700 text-sm" onClick={() => setMobileMenuOpen(false)}>
                                <ShoppingBag size={18} className="text-gray-400" /> Cart ({cart.length})
                            </Link>

                            {user && (
                                <>
                                    <div className="border-t my-2"></div>
                                    <Link to="/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 text-gray-700 text-sm" onClick={() => setMobileMenuOpen(false)}>
                                        <Package size={18} className="text-gray-400" /> My Orders
                                    </Link>
                                    <Link to="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 text-gray-700 text-sm" onClick={() => setMobileMenuOpen(false)}>
                                        <Settings size={18} className="text-gray-400" /> Settings
                                    </Link>
                                    {user.role === 'admin' && (
                                        <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/10 text-secondary text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                                            <ShieldCheck size={18} /> Admin
                                        </Link>
                                    )}
                                </>
                            )}

                            {!user && (
                                <div className="space-y-2 mt-3">
                                    <button onClick={() => { login(); setMobileMenuOpen(false); }} className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm hover:shadow-lg transition-all active:scale-95">
                                        <LogIn size={16} /> Sign In
                                    </button>
                                    <button onClick={() => { setAdminModalOpen(true); setMobileMenuOpen(false); }} className="w-full bg-amber-50 border border-amber-300 text-amber-700 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 text-sm hover:bg-amber-100 transition-colors">
                                        <ShieldCheck size={16} /> Admin Login
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="h-16 md:h-[72px]"></div>

            {/* ── Admin Login Modal ── */}
            {adminModalOpen && (
                <div
                    className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => { setAdminModalOpen(false); setAdminError(''); }}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                        onClick={e => e.stopPropagation()}
                        style={{ animation: 'fadeSlideUp 0.25s ease-out' }}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white text-center">
                            <div className="w-16 h-16 bg-amber-400/20 rounded-full flex items-center justify-center mx-auto mb-3 ring-2 ring-amber-400/40">
                                <ShieldCheck size={32} className="text-amber-400" />
                            </div>
                            <h2 className="text-xl font-bold">Admin Access</h2>
                            <p className="text-white/60 text-sm mt-1">Enter your admin credentials</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleAdminLogin} className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Admin Email</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        value={adminCredentials.email}
                                        onChange={e => setAdminCredentials(p => ({ ...p, email: e.target.value }))}
                                        placeholder="admin@sjg.com"
                                        className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Password</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type={showAdminPassword ? "text" : "password"}
                                        required
                                        value={adminCredentials.password}
                                        onChange={e => setAdminCredentials(p => ({ ...p, password: e.target.value }))}
                                        placeholder="••••••••"
                                        className="w-full pl-9 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => { setAdminModalOpen(false); setAdminError(''); setAdminCredentials({ email: '', password: '' }); }}
                                    className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl text-sm font-bold hover:from-slate-700 hover:to-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <KeyRound size={15} /> Enter Admin
                                </button>
                            </div>

                            <p className="text-center text-xs text-gray-400 pt-1">
                                Default: admin@sjg.com / admin@123
                            </p>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>

        </>
    );
};

export default Navbar;
