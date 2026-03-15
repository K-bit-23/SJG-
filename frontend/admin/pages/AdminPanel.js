import React, { useEffect, useState } from 'react';
import {
    Package, TrendingUp, Users, DollarSign, Activity, MessageCircle, AlertCircle, RefreshCw,
    Box, ShoppingCart, UserCircle, Home, Edit, Wifi, WifiOff, Plus, Trash2,
    Save, X, Eye, CheckCircle, Clock, Settings, Menu, LogOut, BarChart2, PieChart, TrendingDown, Calendar, Receipt, Download, Globe, Copy, Printer, Layers
} from 'lucide-react';
import api from '../../src/utils/api';
import { useAuth } from '../../src/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

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
    const [chatMessages, setChatMessages] = useState([]);

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
                    api.get('dashboard/stats/').catch(() => ({ data: { total_revenue: "5,00,000", active_orders: 45, customers_count: 120, products_count: 850 } })),
                    api.get('products/').catch(() => ({ data: [] }))
                ]);
                setStats(statsRes.data);
                setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
            }
            if (activeTab === 'orders' || activeTab === 'dashboard') {
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
        { id: 'chat', label: 'Chat', icon: MessageCircle },
        { id: 'content', label: 'Content', icon: Edit },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const statCards = [
        { title: "Total Revenue", value: `₹${stats.total_revenue}`, icon: DollarSign, color: "bg-blue-500" },
        { title: "Active Orders", value: stats.active_orders, icon: Package, color: "bg-orange-500" },
        { title: "Customers", value: stats.customers_count, icon: Users, color: "bg-green-500" },
        { title: "Products", value: stats.products_count, icon: Box, color: "bg-purple-500" }
    ];

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
            
            // Find the order to get customer email for notification
            const order = orders.find(o => o.order_id === orderId);
            if (order && order.user_email) {
                const statusMessages = {
                    processing: 'is being prepared for dispatch.',
                    completed: 'has been delivered successfully!',
                    cancelled: 'has been cancelled.',
                    pending: 'is now in pending status.'
                };
                
                await api.post('notifications/', {
                    user_email: order.user_email,
                    title: `Order ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
                    message: `Order #${orderId.split('-').pop() || orderId} ${statusMessages[newStatus] || 'status updated.'}`,
                    type: newStatus
                }).catch(err => console.error("Notification trigger failed", err));
            }

            setOrders(orders.map(o => o.order_id === orderId ? { ...o, status: newStatus } : o));
        } catch (err) {
            alert('Failed to update order status');
        }
    };

    // Product CRUD Functions
    const openAddProduct = () => {
        setEditingProduct(null);
        setProductForm({ name: '', category: '', price: '', stock: '', description: '', image: '' });
        setShowProductModal(true);
    };

    const openEditProduct = (product) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name || '',
            category: product.category || '',
            price: product.price || '',
            stock: product.stock || '',
            description: product.description || '',
            image: product.image || ''
        });
        setShowProductModal(true);
    };

    const saveProduct = async () => {
        try {
            const productData = {
                ...productForm,
                price: parseFloat(productForm.price),
                stock: parseInt(productForm.stock)
            };

            if (editingProduct) {
                await api.put(`products/${editingProduct.id || editingProduct._id}/`, productData);
            } else {
                await api.post('products/', productData);
            }
            setShowProductModal(false);
            fetchData();
        } catch (err) {
            alert('Failed to save product: ' + (err.response?.data?.message || err.message));
        }
    };

    const deleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`products/${productId}/`);
            setProducts(products.filter(p => (p.id || p._id) !== productId));
        } catch (err) {
            alert('Failed to delete product');
        }
    };

    // Home Content Functions
    const saveHomeContent = async (newContent) => {
        try {
            const res = await api.post('content/home/', newContent);
            setHomeContent(res.data);
            return true;
        } catch (err) {
            alert('Failed to save home content');
            return false;
        }
    };

    const openHomeItemEditor = (item = null, type) => {
        setEditingHomeItem({ item, type, index: item ? (type === 'banner' ? homeContent.banners.indexOf(item) : homeContent.services.indexOf(item)) : -1 });
        if (type === 'banner') {
            setHomeItemForm(item || { title: '', subtitle: '', img: '', description: '', btnText: 'Shop Now', btnLink: '/products' });
        } else {
            setHomeItemForm(item || { name: '', desc: '', icon: 'Sparkles', color: 'from-blue-500 to-blue-600', price: 'Free' });
        }
        setShowHomeModal(true);
    };

    const handleSaveHomeItem = async () => {
        const { type, index } = editingHomeItem;
        const updated = { ...homeContent };
        if (type === 'banner') {
            if (index > -1) updated.banners[index] = homeItemForm;
            else updated.banners.push({ ...homeItemForm, id: Date.now() });
        } else {
            if (index > -1) updated.services[index] = homeItemForm;
            else updated.services.push(homeItemForm);
        }

        const success = await saveHomeContent(updated);
        if (success) setShowHomeModal(false);
    };

    const deleteHomeItem = async (type, index) => {
        if (!window.confirm('Delete this item?')) return;
        const updated = { ...homeContent };
        if (type === 'banner') updated.banners.splice(index, 1);
        else updated.services.splice(index, 1);
        saveHomeContent(updated);
    };

    // Billing Functions
    const addToBill = (product) => {
        const existingItem = billingItems.find(item => item.id === product.id || item.id === product._id);
        if (existingItem) {
            setBillingItems(billingItems.map(item =>
                (item.id === product.id || item.id === product._id) ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setBillingItems([...billingItems, {
                id: product.id || product._id,
                name: product.name,
                price: parseFloat(product.price),
                quantity: 1
            }]);
        }
    };

    const removeFromBill = (productId) => {
        setBillingItems(billingItems.filter(item => item.id !== productId));
    };

    const addServiceItem = (serviceName) => {
        const id = `srv-${Date.now()}`;
        setBillingItems([...billingItems, {
            id,
            name: serviceName,
            price: 10, // Default price, can be edited
            quantity: 1
        }]);
    };

    const updateItemPrice = (productId, newPrice) => {
        setBillingItems(billingItems.map(item =>
            item.id === productId ? { ...item, price: parseFloat(newPrice) || 0 } : item
        ));
    };

    const updateBillQuantity = (productId, newQty) => {
        if (newQty < 1) return;
        setBillingItems(billingItems.map(item =>
            item.id === productId ? { ...item, quantity: newQty } : item
        ));
    };

    const calculateBillTotal = () => {
        return billingItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const generateInvoice = () => {
        if (billingItems.length === 0) {
            alert("Please add items to the bill");
            return;
        }
        if (!billingCustomer.name) {
            alert("Please enter customer name");
            return;
        }

        const subTotal = calculateBillTotal();
        const tax = subTotal * 0.18;
        const grandTotal = subTotal + tax;

        const invoice = {
            id: `INV-${Date.now().toString().slice(-6)}`,
            date: new Date().toLocaleDateString(),
            customer: billingCustomer,
            items: billingItems,
            total: subTotal,
            tax: tax,
            grandTotal: grandTotal
        };

        setCurrentInvoice(invoice);
        setShowInvoiceModal(true);
    };

    const printInvoice = () => {
        const printContent = document.getElementById('invoice-template').innerHTML;
        const originalContent = document.body.innerHTML;
        document.body.innerHTML = printContent;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload();
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    if (!user || user.role !== 'admin') return null;

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
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold">Product Inventory</h3>
                            <button onClick={openAddProduct} className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors">
                                <Plus size={18} /> Add Product
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 text-gray-600 text-sm">
                                    <tr>
                                        <th className="p-3 text-left">Product</th>
                                        <th className="p-3 text-left">Category</th>
                                        <th className="p-3 text-left">Price</th>
                                        <th className="p-3 text-left">Stock</th>
                                        <th className="p-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {Array.isArray(products) && products.map(product => (
                                        <tr key={product.id || product._id} className="hover:bg-gray-50">
                                            <td className="p-3 flex items-center gap-3">
                                                <img src={product.image || '/placeholder.png'} alt="" className="w-10 h-10 rounded bg-gray-100 object-cover" />
                                                <span className="font-medium">{product.name}</span>
                                            </td>
                                            <td className="p-3 text-gray-600">{product.category}</td>
                                            <td className="p-3 font-bold">₹{product.price}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${product.stock > 10 ? 'bg-green-100 text-green-700' :
                                                    product.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {product.stock} units
                                                </span>
                                            </td>
                                            <td className="p-3 text-right">
                                                <button onClick={() => openEditProduct(product)} className="p-2 hover:bg-gray-100 rounded text-gray-500"><Edit size={16} /></button>
                                                <button onClick={() => deleteProduct(product.id || product._id)} className="p-2 hover:bg-red-50 rounded text-red-500"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {products.length === 0 && (
                                        <tr><td colSpan="5" className="p-8 text-center text-gray-400">No products found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
                }

                {/* Orders Tab */}
                {
                    activeTab === 'orders' && (
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-bold mb-6">Order Management</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 text-gray-600 text-sm">
                                        <tr>
                                            <th className="p-3 text-left">Order ID</th>
                                            <th className="p-3 text-left">Date/Time</th>
                                            <th className="p-3 text-left">Customer</th>
                                            <th className="p-3 text-left">Items</th>
                                            <th className="p-3 text-left">Status</th>
                                            <th className="p-3 text-left">Amount</th>
                                            <th className="p-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {orders.map(order => (
                                            <tr key={order.order_id} className="hover:bg-gray-50">
                                                <td className="p-3 font-medium text-secondary">{order.order_id}</td>
                                                <td className="p-3 text-xs text-gray-500">
                                                    {order.created_at ? new Date(order.created_at).toLocaleString('en-IN', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    }) : 'N/A'}
                                                </td>
                                                <td className="p-3">
                                                    <div>{order.user_name}</div>
                                                    <div className="text-xs text-gray-500">{order.user_email}</div>
                                                </td>
                                                <td className="p-3">{order.items?.length || 0} items</td>
                                                <td className="p-3">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => updateOrderStatus(order.order_id, e.target.value)}
                                                        className={`px-2 py-1 rounded text-xs font-bold border-0 ${getStatusBadge(order.status)}`}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="processing">Processing</option>
                                                        <option value="shipped">Shipped</option>
                                                        <option value="completed">Completed</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                                <td className="p-3 font-bold">₹{order.total_amount}</td>
                                                <td className="p-3 text-right">
                                                    <button className="p-2 hover:bg-gray-100 rounded text-gray-500"><Eye size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                        {orders.length === 0 && (
                                            <tr><td colSpan="6" className="p-8 text-center text-gray-400">No orders found</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                }

                {/* Users Tab */}
                {
                    activeTab === 'users' && (
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-bold mb-6">User Management</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 text-gray-600 text-sm">
                                        <tr>
                                            <th className="p-3 text-left">User</th>
                                            <th className="p-3 text-left">Email</th>
                                            <th className="p-3 text-left">Role</th>
                                            <th className="p-3 text-left">Joined</th>
                                            <th className="p-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {Array.isArray(users) && users.map(u => (
                                            <tr key={u.uid} className="hover:bg-gray-50">
                                                <td className="p-3 flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
                                                        <UserCircle size={18} />
                                                    </div>
                                                    <span className="font-medium">{u.display_name || 'User'}</span>
                                                </td>
                                                <td className="p-3 text-gray-600">{u.email}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-gray-500 text-sm">{u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}</td>
                                                <td className="p-3 text-right">
                                                    <button className="p-2 hover:bg-gray-100 rounded text-gray-500"><Edit size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                        {users.length === 0 && (
                                            <tr><td colSpan="5" className="p-8 text-center text-gray-400">No users found</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                }

                {/* Chat Tab */}
                {activeTab === 'chat' && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-bold mb-6">Chat Messages</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-700">
                                <thead className="bg-gray-50 text-gray-600">
                                    <tr>
                                        <th className="p-3">Time</th>
                                        <th className="p-3">Session</th>
                                        <th className="p-3">User</th>
                                        <th className="p-3">Sender</th>
                                        <th className="p-3">Message</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {Array.isArray(chatMessages) && chatMessages.length > 0 ? chatMessages.map(msg => (
                                        <tr key={msg.id || (msg.session_id + msg.created_at)} className="hover:bg-gray-50">
                                            <td className="p-3 text-xs text-gray-500">{msg.created_at ? new Date(msg.created_at).toLocaleString() : '-'}</td>
                                            <td className="p-3 text-xs text-gray-500">{msg.session_id || '-'}</td>
                                            <td className="p-3 text-xs text-gray-500">{msg.user_email || 'N/A'}</td>
                                            <td className="p-3 text-xs font-semibold capitalize">{msg.sender}</td>
                                            <td className="p-3">{msg.text}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center text-gray-400">No chat messages found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Content Tab */}
                {activeTab === 'content' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="flex border-b">
                                <button
                                    onClick={() => setContentSubTab('banners')}
                                    className={`px-6 py-4 text-sm font-bold transition-all ${contentSubTab === 'banners' ? 'border-b-2 border-secondary text-secondary' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Hero Banners
                                </button>
                                <button
                                    onClick={() => setContentSubTab('services')}
                                    className={`px-6 py-4 text-sm font-bold transition-all ${contentSubTab === 'services' ? 'border-b-2 border-secondary text-secondary' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Print Services
                                </button>
                            </div>

                            <div className="p-6">
                                {contentSubTab === 'banners' ? (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-bold text-gray-700">Home Hero Banners</h4>
                                            <button onClick={() => openHomeItemEditor(null, 'banner')} className="flex items-center gap-2 bg-secondary text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                                                <Plus size={14} /> Add Banner
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {Array.isArray(homeContent.banners) && homeContent.banners.map((banner, idx) => (
                                                <div key={idx} className="group relative bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all">
                                                    <img src={banner.img} alt="" className="w-full h-32 object-cover" />
                                                    <div className="p-3">
                                                        <h5 className="font-bold text-sm truncate">{banner.title}</h5>
                                                        <p className="text-xs text-gray-500 truncate">{banner.subtitle}</p>
                                                        <div className="flex gap-2 mt-3">
                                                            <button onClick={() => openHomeItemEditor(banner, 'banner')} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
                                                                <Edit size={14} />
                                                            </button>
                                                            <button onClick={() => deleteHomeItem('banner', idx)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {homeContent.banners.length === 0 && <p className="col-span-full text-center py-8 text-gray-400 text-sm">No banners configured</p>}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-bold text-gray-700">Service Grid Items</h4>
                                            <button onClick={() => openHomeItemEditor(null, 'service')} className="flex items-center gap-2 bg-secondary text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                                                <Plus size={14} /> Add Service
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                            {Array.isArray(homeContent.services) && homeContent.services.map((service, idx) => (
                                                <div key={idx} className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100 hover:shadow-md transition-all">
                                                    <div className={`w-10 h-10 mx-auto rounded-lg bg-gradient-to-br ${service.color} flex items-center justify-center text-white mb-2 shadow-sm`}>
                                                        <Edit size={16} /> {/* Placeholder for icon */}
                                                    </div>
                                                    <h5 className="font-bold text-xs truncate">{service.name}</h5>
                                                    <p className="text-[10px] text-gray-500 mb-2 truncate">{service.price}</p>
                                                    <div className="flex justify-center gap-1">
                                                        <button onClick={() => openHomeItemEditor(service, 'service')} className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"><Edit size={12} /></button>
                                                        <button onClick={() => deleteHomeItem('service', idx)} className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash2 size={12} /></button>
                                                    </div>
                                                </div>
                                            ))}
                                            {homeContent.services.length === 0 && <p className="col-span-full text-center py-8 text-gray-400 text-sm">No services configured</p>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
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
