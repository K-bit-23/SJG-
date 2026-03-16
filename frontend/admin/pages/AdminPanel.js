import React, { useEffect, useState } from 'react';
import {
    Activity, Box, ShoppingCart, Users, MessageCircle, Edit, Settings, Menu, X, LogOut, 
    BarChart2, Receipt, Wifi, WifiOff, UserCircle, RefreshCw, Truck
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
    const [error, setError] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // ── Shared data state ──
    const [stats, setStats] = useState({ total_revenue: 0, active_orders: 0, customers_count: 0, products_count: 0 });
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);
    const [homeContent, setHomeContent] = useState({ banners: [], services: [], trust_strip: [] });

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
        const isAdmin = (user && user.role === 'admin') || localStorage.getItem('admin_session') === 'true';
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
                setChatMessages(Array.isArray(messagesRes.data) ? messagesRes.data : []);
            }
            if (activeTab === 'content') {
                const contentRes = await api.get('content/home/').catch(() => ({ data: { banners: [], services: [], trust_strip: [] } }));
                setHomeContent(contentRes.data);
            }
            // Always fetch settings for global use (GST, Currency)
            const settingsRes = await api.get('/settings/').catch(() => ({ data: {} }));
            if (settingsRes.data) {
                localStorage.setItem('admin_settings', JSON.stringify(settingsRes.data));
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
        } catch (err) {
            alert('Failed to update order status');
        }
    };

    const openAddProduct = () => { setEditingProduct(null); setProductForm({ name: '', category: '', price: '', stock: '', description: '', image: '', status: 'active', tags: '' }); setShowProductModal(true); };
    const openEditProduct = (p) => { setEditingProduct(p); setProductForm({ name: p.name || '', category: p.category || '', price: p.price || '', stock: p.stock || '', description: p.description || '', image: p.image || '', status: p.status || 'active', tags: p.tags || '' }); setShowProductModal(true); };
    const saveProduct = async () => {
        try {
            const payload = { ...productForm, price: parseFloat(productForm.price), stock: parseInt(productForm.stock) };
            if (editingProduct) await api.put(`products/${editingProduct.id || editingProduct._id}/`, payload);
            else await api.post('products/', payload);
            setShowProductModal(false); fetchData();
        } catch (err) { alert('Failed to save product'); }
    };
    const deleteProduct = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try { await api.delete(`products/${id}/`); setProducts(products.filter(p => (p.id || p._id) !== id)); }
        catch { alert('Failed to delete product'); }
    };

    const saveHomeContent = async (newContent) => {
        try { const res = await api.post('content/home/', newContent); setHomeContent(res.data); return true; }
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

    const addToBill = (product) => {
        const existing = billingItems.find(i => i.id === (product.id || product._id));
        if (existing) setBillingItems(billingItems.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i));
        else setBillingItems([...billingItems, { 
            id: product.id || product._id, 
            name: product.name, 
            price: parseFloat(product.price), 
            quantity: 1,
            category: product.category || 'General'
        }]);
    };
    const addServiceItem = (name) => {
        const id = `srv-${Date.now()}`;
        let price = 10;
        if (name.includes('Xerox')) price = 2;
        else if (name.includes('B/W Printout')) price = 5;
        else if (name.includes('Color Printout')) price = 10;
        else if (name.includes('A3 Sheet Print')) price = 20;
        else if (name.includes('Lamination')) price = 25;
        else if (name.includes('Online')) price = 50;
        
        setBillingItems([...billingItems, { id, name, price, quantity: 1, category: 'Services' }]);
    };
    const removeFromBill = (id) => setBillingItems(billingItems.filter(i => i.id !== id));
    const updateBillQuantity = (id, qty) => { if (qty < 1) return; setBillingItems(billingItems.map(i => i.id === id ? { ...i, quantity: qty } : i)); };
    const updateItemPrice = (id, price) => setBillingItems(billingItems.map(i => i.id === id ? { ...i, price: parseFloat(price) || 0 } : i));
    const calculateBillTotal = () => billingItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const generateInvoice = async () => {
        if (!billingItems.length || !billingCustomer.name) return alert('Enter customer details and items');
        
        try {
            const adminSettings = JSON.parse(localStorage.getItem('admin_settings') || '{}');
            const gstRate = adminSettings.gst_percentage || 18;
            const subTotal = calculateBillTotal();
            const tax = (subTotal * gstRate) / 100;
            const grandTotal = subTotal + tax;

            // 1. Save to Backend (Decrements inventory)
            const res = await api.post('orders/offline/', {
                items: billingItems,
                customer: billingCustomer,
                total: grandTotal
            });

            if (res.data.success) {
                setCurrentInvoice({ 
                    id: res.data.order_id, 
                    date: new Date().toLocaleDateString(), 
                    customer: billingCustomer, 
                    items: billingItems, 
                    total: subTotal, 
                    tax: tax, 
                    grandTotal: grandTotal,
                    settings: adminSettings
                });
                setShowInvoiceModal(true);
                // Reset billing
                setBillingItems([]);
                setBillingCustomer({ name: '', phone: '', email: '' });
                fetchData(); // Refresh product stock
            }
        } catch (err) {
            alert('Failed to process offline order');
        }
    };
    const printInvoice = () => { const c = document.getElementById('invoice-template').innerHTML, orig = document.body.innerHTML; document.body.innerHTML = c; window.print(); document.body.innerHTML = orig; window.location.reload(); };

    const handleLogout = async () => { localStorage.removeItem('admin_session'); await logout(); navigate('/'); };

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: Activity },
        { id: 'business', label: 'Analysis', icon: BarChart2 },
        { id: 'billing', label: 'Billing', icon: Receipt },
        { id: 'inventory', label: 'Inventory', icon: Box },
        { id: 'orders', label: 'Orders', icon: ShoppingCart },
        { id: 'delivery', label: 'Delivery', icon: Truck },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'chat', label: 'Chat', icon: MessageCircle },
        { id: 'content', label: 'Content', icon: Edit },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    if (!user || user.role !== 'admin') return null;

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-slate-900 text-white flex flex-col fixed h-screen transition-all duration-300 overflow-hidden z-40`}>
                <div className="p-6 border-b border-white/10 flex justify-between items-center min-w-[256px]">
                    <h1 className="text-xl font-bold">SJG Admin</h1>
                    <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-lg"><X size={18} /></button>
                </div>
                <nav className="flex-1 p-4 space-y-1 min-w-[256px]">
                    {tabs.map(tab => (
                        <Link key={tab.id} to={`/admin/${tab.id}`} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}>
                            <tab.icon size={18} /> {tab.label}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-white/10 flex items-center gap-3 min-w-[256px]">
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400"><UserCircle size={20} /></div>
                    <div><p className="text-sm font-medium">{user.name}</p></div>
                </div>
            </aside>

            {/* Main */}
            <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-0'} p-8 transition-all duration-300`}>
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        {!sidebarOpen && <button onClick={() => setSidebarOpen(true)} className="p-2.5 bg-slate-900 text-white rounded-lg shadow-lg"><Menu size={20} /></button>}
                        <h2 className="text-2xl font-bold text-slate-800 capitalize">{activeTab}</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 text-xs mr-4 ${isOnline ? 'text-green-500' : 'text-red-500'}`}>
                            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />} {isOnline ? 'Online' : 'Offline'}
                        </div>
                        <button onClick={fetchData} className="p-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-slate-500"><RefreshCw size={18} className={loading ? 'animate-spin text-indigo-500' : ''} /></button>
                        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all font-bold"><LogOut size={18} /> Exit</button>
                    </div>
                </header>

                {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 border border-red-100 animate-pulse"><X size={18} /> {error}</div>}

                {/* Tab Rendering */}
                {activeTab === 'dashboard' && <AdminDashboard stats={stats} orders={orders} getStatusBadge={getStatusBadge} />}
                {activeTab === 'business' && <AdminBusiness />}
                {activeTab === 'billing' && (
                    <AdminBilling
                        products={products} billingItems={billingItems} billingCustomer={billingCustomer} setBillingCustomer={setBillingCustomer}
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
                {activeTab === 'chat' && <AdminChat chatMessages={chatMessages} setChatMessages={setChatMessages} fetchData={fetchData} />}
                {activeTab === 'content' && (
                    <AdminContent
                        homeContent={homeContent} contentSubTab={contentSubTab} setContentSubTab={setContentSubTab}
                        openHomeItemEditor={openHomeItemEditor} deleteHomeItem={deleteHomeItem}
                        showHomeModal={showHomeModal} setShowHomeModal={setShowHomeModal} editingHomeItem={editingHomeItem}
                        homeItemForm={homeItemForm} setHomeItemForm={setHomeItemForm} handleSaveHomeItem={handleSaveHomeItem}
                    />
                )}
                {activeTab === 'settings' && <AdminSettings />}
            </main>
        </div>
    );
};

export default AdminPanel;
