import React, { useEffect, useState } from 'react';
import {
    AlertCircle, RefreshCw, Box, ShoppingCart, UserCircle, Edit, Wifi, WifiOff,
    Save, X, Plus, Trash2, Settings, Menu, LogOut, BarChart2, Receipt,
    Activity, Users, Copy, Printer, Layers, Globe
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';

// ── Separate admin tab components ──
import AdminDashboard from '../admin/AdminDashboard';
import AdminOrders from '../admin/AdminOrders';
import AdminInventory from '../admin/AdminInventory';
import AdminUsers from '../admin/AdminUsers';
import AdminSettings from '../admin/AdminSettings';
import AdminBusiness from '../admin/AdminBusiness';
import AdminContent from '../admin/AdminContent';
import AdminBilling from '../admin/AdminBilling';

const AdminPanel = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Derive active tab from URL: /admin/orders → 'orders'
    const pathSegment = location.pathname.split('/').filter(Boolean)[1];
    const validTabs = ['dashboard', 'business', 'billing', 'inventory', 'orders', 'users', 'content', 'settings'];
    const activeTab = validTabs.includes(pathSegment) ? pathSegment : 'dashboard';

    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // ── Shared data state ──
    const [stats, setStats] = useState({ total_revenue: 0, active_orders: 0, customers_count: 0, products_count: 0 });
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [homeContent, setHomeContent] = useState({ banners: [], services: [], trust_strip: [] });

    // ── Inventory modal state ──
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({ name: '', category: '', price: '', stock: '', description: '', image: '' });

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

    // ── Admin access check ──
    const isAdmin = (user && user.role === 'admin') || localStorage.getItem('admin_session') === 'true';

    useEffect(() => { if (!isAdmin) navigate('/'); }, [isAdmin, navigate]);

    // ── Online/Offline ──
    useEffect(() => {
        const on = () => setIsOnline(true);
        const off = () => setIsOnline(false);
        window.addEventListener('online', on);
        window.addEventListener('offline', off);
        return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
    }, []);

    // ── Fetch data when tab changes ──
    useEffect(() => { fetchData(); }, [activeTab]);

    const fetchData = async () => {
        setLoading(true); setError('');
        try {
            if (activeTab === 'dashboard' || activeTab === 'inventory') {
                const [statsRes, productsRes] = await Promise.all([
                    axios.get('/api/dashboard/stats/').catch(() => ({ data: { total_revenue: '5,00,000', active_orders: 45, customers_count: 120, products_count: 850 } })),
                    axios.get('/api/products/').catch(() => ({ data: [] }))
                ]);
                setStats(statsRes.data);
                setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
            }
            if (activeTab === 'orders' || activeTab === 'dashboard') {
                const res = await axios.get('/api/orders/').catch(() => ({ data: [] }));
                setOrders(Array.isArray(res.data) ? res.data : []);
            }
            if (activeTab === 'users') {
                const res = await axios.get('/api/users/').catch(() => ({ data: [] }));
                setUsers(Array.isArray(res.data) ? res.data : []);
            }
            if (activeTab === 'content') {
                const res = await axios.get('/api/content/home/').catch(() => ({ data: { banners: [], services: [], trust_strip: [] } }));
                setHomeContent(res.data);
            }
            if (activeTab === 'billing') {
                const res = await axios.get('/api/products/').catch(() => ({ data: [] }));
                setProducts(Array.isArray(res.data) ? res.data : []);
            }
        } catch (err) {
            setError('Failed to load data. Backend may be offline.');
        } finally {
            setLoading(false);
        }
    };

    // ── Shared helpers ──
    const getStatusBadge = (status) => {
        const s = { pending: 'bg-yellow-100 text-yellow-700', processing: 'bg-blue-100 text-blue-700', completed: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };
        return s[status] || s.pending;
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        // Optimistic UI update — show change immediately
        const previous = orders;
        setOrders(orders.map(o => o.order_id === orderId ? { ...o, status: newStatus } : o));
        try {
            await axios.patch(`/api/orders/${orderId}/`, { status: newStatus });
        } catch (err) {
            // Roll back on failure
            setOrders(previous);
            const msg = err.response?.data?.error || err.message || 'Unknown error';
            alert(`Failed to update order status:\n${msg}`);
            console.error('updateOrderStatus error:', err.response?.data || err);
        }
    };

    // ── Inventory helpers ──
    const openAddProduct = () => { setEditingProduct(null); setProductForm({ name: '', category: '', price: '', stock: '', description: '', image: '' }); setShowProductModal(true); };
    const openEditProduct = (p) => { setEditingProduct(p); setProductForm({ name: p.name || '', category: p.category || '', price: p.price || '', stock: p.stock || '', description: p.description || '', image: p.image || '' }); setShowProductModal(true); };
    const saveProduct = async () => {
        // ── Client-side validation ──
        if (!productForm.name?.trim()) { alert('Product name is required.'); return; }
        if (!productForm.price || isNaN(parseFloat(productForm.price))) { alert('A valid price is required.'); return; }

        // ── Only send fields the backend serializer expects ──
        const payload = {
            name: productForm.name.trim(),
            category: productForm.category || '',
            price: parseFloat(productForm.price),
            stock: parseInt(productForm.stock) || 0,
            description: productForm.description || '',
            image: productForm.image || '',
            status: productForm.status || 'active',
            tags: productForm.tags || '',
        };
        try {
            if (editingProduct) {
                await axios.put(`/api/products/${editingProduct.id || editingProduct._id}/`, payload);
            } else {
                await axios.post('/api/products/', payload);
            }
            setShowProductModal(false);
            fetchData();
        } catch (err) {
            const errData = err.response?.data;
            const msg = errData && typeof errData === 'object'
                ? Object.entries(errData).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n')
                : err.message;
            alert('Failed to save:\n' + msg);
        }
    };
    const deleteProduct = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try { await axios.delete(`/api/products/${id}/`); setProducts(products.filter(p => (p.id || p._id) !== id)); }
        catch { alert('Failed to delete product'); }
    };

    // ── Content helpers ──
    const saveHomeContent = async (newContent) => {
        try { const res = await axios.post('/api/content/home/', newContent); setHomeContent(res.data); return true; }
        catch { alert('Failed to save'); return false; }
    };
    const openHomeItemEditor = (item, type) => {
        setEditingHomeItem({ item, type, index: item ? (type === 'banner' ? homeContent.banners.indexOf(item) : homeContent.services.indexOf(item)) : -1 });
        setHomeItemForm(type === 'banner' ? (item || { title: '', subtitle: '', img: '', description: '', btnText: 'Shop Now', btnLink: '/products' }) : (item || { name: '', desc: '', icon: 'Sparkles', color: 'from-blue-500 to-blue-600', price: 'Free' }));
        setShowHomeModal(true);
    };
    const handleSaveHomeItem = async () => {
        const { type, index } = editingHomeItem;
        const updated = { ...homeContent };
        if (type === 'banner') { if (index > -1) updated.banners[index] = homeItemForm; else updated.banners.push({ ...homeItemForm, id: Date.now() }); }
        else { if (index > -1) updated.services[index] = homeItemForm; else updated.services.push(homeItemForm); }
        if (await saveHomeContent(updated)) setShowHomeModal(false);
    };
    const deleteHomeItem = async (type, index) => {
        if (!window.confirm('Delete?')) return;
        const updated = { ...homeContent };
        if (type === 'banner') updated.banners.splice(index, 1); else updated.services.splice(index, 1);
        saveHomeContent(updated);
    };

    // ── Billing helpers ──
    const addToBill = (product) => {
        const existing = billingItems.find(i => i.id === (product.id || product._id));
        if (existing) setBillingItems(billingItems.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i));
        else setBillingItems([...billingItems, { id: product.id || product._id, name: product.name, price: parseFloat(product.price), quantity: 1 }]);
    };
    const addServiceItem = (name) => addToBill({ id: `svc-${Date.now()}`, name, price: 0 });
    const removeFromBill = (id) => setBillingItems(billingItems.filter(i => i.id !== id));
    const updateBillQuantity = (id, qty) => { if (qty < 1) return; setBillingItems(billingItems.map(i => i.id === id ? { ...i, quantity: qty } : i)); };
    const updateItemPrice = (id, price) => setBillingItems(billingItems.map(i => i.id === id ? { ...i, price: parseFloat(price) || 0 } : i));
    const calculateBillTotal = () => billingItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const generateInvoice = () => {
        if (!billingItems.length) { alert('Add items to bill'); return; }
        if (!billingCustomer.name) { alert('Enter customer name'); return; }
        const subTotal = calculateBillTotal(), tax = subTotal * 0.18;
        setCurrentInvoice({ id: `INV-${Date.now().toString().slice(-6)}`, date: new Date().toLocaleDateString(), customer: billingCustomer, items: billingItems, total: subTotal, tax, grandTotal: subTotal + tax });
        setShowInvoiceModal(true);
    };
    const printInvoice = () => {
        const c = document.getElementById('invoice-template').innerHTML, orig = document.body.innerHTML;
        document.body.innerHTML = c; window.print(); document.body.innerHTML = orig; window.location.reload();
    };

    const handleLogout = async () => { localStorage.removeItem('admin_session'); await logout(); navigate('/'); };

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: Activity },
        { id: 'business', label: 'Business Analysis', icon: BarChart2 },
        { id: 'billing', label: 'Offline Billing', icon: Receipt },
        { id: 'inventory', label: 'Inventory', icon: Box },
        { id: 'orders', label: 'Orders', icon: ShoppingCart },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'content', label: 'Content', icon: Edit },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-gray-100 flex">

            {/* ── Sidebar ── */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-primary text-white flex flex-col fixed h-screen transition-all duration-300 overflow-hidden z-40`}>
                <div className="p-6 border-b border-white/10 flex justify-between items-center min-w-[256px]">
                    <div>
                        <h1 className="text-xl font-bold">SJG Admin</h1>
                        <p className="text-xs text-white/60 mt-1">Management Console</p>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><X size={18} /></button>
                </div>

                <nav className="flex-1 p-4 space-y-1 min-w-[256px]">
                    {tabs.map(tab => (
                        <Link
                            key={tab.id}
                            to={`/admin/${tab.id}`}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10 min-w-[256px]">
                    <div className={`flex items-center gap-2 text-xs ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                        {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
                        {isOnline ? 'System Online' : 'Offline Mode'}
                    </div>
                </div>

                {user ? (
                    <Link to="/profile" className="p-4 border-t border-white/10 flex items-center gap-3 hover:bg-white/10 transition-colors min-w-[256px]">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><UserCircle size={20} /></div>
                        <div><p className="text-sm font-medium">{user.name}</p><p className="text-xs text-white/60">View Profile</p></div>
                    </Link>
                ) : (
                    <div className="p-4 border-t border-white/10 flex items-center gap-3 min-w-[256px]">
                        <div className="w-10 h-10 bg-amber-400/20 rounded-full flex items-center justify-center ring-1 ring-amber-400/40"><UserCircle size={20} className="text-amber-400" /></div>
                        <div><p className="text-sm font-medium">Admin</p><p className="text-xs text-amber-400">Local Session</p></div>
                    </div>
                )}
            </aside>

            {/* ── Main Content ── */}
            <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-0'} p-8 transition-all duration-300`}>

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        {!sidebarOpen && (
                            <button onClick={() => setSidebarOpen(true)} className="p-2.5 bg-primary text-white rounded-lg shadow hover:bg-slate-800 transition-all">
                                <Menu size={20} />
                            </button>
                        )}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{tabs.find(t => t.id === activeTab)?.label || 'Dashboard'}</h2>
                            <p className="text-gray-500 text-sm">/admin/{activeTab}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={fetchData} className="p-2 bg-white rounded-full shadow hover:shadow-md transition-all" title="Refresh">
                            <RefreshCw size={18} className={loading ? 'animate-spin text-secondary' : 'text-gray-500'} />
                        </button>
                        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all font-medium">
                            <LogOut size={18} /> Sign Out
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
                        <AlertCircle size={18} /> {error}
                    </div>
                )}

                {/* ── Routed Tab Components ── */}
                {activeTab === 'dashboard' && <AdminDashboard stats={stats} orders={orders} getStatusBadge={getStatusBadge} />}
                {activeTab === 'business' && <AdminBusiness />}
                {activeTab === 'billing' && (
                    <AdminBilling
                        products={products}
                        billingItems={billingItems}
                        billingCustomer={billingCustomer}
                        setBillingCustomer={setBillingCustomer}
                        billingProductSearch={billingProductSearch}
                        setBillingProductSearch={setBillingProductSearch}
                        addToBill={addToBill}
                        addServiceItem={addServiceItem}
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
                        setShowProductModal={setShowProductModal}
                        editingProduct={editingProduct}
                        productForm={productForm}
                        setProductForm={setProductForm}
                        saveProduct={saveProduct}
                    />
                )}
                {activeTab === 'orders' && <AdminOrders orders={orders} getStatusBadge={getStatusBadge} updateOrderStatus={updateOrderStatus} />}
                {activeTab === 'users' && <AdminUsers users={users} />}
                {activeTab === 'content' && (
                    <AdminContent
                        homeContent={homeContent}
                        contentSubTab={contentSubTab}
                        setContentSubTab={setContentSubTab}
                        openHomeItemEditor={openHomeItemEditor}
                        deleteHomeItem={deleteHomeItem}
                        showHomeModal={showHomeModal}
                        setShowHomeModal={setShowHomeModal}
                        editingHomeItem={editingHomeItem}
                        homeItemForm={homeItemForm}
                        setHomeItemForm={setHomeItemForm}
                        handleSaveHomeItem={handleSaveHomeItem}
                    />
                )}
                {activeTab === 'settings' && <AdminSettings />}

            </main>

        </div>
    );
};

export default AdminPanel;
