import React, { useEffect, useState, useRef } from 'react';
import {
    Activity, Box, ShoppingCart, Users, MessageCircle, Edit, Settings, Menu, X, LogOut, 
    BarChart2, Receipt, Wifi, WifiOff, UserCircle, RefreshCw, Truck, ChevronDown, 
    ShieldCheck, Key, User, Bell, Terminal, Palette, Database
} from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../../src/utils/api';
import { useAuth } from '../../src/context/AuthContext';

// Import Admin Sub-components
import AdminDashboard from '../../src/admin/AdminDashboard';
import AdminBusiness from '../../src/admin/AdminBusiness';
import AdminBilling from '../../src/admin/AdminBilling';
import AdminInventory from '../../src/admin/AdminInventory';
import AdminOrders from '../../src/admin/AdminOrders';
import AdminDelivery from '../../src/admin/AdminDelivery';
import AdminUsers from '../../src/admin/AdminUsers';
import AdminContent from '../../src/admin/AdminContent';
import AdminSettings from '../../src/admin/AdminSettings';
import AdminChat from '../../src/admin/AdminChat';

const AdminPanel = () => {
    const { user, logout } = useAuth();


    const navigate = useNavigate();
    const location = useLocation();

    // Derive active tab from URL: /admin/orders → 'orders'
    const pathSegment = location.pathname.split('/').filter(Boolean)[1];
    const validTabs = ['dashboard', 'business', 'billing', 'inventory', 'orders', 'delivery', 'users', 'chat', 'content', 'settings', 'console'];
    const activeTab = validTabs.includes(pathSegment) ? pathSegment : 'dashboard';

    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [adminOtp, setAdminOtp] = useState('0707');
    const [adminUsername, setAdminUsername] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [loginType, setLoginType] = useState('credentials'); // 'otp' or 'credentials'
    const [otpError, setOtpError] = useState('');
    const [loginError, setLoginError] = useState('');
    const dropdownRef = useRef(null);

    // ── Auto-refresh state ──
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(60); // seconds
    const [countdown, setCountdown] = useState(60);
    const [lastRefreshed, setLastRefreshed] = useState(null);
    const refreshTimerRef = useRef(null);
    const countdownRef = useRef(null);


    // ── Shared data state ──
    const [stats, setStats] = useState({ total_revenue: 0, active_orders: 0, customers_count: 0, products_count: 0 });
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);
    const [homeContent, setHomeContent] = useState({ banners: [], services: [], categories: [], trust_strip: [] });

    // ── Inventory modal state ──
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({ name: '', category: '', price: '', stock: '', description: '', image: '', status: 'active', tags: '' });

    // ── Content modal state ──
    const [showHomeModal, setShowHomeModal] = useState(false);
    const [editingHomeItem, setEditingHomeItem] = useState(null);
    const [homeItemForm, setHomeItemForm] = useState({});
    const [contentSubTab, setContentSubTab] = useState('banners');

    // ── Billing state ──
    const [billingItems, setBillingItems] = useState([]);
    const [billingCustomer, setBillingCustomer] = useState({ name: '', phone: '', email: '' });
    const [billingProductSearch, setBillingProductSearch] = useState('');
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [currentInvoice, setCurrentInvoice] = useState(null);

    useEffect(() => {
        const isAdmin = (user && (user.role === 'admin' || user.publicMetadata?.role === 'admin')) || localStorage.getItem('admin_session') === 'true';
        if (!isAdmin && pathSegment !== 'otp') navigate('/');
    }, [user, navigate, pathSegment]);

    useEffect(() => {
        const on = () => setIsOnline(true);
        const off = () => setIsOnline(false);
        window.addEventListener('online', on);
        window.addEventListener('offline', off);
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setProfileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => { 
            window.removeEventListener('online', on); 
            window.removeEventListener('offline', off);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => { 
        fetchData();
        setLastRefreshed(new Date());
        // Fetch current OTP from settings if it exists
        api.get('/settings/').then(res => {
            // Check multiple possible field names
            const otp = res.data?.admin_otp || res.data?.adminOtp || res.data?.otp;
            if (otp) setAdminOtp(String(otp));
        }).catch(() => {});
    }, [activeTab]);

    // ── Auto-refresh engine ──
    useEffect(() => {
        if (autoRefresh) {
            setCountdown(refreshInterval);
            refreshTimerRef.current = setInterval(() => {
                fetchData();
                setLastRefreshed(new Date());
                setCountdown(refreshInterval);
            }, refreshInterval * 1000);

            countdownRef.current = setInterval(() => {
                setCountdown(prev => (prev <= 1 ? refreshInterval : prev - 1));
            }, 1000);
        } else {
            clearInterval(refreshTimerRef.current);
            clearInterval(countdownRef.current);
        }
        return () => {
            clearInterval(refreshTimerRef.current);
            clearInterval(countdownRef.current);
        };
    }, [autoRefresh, refreshInterval, activeTab]);

    const generateNewOtp = async () => {
        const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
        try {
            await api.post('/settings/', { admin_otp: newOtp });
            setAdminOtp(newOtp);
        } catch (err) {
            console.error("Failed to sync OTP to DB");
        }
    };


    const fetchData = async () => {
        setLoading(true); setError('');
        try {
            if (activeTab === 'dashboard' || activeTab === 'inventory' || activeTab === 'billing') {
                const [statsRes, productsRes] = await Promise.all([
                    api.get('dashboard/stats/').catch(() => ({ data: { total_revenue: "5,00,000", active_orders: 45, customers_count: 120, products_count: 850 } })),
                    api.get('products/').catch(() => ({ data: [] }))
                ]);
                setStats(statsRes.data);
                setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
            }
            if (activeTab === 'orders' || activeTab === 'dashboard' || activeTab === 'delivery') {
                const ordersRes = await api.get('orders/').catch(() => ({ data: [] }));
                setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
            }
            if (activeTab === 'users') {
                const usersRes = await api.get('users/').catch(() => ({ data: [] }));
                setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
            }
            if (activeTab === 'chat') {
                const messagesRes = await api.get('messages/').catch(() => ({ data: [] }));
                const raw = Array.isArray(messagesRes.data) ? messagesRes.data : [];
                // Map fields for consistency: name -> sender_name, message -> message
                const mapped = raw.map(m => ({
                    ...m,
                    sender_name: m.sender_name || m.name || 'Anonymous',
                    message: m.message || m.text || ''
                }));
                setChatMessages(mapped);
            }

            if (activeTab === 'content') {
                const contentRes = await api.get('content/home/').catch(() => ({ data: { banners: [], services: [], trust_strip: [] } }));
                setHomeContent(contentRes.data);
            }
        } catch (err) {
            setError('Failed to load data. Backend may be offline.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-700',
            processing: 'bg-blue-100 text-blue-700',
            shipped: 'bg-purple-100 text-purple-700',
            completed: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700'
        };
        return styles[status] || styles.pending;
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await api.patch(`orders/${orderId}/`, { status: newStatus });
            const order = orders.find(o => o.order_id === orderId);
            if (order && order.user_email) {
                const statusMessages = {
                    processing: 'is being prepared for dispatch.',
                    shipped: 'is out for delivery!',
                    completed: 'has been delivered successfully!',
                    cancelled: 'has been cancelled.',
                    pending: 'is now in pending status.'
                };
                await api.post('notifications/', {
                    user_email: order.user_email,
                    title: `Order ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
                    message: `Order #${orderId.split('-').pop() || orderId} ${statusMessages[newStatus] || 'status updated.'}`,
                    type: newStatus
                }).catch(() => {});
            }
            setOrders(orders.map(o => o.order_id === orderId ? { ...o, status: newStatus } : o));
            setOrders(orders.map(o => o.order_id === orderId ? { ...o, status: newStatus } : o));
        } catch (err) {
            console.error('Failed to update order status');
        }
    };


    const openAddProduct = () => { setEditingProduct(null); setProductForm({ name: '', category: '', price: '', stock: '', description: '', image: '', status: 'active', tags: '' }); setShowProductModal(true); };
    const openEditProduct = (p) => { setEditingProduct(p); setProductForm({ name: p.name || '', category: p.category || '', price: p.price || '', stock: p.stock || '', description: p.description || '', image: p.image || '', status: p.status || 'active', tags: p.tags || '' }); setShowProductModal(true); };
    const saveProduct = async () => {
        try {
            const payload = { ...productForm, price: parseFloat(productForm.price), stock: parseInt(productForm.stock) };
            if (editingProduct) await api.put(`products/${editingProduct.id || editingProduct._id}/`, payload);
            else await api.post('products/', payload);
            setShowProductModal(false); 
            fetchData();
            showToast(`Product ${editingProduct ? 'updated' : 'added'} successfully`, 'success');
        } catch (err) { 
            showAlert('Failed to save product', 'error'); 
        }
    };
    const deleteProduct = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try { 
            await api.delete(`products/${id}/`); 
            setProducts(products.filter(p => (p.id || p._id) !== id)); 
        }
        catch { console.error('Failed to delete product'); }
    };


    const saveHomeContent = async (newContent) => {
        try { 
            const res = await api.post('content/home/', newContent); 
            setHomeContent(res.data); 
            return true; 
        }
        catch { console.error('Failed to save content'); return false; }
    };


    const openHomeItemEditor = (item, type) => {
        let index = -1;
        if (item) {
            if (type === 'banner') index = homeContent.banners.indexOf(item);
            else if (type === 'service') index = homeContent.services.indexOf(item);
            else if (type === 'category') index = homeContent.categories.indexOf(item);
        }
        setEditingHomeItem({ item, type, index });
        
        if (type === 'banner') {
            setHomeItemForm(item || { title: '', subtitle: '', img: '', description: '', btnText: 'Shop Now', btnLink: '/products' });
        } else if (type === 'service') {
            setHomeItemForm(item || { name: '', desc: '', icon: 'Sparkles', color: 'from-blue-500 to-blue-600', price: 'Free' });
        } else if (type === 'category') {
            setHomeItemForm(item || { name: '', img: '', count: '100+ Products' });
        }
        setShowHomeModal(true);
    };

    const handleSaveHomeItem = async () => {
        const { type, index } = editingHomeItem;
        const updated = { ...homeContent };
        if (!updated.banners) updated.banners = [];
        if (!updated.services) updated.services = [];
        if (!updated.categories) updated.categories = [];

        if (type === 'banner') { 
            if (index > -1) updated.banners[index] = homeItemForm; 
            else updated.banners.push({ ...homeItemForm, id: Date.now() }); 
        } else if (type === 'service') { 
            if (index > -1) updated.services[index] = homeItemForm; 
            else updated.services.push(homeItemForm); 
        } else if (type === 'category') {
            if (index > -1) updated.categories[index] = homeItemForm;
            else updated.categories.push(homeItemForm);
        }

        if (await saveHomeContent(updated)) setShowHomeModal(false);
    };

    const deleteHomeItem = async (type, index) => {
        if (!window.confirm('Delete this item?')) return;
        const updated = { ...homeContent };
        if (type === 'banner') updated.banners.splice(index, 1); 
        else if (type === 'service') updated.services.splice(index, 1);
        else if (type === 'category') updated.categories.splice(index, 1);
        saveHomeContent(updated);
    };

    const handleBillingPhoneChange = async (phone) => {
        setBillingCustomer(prev => ({ ...prev, phone }));
        if (phone.length === 10) {
            try {
                const res = await api.get(`customers/find/?phone=${phone}`);
                if (res.data) setBillingCustomer({ name: res.data.name, phone: res.data.phone, email: res.data.email || '' });
            } catch (err) { 
                console.log("New customer or search ignored"); 
            }
        }
    };


    const addToBill = (product) => {
        const existing = billingItems.find(i => (i.id || i._id) === (product.id || product._id));
        if (existing) setBillingItems(billingItems.map(i => (i.id || i._id) === existing.id ? { ...i, quantity: i.quantity + 1 } : i));
        else setBillingItems([...billingItems, { id: product.id || product._id, name: product.name, price: parseFloat(product.price), quantity: 1 }]);
    };
    const addServiceItem = (name) => {
        const id = `srv-${Date.now()}`;
        setBillingItems([...billingItems, { id, name, price: 10, quantity: 1 }]);
    };
    const removeFromBill = (id) => setBillingItems(billingItems.filter(i => i.id !== id));
    const updateBillQuantity = (id, qty) => { if (qty < 1) return; setBillingItems(billingItems.map(i => i.id === id ? { ...i, quantity: qty } : i)); };
    const updateItemPrice = (id, price) => setBillingItems(billingItems.map(i => i.id === id ? { ...i, price: parseFloat(price) || 0 } : i));
    const calculateBillTotal = () => billingItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const generateInvoice = async () => {
        if (!billingItems.length || !billingCustomer.name) {
            return console.error('Enter customer details and at least one item');
        }

        const adminSettings = JSON.parse(localStorage.getItem('admin_settings') || '{}');
        const subTotal = calculateBillTotal();
        const taxRate = adminSettings.gst_percentage || 18;
        const tax = subTotal * (taxRate / 100);
        const grandTotal = subTotal + tax;

        const invoiceData = {
            id: `INV-${Date.now().toString().slice(-6)}`,
            date: new Date().toLocaleDateString(),
            customer: billingCustomer,
            items: billingItems,
            total: subTotal,
            tax,
            grandTotal,
            settings: adminSettings
        };

        try {
            await api.post('orders/offline/', {
                customer_name: billingCustomer.name,
                customer_phone: billingCustomer.phone,
                customer_email: billingCustomer.email,
                items: billingItems.map(i => ({ product_id: i.id, product_name: i.name, quantity: i.quantity, price: i.price })),
                total_amount: grandTotal,
                payment_status: 'paid',
                status: 'completed'
            });
            setCurrentInvoice(invoiceData);
            setShowInvoiceModal(true);
            setBillingItems([]);
            setBillingCustomer({ name: '', phone: '', email: '' });
            fetchData();
        } catch (err) {

            console.error('Failed to save offline order');
        }
    };

    const printInvoice = () => { const c = document.getElementById('invoice-template').innerHTML, orig = document.body.innerHTML; document.body.innerHTML = c; window.print(); document.body.innerHTML = orig; window.location.reload(); };

    const handleLogout = async () => { localStorage.removeItem('admin_session'); await logout(); navigate('/'); };

    const handleOTPLogin = () => {
        const enteredOtp = otpCode.trim();
        const storedOtp = String(adminOtp).trim();
        if (enteredOtp === storedOtp) {
            localStorage.setItem('admin_session', 'true');
            setShowOTPModal(false);
            setOtpCode('');
            setOtpError('');
            navigate('/admin/dashboard');
        } else {
            setOtpError(`Invalid OTP. Hint: default is 0707`);
        }
    };

    const handleAdminLogin = async () => {
        setLoading(true);
        setLoginError('');
        try {
            const res = await api.post('/admin-login/', { 
                username: adminUsername, 
                password: adminPassword 
            });
            if (res.data.status === 'success') {
                localStorage.setItem('admin_session', 'true');
                navigate('/admin/dashboard');
            } else {
                setLoginError('Authentication rejected. Check credentials.');
            }
        } catch (err) {
            setLoginError(err.response?.data?.message || 'Login failed. Try username: admin / password: admin123');
        } finally {
            setLoading(false);
        }
    };


    const tabs = [
        { id: 'dashboard', label: 'Monitor', icon: Activity },
        { id: 'business', label: 'Analysis', icon: BarChart2 },
        { id: 'billing', label: 'Point of Sale', icon: Receipt },
        { id: 'inventory', label: 'Warehouse', icon: Box },
        { id: 'orders', label: 'Fulfillment', icon: ShoppingCart },
        { id: 'delivery', label: 'Logistics', icon: Truck },
        { id: 'users', label: 'Directory', icon: Users },
        { id: 'chat', label: 'Support', icon: MessageCircle },
        { id: 'content', label: 'Creative Studio', icon: Palette },
        { id: 'settings', label: 'Preferences', icon: Settings },
    ];

    if (!user && localStorage.getItem('admin_session') !== 'true') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="bg-slate-900 p-12 rounded-[2rem] border border-white/5 text-center max-w-sm w-full animate-fade-in shadow-2xl">
                    <div className="w-16 h-16 bg-slate-800 rounded-2xl mx-auto flex items-center justify-center mb-6">
                        <ShieldCheck size={32} className="text-indigo-500" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2 tracking-tight">System Portal</h2>
                    <p className="text-slate-500 text-xs mb-8 font-bold uppercase tracking-widest">Identification Required</p>
                    
                    {loginType === 'credentials' ? (
                        <div className="space-y-4 animate-fade-in">
                            <input 
                                type="text" 
                                placeholder="Username"
                                value={adminUsername}
                                onChange={(e) => setAdminUsername(e.target.value)}
                                className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-indigo-500 transition-all font-bold text-sm"
                                autoFocus
                            />
                            <input 
                                type="password" 
                                placeholder="Password"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                                className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-indigo-500 transition-all font-bold text-sm shadow-inner"
                            />
                            {loginError && (
                                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-rose-400 text-xs font-bold">
                                    {loginError}
                                </div>
                            )}
                            <button 
                                onClick={handleAdminLogin}
                                disabled={loading}
                                className="w-full py-4 bg-indigo-600 rounded-xl text-white font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 text-sm disabled:opacity-50"
                            >
                                {loading ? 'Authenticating...' : 'Authorize Login'}
                            </button>
                            <button 
                                onClick={() => { setLoginType('otp'); setLoginError(''); }}
                                className="w-full py-2 text-slate-500 hover:text-white transition-all text-xs font-bold"
                            >
                                Switch to Emergency OTP
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-fade-in">
                            <button 
                                onClick={() => setShowOTPModal(true)}
                                className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-white font-black hover:bg-white/10 transition-all text-sm mb-2"
                            >
                                Emergency OTP Access
                            </button>
                            <button 
                                onClick={() => { setLoginType('credentials'); setOtpError(''); }}
                                className="w-full py-4 bg-slate-800 rounded-xl text-slate-300 font-bold hover:bg-slate-700 transition-all text-sm"
                            >
                                Admin Credentials Login
                            </button>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-white/5">
                        <button 
                            onClick={() => navigate('/')}
                            className="text-slate-500 hover:text-white transition-all text-sm font-bold flex items-center justify-center gap-2 mx-auto"
                        >
                            <RefreshCw size={14} /> Return to Storefront
                        </button>
                    </div>
                </div>


                {/* OTP Modal */}
                {showOTPModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl">
                        <div className="bg-slate-900 border border-white/10 p-10 rounded-[2.5rem] w-full max-w-sm">
                            <h3 className="text-2xl font-black text-white mb-2">Emergency OTP</h3>
                            <p className="text-slate-400 text-xs mb-8 uppercase tracking-widest font-bold">Enter your 4-digit security key</p>
                            <input 
                                type="text"
                                inputMode="numeric"
                                maxLength={4}
                                placeholder="0 0 0 0"
                                value={otpCode}
                                onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, '')); setOtpError(''); }}
                                onKeyDown={(e) => e.key === 'Enter' && handleOTPLogin()}
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white text-center text-3xl font-black tracking-[0.6em] mb-3 focus:border-indigo-500 outline-none transition-all"
                                autoFocus
                            />
                            {otpError && (
                                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 mb-4 text-rose-400 text-xs font-bold text-center">
                                    ❌ {otpError}
                                </div>
                            )}
                            <div className="flex gap-4 mt-2">
                                <button onClick={() => { setShowOTPModal(false); setOtpError(''); setOtpCode(''); }} className="flex-1 py-4 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 transition-all">Cancel</button>
                                <button onClick={handleOTPLogin} className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all">Verify</button>
                            </div>
                            <p className="text-center text-slate-600 text-[10px] font-bold mt-4 uppercase tracking-widest">Default OTP: 0707</p>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex font-plus-jakarta">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 text-slate-600 flex flex-col fixed h-screen transition-all duration-300 ease-in-out z-[60] overflow-hidden`}>
                <div className={`p-6 border-b border-slate-100 flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                            <Box size={20} className="text-white" />
                        </div>
                        {sidebarOpen && (
                            <div className="animate-fade-in whitespace-nowrap">
                                <h1 className="text-sm font-bold text-slate-900 leading-none">SJG Admin</h1>
                                <p className="text-xs text-slate-400 mt-1">Management Panel</p>
                            </div>
                        )}
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                    {tabs.map(tab => (
                        <Link 
                            key={tab.id} 
                            to={`/admin/${tab.id}`} 
                            title={!sidebarOpen ? tab.label : ''}
                            className={`group w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === tab.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                            <tab.icon size={20} className={`shrink-0 ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} /> 
                            {sidebarOpen && <span className="animate-fade-in">{tab.label}</span>}
                        </Link>
                    ))}
                    
                    <div className="pt-4 mt-4 border-t border-slate-100">
                        <Link to="/admin/console" title={!sidebarOpen ? "Console" : ''} className={`group w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'console' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}>
                            <Terminal size={20} className="shrink-0" /> 
                            {sidebarOpen && <span className="animate-fade-in">Developer Console</span>}
                        </Link>
                        <a href="http://localhost:8000/admin/" target="_blank" rel="noopener noreferrer" title={!sidebarOpen ? "Django Admin" : ''} className="group w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition-all mt-1">
                            <ShieldCheck size={20} className="shrink-0" />
                            {sidebarOpen && <span className="animate-fade-in">System Database</span>}
                        </a>
                    </div>
                </nav>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <button 
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all ${!sidebarOpen && 'justify-center'}`}
                        title={!sidebarOpen ? "Logout" : ''}
                    >
                        <LogOut size={20} className="shrink-0" />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>


            {/* Main Content */}
            <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} min-h-screen transition-all duration-300 ease-in-out`}>
                <header className="sticky top-0 z-50 px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setSidebarOpen(!sidebarOpen)} 
                            className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all border border-slate-200"
                        >
                            <Menu size={20} />
                        </button>
                        <div>
                            <h2 className="text-base font-bold text-slate-900 capitalize">{activeTab}</h2>
                            <p className="text-xs text-slate-400">Admin Panel</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Status + refresh */}
                        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
                            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-400'}`}></div>
                            <span>{isOnline ? 'Online' : 'Offline'}</span>
                            {autoRefresh && (
                                <span className="text-slate-300">·</span>
                            )}
                            {autoRefresh && (
                                <span>Refresh in {countdown}s</span>
                            )}
                        </div>

                        <button
                            onClick={() => setAutoRefresh(v => !v)}
                            className={`hidden md:flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                                autoRefresh
                                    ? 'border-indigo-200 bg-indigo-50 text-indigo-600'
                                    : 'border-slate-200 bg-white text-slate-500'
                            }`}
                        >
                            <RefreshCw size={12} className={autoRefresh ? 'animate-spin [animation-duration:3s]' : ''} />
                            {autoRefresh ? 'Auto' : 'Paused'}
                        </button>

                        <select
                            value={refreshInterval}
                            onChange={e => { setRefreshInterval(Number(e.target.value)); setCountdown(Number(e.target.value)); }}
                            className="hidden md:block text-xs text-slate-500 bg-white border border-slate-200 rounded-lg px-2 py-1.5 outline-none cursor-pointer"
                        >
                            <option value={30}>30s</option>
                            <option value={60}>1 min</option>
                            <option value={120}>2 min</option>
                            <option value={300}>5 min</option>
                        </select>

                        <button
                            onClick={() => { fetchData(); setLastRefreshed(new Date()); setCountdown(refreshInterval); }}
                            title="Refresh now"
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        </button>

                        {/* Profile Section */}
                        <div className="relative" ref={dropdownRef}>
                            <button 
                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                className="flex items-center gap-2 p-1.5 pr-3 hover:bg-slate-50 rounded-full border border-transparent hover:border-slate-100 transition-all"
                            >
                                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
                                    {user?.photoURL ? (
                                        <img src={user.photoURL} alt="P" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={16} className="text-slate-500 mt-1.5 mx-auto" />
                                    )}
                                </div>
                                <div className="text-left hidden sm:block">
                                    <p className="text-xs font-bold text-slate-700 leading-none">{user?.fullName || 'Admin'}</p>
                                </div>
                                <ChevronDown size={14} className={`text-slate-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {profileDropdownOpen && (
                                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-[100] animate-fade-in">
                                    <div className="px-4 py-3 border-b border-slate-50 mb-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Connected User</p>
                                        <p className="text-xs font-bold text-slate-700 truncate">{user?.email || 'admin@sjg.com'}</p>
                                    </div>
                                    <button onClick={() => navigate('/admin/settings')} className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-all text-xs font-bold">
                                        <Settings size={16} className="text-slate-400" /> Account Settings
                                    </button>
                                    <button onClick={() => setShowOTPModal(true)} className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-all text-xs font-bold">
                                        <Key size={16} className="text-slate-400" /> Emergency Login
                                    </button>
                                    <div className="mt-1 pt-1 border-t border-slate-50">
                                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-rose-500 hover:bg-rose-50 transition-all text-xs font-bold">
                                            <LogOut size={16} /> Logout Systems
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>


                <div className="px-10 py-10">
                    {error && (
                        <div className="mb-10 p-6 bg-rose-50 border border-rose-100 rounded-[2rem] flex items-center gap-4 text-rose-600 animate-fade-in">
                            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center"><X size={24} /></div>
                            <div>
                                <h4 className="font-black text-lg">System Signal Error</h4>
                                <p className="text-sm font-bold opacity-80">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Content Views */}
                    <div className="animate-fade-in-up">
                        {activeTab === 'dashboard' && <AdminDashboard stats={stats} orders={orders} getStatusBadge={getStatusBadge} />}
                        {activeTab === 'business' && <AdminBusiness />}
                        {activeTab === 'billing' && (
                            <AdminBilling
                                products={products} billingItems={billingItems} billingCustomer={billingCustomer} setBillingCustomer={setBillingCustomer}
                                handleBillingPhoneChange={handleBillingPhoneChange}
                                billingProductSearch={billingProductSearch} setBillingProductSearch={setBillingProductSearch}
                                addToBill={addToBill} addServiceItem={addServiceItem} removeFromBill={removeFromBill} 
                                updateBillQuantity={updateBillQuantity} updateItemPrice={updateItemPrice} calculateBillTotal={calculateBillTotal}
                                generateInvoice={generateInvoice} showInvoiceModal={showInvoiceModal} setShowInvoiceModal={setShowInvoiceModal}
                                currentInvoice={currentInvoice} printInvoice={printInvoice}
                            />
                        )}
                        {activeTab === 'inventory' && (
                            <AdminInventory
                                products={products} openAddProduct={openAddProduct} openEditProduct={openEditProduct} deleteProduct={deleteProduct}
                                showProductModal={showProductModal} setShowProductModal={setShowProductModal} editingProduct={editingProduct} 
                                productForm={productForm} setProductForm={setProductForm} saveProduct={saveProduct}
                            />
                        )}
                        {activeTab === 'orders' && <AdminOrders orders={orders} getStatusBadge={getStatusBadge} updateOrderStatus={updateOrderStatus} />}
                        {activeTab === 'delivery' && <AdminDelivery orders={orders} fetchData={fetchData} />}
                        {activeTab === 'users' && <AdminUsers users={users} />}
                        {activeTab === 'content' && (
                            <AdminContent
                                homeContent={homeContent} contentSubTab={contentSubTab} setContentSubTab={setContentSubTab}
                                openHomeItemEditor={openHomeItemEditor} deleteHomeItem={deleteHomeItem}
                                showHomeModal={showHomeModal} setShowHomeModal={setShowHomeModal} editingHomeItem={editingHomeItem}
                                homeItemForm={homeItemForm} setHomeItemForm={setHomeItemForm} handleSaveHomeItem={handleSaveHomeItem}
                            />
                        )}
                        {activeTab === 'chat' && <AdminChat messages={chatMessages} />}
                        {activeTab === 'settings' && <AdminSettings />}
                        
                        {activeTab === 'console' && (
                            <div className="bg-white rounded-[2.5rem] p-12 border border-slate-200">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <Terminal size={48} className="text-slate-400 mb-6" />
                                        <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter">Advanced Control Console</h3>
                                        <p className="text-slate-500 max-w-lg font-medium leading-relaxed">
                                            Direct kernel access for system-level modifications and security overrides.
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Master Override OTP</p>
                                        <div className="text-4xl font-black text-indigo-600 tracking-[0.2em] mb-4">{adminOtp}</div>
                                        <button 
                                            onClick={generateNewOtp}
                                            className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-900 transition-all"
                                        >
                                            Regenerate
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="mt-8 bg-slate-900 rounded-2xl p-8 font-mono text-sm text-indigo-400 border border-slate-700 shadow-xl">
                                    <p className="opacity-40 mb-2"># SJG Systems Shell v2.5.0</p>
                                    <p>$ initializing session...</p>
                                    <p className="text-emerald-400">$ secure_tunnel established [TLS 1.3]</p>
                                    <p>$ admin@sjg-systems: ready_</p>
                                </div>
                            </div>
                        )}


                    </div>
                </div>

                {/* OTP Login Modal */}
                {showOTPModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl animate-fade-in">
                        <div className="bg-slate-900 border border-white/10 p-12 rounded-[3.5rem] w-full max-w-md shadow-2xl">
                            <div className="w-20 h-20 bg-emerald-500 rounded-3xl mb-8 flex items-center justify-center shadow-emerald-500/20 shadow-2xl">
                                <Key size={36} className="text-white" />
                            </div>
                            <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Access Override</h3>
                            <p className="text-slate-400 text-xs mb-10 uppercase tracking-[0.3em] font-black">OTP Protocol 24-Secure-A</p>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Temporary Access Key</label>
                                    <input 
                                        type="password" 
                                        placeholder="••••"
                                        maxLength={4}
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value)}
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl p-6 text-white text-center text-4xl font-black tracking-[1em] focus:border-emerald-500 outline-none transition-all shadow-inner"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button onClick={() => setShowOTPModal(false)} className="flex-1 py-5 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all">Cancel</button>
                                    <button onClick={handleOTPLogin} className="flex-1 py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 transition-all">Verify Key</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPanel;
