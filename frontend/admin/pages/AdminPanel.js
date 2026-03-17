import React, { useEffect, useState } from 'react';
import {
    Activity, Box, ShoppingCart, Users, MessageCircle, Edit, Settings, Menu, X, LogOut, 
    BarChart2, Receipt, Wifi, WifiOff, UserCircle, RefreshCw, Truck, LayoutDashboard, Database, Zap
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
    const validTabs = ['dashboard', 'business', 'billing', 'inventory', 'orders', 'delivery', 'users', 'chat', 'content', 'settings'];
    const activeTab = validTabs.includes(pathSegment) ? pathSegment : 'dashboard';

    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // ── Shared data state ──
    const [stats, setStats] = useState({ total_revenue: 0, active_orders: 0, customers_count: 0, products_count: 0 });
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);
    const [homeContent, setHomeContent] = useState({ banners: [], services: [], trust_strip: [] });

    // ── Billing State ──
    const [billingItems, setBillingItems] = useState([]);
    const [billingCustomer, setBillingCustomer] = useState({ name: '', phone: '', email: '' });
    const [billingProductSearch, setBillingProductSearch] = useState('');
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [currentInvoice, setCurrentInvoice] = useState(null);

    // ── Inventory State ──
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({ name: '', price: '', category: '', stock: '', description: '', image: '', tax_rate: 18, delivery_days: 0 });

    useEffect(() => {
        const isAdmin = (user && (user.role === 'admin' || user.publicMetadata?.role === 'admin')) || localStorage.getItem('admin_session') === 'true';
        if (!isAdmin) navigate('/');
    }, [user, navigate]);

    useEffect(() => {
        const on = () => setIsOnline(true);
        const off = () => setIsOnline(false);
        window.addEventListener('online', on);
        window.addEventListener('offline', off);
        return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
    }, []);

    useEffect(() => { fetchData(); }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'dashboard' || activeTab === 'inventory' || activeTab === 'billing') {
                const [statsRes, productsRes] = await Promise.all([
                    api.get('dashboard/stats/').catch(() => ({ data: { total_revenue: 500000, active_orders: 45, customers_count: 120, products_count: 850 } })),
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
                setUsersList(Array.isArray(usersRes.data) ? usersRes.data : []);
            }
            if (activeTab === 'chat') {
                const messagesRes = await api.get('messages/').catch(() => ({ data: [] }));
                setChatMessages(Array.isArray(messagesRes.data) ? messagesRes.data : []);
            }
            if (activeTab === 'content') {
                const contentRes = await api.get('content/home/').catch(() => ({ data: { banners: [], services: [], trust_strip: [] } }));
                setHomeContent(contentRes.data);
            }
        } catch (err) {
            console.error("Fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    // ── Billing Handlers ──
    const addToBill = (product) => {
        const exists = billingItems.find(i => (i.id || i._id) === (product.id || product._id));
        if (exists) {
            setBillingItems(billingItems.map(i => (i.id || i._id) === (product.id || product._id) ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
            setBillingItems([...billingItems, { ...product, id: product.id || product._id, quantity: 1, price: parseFloat(product.price) }]);
        }
    };

    const removeFromBill = (id) => setBillingItems(billingItems.filter(i => (i.id || i._id) !== id));
    
    const updateBillQuantity = (id, q) => {
        if (q < 1) return removeFromBill(id);
        setBillingItems(billingItems.map(i => (i.id || i._id) === id ? { ...i, quantity: q } : i));
    };

    const updateItemPrice = (id, p) => {
        setBillingItems(billingItems.map(i => (i.id || i._id) === id ? { ...i, price: parseFloat(p) || 0 } : i));
    };

    const calculateBillTotal = () => billingItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    const handleBillingPhoneChange = async (phone) => {
        setBillingCustomer(prev => ({ ...prev, phone }));
        if (phone.length === 10) {
            try {
                const res = await api.get(`customers/find/?phone=${phone}`);
                if (res.data) setBillingCustomer({ name: res.data.name, phone: res.data.phone, email: res.data.email || '' });
            } catch (err) { console.error("Customer search failed", err); }
        }
    };

    const generateInvoice = async () => {
        if (billingItems.length === 0) return alert('Add items first');
        const adminSettings = JSON.parse(localStorage.getItem('admin_settings') || '{}');
        const total = calculateBillTotal();
        const taxRate = adminSettings.gst_percentage || 18;
        const tax = total * (taxRate / 100);
        const grandTotal = total + tax;

        const invoiceData = {
            id: 'INV-' + Date.now().toString().slice(-6),
            date: new Date().toLocaleDateString(),
            customer: billingCustomer,
            items: billingItems,
            total,
            tax,
            grandTotal,
            settings: adminSettings
        };

        try {
            // Save to DB as an offline order
            await api.post('orders/offline/', {
                customer_name: billingCustomer.name,
                customer_phone: billingCustomer.phone,
                customer_email: billingCustomer.email,
                items: billingItems.map(i => ({ product_id: i.id || i._id, product_name: i.name, quantity: i.quantity, price: i.price })),
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
            alert('Failed to save offline order');
        }
    };

    const printInvoice = () => {
        const printContent = document.getElementById('invoice-template');
        const win = window.open('', '', 'width=900,height=900');
        win.document.write('<html><head><title>Print Invoice</title>');
        win.document.write('<script src="https://cdn.tailwindcss.com"></script>');
        win.document.write('</head><body>');
        win.document.write(printContent.innerHTML);
        win.document.write('</body></html>');
        setTimeout(() => {
            win.print();
            win.close();
        }, 1000);
    };

    // ── Inventory Handlers ──
    const openAddProduct = () => {
        setEditingProduct(null);
        setProductForm({ name: '', price: '', category: '', stock: '', description: '', image: '', tax_rate: 18, delivery_days: 0 });
        setShowProductModal(true);
    };

    const openEditProduct = (p) => {
        setEditingProduct(p);
        setProductForm({ ...p, id: p.id || p._id });
        setShowProductModal(true);
    };

    const deleteProduct = async (id) => {
        if (window.confirm('Delete this product?')) {
            try {
                await api.delete(`products/${id}/`);
                fetchData();
            } catch (err) { alert('Delete failed'); }
        }
    };

    const saveProduct = async () => {
        try {
            if (editingProduct) {
                await api.put(`products/${editingProduct.id || editingProduct._id}/`, productForm);
            } else {
                await api.post('products/', productForm);
            }
            setShowProductModal(false);
            fetchData();
        } catch (err) { alert('Save failed'); }
    };

    // ── Order Handlers ──
    const updateOrderStatus = async (id, status) => {
        try {
            await api.patch(`orders/${id}/`, { status });
            fetchData();
        } catch (err) { alert('Update failed'); }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-amber-100 text-amber-700',
            processing: 'bg-blue-100 text-blue-700',
            shipped: 'bg-indigo-100 text-indigo-700',
            completed: 'bg-emerald-100 text-emerald-700',
            cancelled: 'bg-rose-100 text-rose-700'
        };
        return styles[status] || 'bg-gray-100';
    };

    const navItems = [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'business', label: 'Business Insights', icon: BarChart2 },
        { id: 'billing', label: 'Offline Billing', icon: Receipt },
        { id: 'inventory', label: 'Catalogue', icon: Box },
        { id: 'orders', label: 'Pipeline', icon: ShoppingCart },
        { id: 'delivery', label: 'Logistics', icon: Truck },
        { id: 'users', label: 'Entities', icon: Users },
        { id: 'chat', label: 'Neural Chat', icon: MessageCircle },
        { id: 'content', label: 'Creative Hub', icon: Edit },
        { id: 'settings', label: 'Core Config', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-[#f1f5f9] dark:bg-[#020617] transition-all duration-500 flex font-sans">
            
            {/* Immersive Sidebar */}
            <aside className={`${sidebarOpen ? 'w-80' : 'w-24'} bg-white dark:bg-[#0f172a]/80 backdrop-blur-3xl border-r border-slate-200 dark:border-white/5 transition-all duration-500 ease-in-out flex flex-col z-50 h-screen sticky top-0`}>
                <div className="p-8 flex items-center justify-between overflow-hidden">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-indigo-600/20 shrink-0">
                            <Database size={24} className="text-white" />
                        </div>
                        {sidebarOpen && (
                            <div className="animate-fade-in whitespace-nowrap">
                                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">SJG <span className="text-indigo-600 italic">OPS</span></h1>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Command Center</p>
                            </div>
                        )}
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = activeTab === item.id;
                        return (
                            <Link
                                key={item.id}
                                to={`/admin/${item.id}`}
                                className={`flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-300 group relative ${
                                    active 
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold' 
                                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <Icon size={22} className={`${active ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                                {sidebarOpen && <span className="text-sm tracking-tight">{item.label}</span>}
                                {active && sidebarOpen && (
                                    <div className="absolute right-6 w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-slate-200 dark:border-white/5">
                    <button 
                        onClick={() => navigate('/')}
                        className="w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all font-bold"
                    >
                        <LogOut size={22} />
                        {sidebarOpen && <span className="text-sm">Exit Nexus</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Header */}
                <header className="h-24 bg-white/50 dark:bg-transparent backdrop-blur-md flex items-center justify-between px-10 border-b border-slate-200 dark:border-white/5 shrink-0">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-3 bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight capitalize">
                                {navItems.find(n => n.id === activeTab)?.label || 'Console'}
                            </h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {isOnline ? 'System Nominal' : 'Infrastructure Offline'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 px-5 py-2.5 bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                                <Zap size={16} className="text-indigo-600" />
                            </div>
                            <span className="text-sm font-bold text-slate-900 dark:text-white mono">45 ms</span>
                        </div>
                        
                        <div className="flex items-center gap-4 pl-6 border-l border-slate-200 dark:border-white/10">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-slate-900 dark:text-white">{user?.fullName || 'Root Admin'}</p>
                                <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">Superuser_01</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px]">
                                <img src={user?.imageUrl || "https://ui-avatars.com/api/?name=Admin&background=random"} className="w-full h-full rounded-2xl object-cover scale-[1.01]" />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-slate-50 dark:bg-[#020617]">
                    {loading && (
                        <div className="fixed top-0 left-0 w-full h-1 z-[100]">
                            <div className="h-full bg-indigo-600 animate-loading-bar shadow-[0_0_10px_#6366f1]"></div>
                        </div>
                    )}
                    
                    <div className="max-w-7xl mx-auto animate-fade-in-up">
                        {activeTab === 'dashboard' && <AdminDashboard stats={stats} orders={orders} />}
                        {activeTab === 'business' && <AdminBusiness />}
                        {activeTab === 'billing' && (
                            <AdminBilling 
                                products={products}
                                billingItems={billingItems}
                                billingCustomer={billingCustomer}
                                setBillingCustomer={setBillingCustomer}
                                handleBillingPhoneChange={handleBillingPhoneChange}
                                billingProductSearch={billingProductSearch}
                                setBillingProductSearch={setBillingProductSearch}
                                addToBill={addToBill}
                                removeFromBill={removeFromBill}
                                updateBillQuantity={updateBillQuantity}
                                updateItemPrice={updateItemPrice}
                                calculateBillTotal={calculateBillTotal}
                                generateInvoice={generateInvoice}
                                showInvoiceModal={showInvoiceModal}
                                setShowInvoiceModal={setShowInvoiceModal}
                                currentInvoice={currentInvoice}
                                printInvoice={printInvoice}
                            />
                        )}
                        {activeTab === 'inventory' && (
                            <AdminInventory 
                                products={products}
                                openAddProduct={openAddProduct}
                                openEditProduct={openEditProduct}
                                deleteProduct={deleteProduct}
                                showProductModal={showProductModal}
                                editingProduct={editingProduct}
                                productForm={productForm}
                                setProductForm={setProductForm}
                                saveProduct={saveProduct}
                                setShowProductModal={setShowProductModal}
                            />
                        )}
                        {activeTab === 'orders' && (
                            <AdminOrders 
                                orders={orders}
                                getStatusBadge={getStatusBadge}
                                updateOrderStatus={updateOrderStatus}
                            />
                        )}
                        {activeTab === 'delivery' && <AdminDelivery orders={orders} />}
                        {activeTab === 'users' && <AdminUsers users={usersList} />}
                        {activeTab === 'chat' && <AdminChat messages={chatMessages} />}
                        {activeTab === 'content' && <AdminContent content={homeContent} setContent={setHomeContent} />}
                        {activeTab === 'settings' && <AdminSettings />}
                    </div>
                </main>
            </div>

            <style>{`
                @keyframes loading-bar {
                    0% { width: 0%; transform: translateX(-100%); }
                    50% { width: 40%; }
                    100% { width: 100%; transform: translateX(100%); }
                }
                .animate-loading-bar {
                    animation: loading-bar 1.5s infinite linear;
                }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.2); border-radius: 10px; }
            `}</style>
        </div>
    );
};
export default AdminPanel;
