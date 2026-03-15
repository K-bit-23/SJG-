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
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Data States
    const [stats, setStats] = useState({ total_revenue: 0, active_orders: 0, customers_count: 0, products_count: 0 });
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);

    // Billing States
    const [billingItems, setBillingItems] = useState([]);
    const [billingCustomer, setBillingCustomer] = useState({ name: '', phone: '', email: '' });
    const [billingProductSearch, setBillingProductSearch] = useState('');
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [currentInvoice, setCurrentInvoice] = useState(null);

    // Product Modal States
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({
        name: '', category: '', price: '', stock: '', description: '', image: ''
    });

    // Content Editor States
    const [homeContent, setHomeContent] = useState({ banners: [], services: [], trust_strip: [] });
    const [contentSubTab, setContentSubTab] = useState('banners'); // 'banners', 'services'
    const [showHomeModal, setShowHomeModal] = useState(false);
    const [editingHomeItem, setEditingHomeItem] = useState(null);
    const [homeItemForm, setHomeItemForm] = useState({});

    // Monitor online/offline status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Redirect non-admin users
    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
        }
    }, [user, navigate]);

    // Fetch data based on active tab
    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        setError('');
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
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-primary text-white flex flex-col fixed h-screen transition-all duration-300 overflow-hidden z-40`}>
                <div className="p-6 border-b border-white/10 flex justify-between items-center min-w-[256px]">
                    <div>
                        <h1 className="text-xl font-bold">SJG Admin</h1>
                        <p className="text-xs text-white/60 mt-1">Management Console</p>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 min-w-[256px]">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-white/20 text-white'
                                : 'text-white/70 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {/* Online/Offline Status */}
                <div className="p-4 border-t border-white/10 min-w-[256px]">
                    <div className={`flex items-center gap-2 text-xs ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                        {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
                        {isOnline ? 'System Online' : 'Offline Mode'}
                    </div>
                </div>

                {/* Admin Profile Link */}
                <Link to="/profile" className="p-4 border-t border-white/10 flex items-center gap-3 hover:bg-white/10 transition-colors min-w-[256px]">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <UserCircle size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-white/60">View Profile</p>
                    </div>
                </Link>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-0'} p-8 transition-all duration-300`}>
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        {/* Menu Toggle Button - inline with title */}
                        {!sidebarOpen && (
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-2.5 bg-primary text-white rounded-lg shadow hover:bg-slate-800 transition-all"
                            >
                                <Menu size={20} />
                            </button>
                        )}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 capitalize">{activeTab}</h2>
                            <p className="text-gray-500 text-sm">Manage your store</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={fetchData} className="p-2 bg-white rounded-full shadow hover:shadow-md transition-all" title="Refresh">
                            <RefreshCw size={18} className={loading ? 'animate-spin text-secondary' : 'text-gray-500'} />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all font-medium"
                            title="Sign Out"
                        >
                            <LogOut size={18} /> Sign Out
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
                        <AlertCircle size={18} /> {error}
                    </div>
                )}

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-8">
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {statCards.map((stat, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 rounded-xl ${stat.color} text-white`}>
                                            <stat.icon size={24} />
                                        </div>
                                        <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
                                    </div>
                                    <h3 className="text-gray-500 font-medium">{stat.title}</h3>
                                </div>
                            ))}
                        </div>

                        {/* Recent Orders */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-bold mb-4">Recent Orders</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 text-gray-600 text-sm">
                                        <tr>
                                            <th className="p-3 text-left">Order ID</th>
                                            <th className="p-3 text-left">Customer</th>
                                            <th className="p-3 text-left">Status</th>
                                            <th className="p-3 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {Array.isArray(orders) && orders.slice(0, 5).map(order => (
                                            <tr key={order.order_id} className="hover:bg-gray-50">
                                                <td className="p-3 font-medium text-secondary">{order.order_id}</td>
                                                <td className="p-3">{order.user_name}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusBadge(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-right font-bold">₹{order.total_amount}</td>
                                            </tr>
                                        ))}
                                        {orders.length === 0 && (
                                            <tr><td colSpan="4" className="p-8 text-center text-gray-400">No orders yet</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Offline Billing Tab */}
                {activeTab === 'billing' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Product Selection */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Quick Services */}
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="text-lg font-bold mb-4">Quick Services</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <button onClick={() => addServiceItem('Xerox (B&W)')} className="p-4 border border-dashed border-gray-300 rounded-xl hover:bg-secondary/5 hover:border-secondary hover:text-secondary transition-all font-medium flex flex-col items-center gap-2">
                                        <Copy size={24} /> Xerox
                                    </button>
                                    <button onClick={() => addServiceItem('Printout (Color)')} className="p-4 border border-dashed border-gray-300 rounded-xl hover:bg-secondary/5 hover:border-secondary hover:text-secondary transition-all font-medium flex flex-col items-center gap-2">
                                        <Printer size={24} /> Print
                                    </button>
                                    <button onClick={() => addServiceItem('Lamination')} className="p-4 border border-dashed border-gray-300 rounded-xl hover:bg-secondary/5 hover:border-secondary hover:text-secondary transition-all font-medium flex flex-col items-center gap-2">
                                        <Layers size={24} /> Lamination
                                    </button>
                                    <button onClick={() => addServiceItem('Online Services')} className="p-4 border border-dashed border-gray-300 rounded-xl hover:bg-secondary/5 hover:border-secondary hover:text-secondary transition-all font-medium flex flex-col items-center gap-2">
                                        <Globe size={24} /> Online Help
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold">Select Products</h3>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search products..."
                                            className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 ring-secondary/20 outline-none w-64"
                                            value={billingProductSearch}
                                            onChange={(e) => setBillingProductSearch(e.target.value)}
                                        />
                                        <i className="absolute left-3 top-3 text-gray-400"><Box size={16} /></i>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto p-1">
                                    {products
                                        .filter(p => p.name.toLowerCase().includes(billingProductSearch.toLowerCase()))
                                        .map(product => (
                                            <div key={product.id || product._id}
                                                className="border rounded-lg p-3 hover:shadow-md transition-all cursor-pointer bg-gray-50 hover:bg-white"
                                                onClick={() => addToBill(product)}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="w-12 h-12 bg-gray-200 rounded object-cover overflow-hidden">
                                                        <img src={product.image || '/placeholder.png'} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <span className="font-bold text-secondary">₹{product.price}</span>
                                                </div>
                                                <h4 className="font-medium text-sm truncate" title={product.name}>{product.name}</h4>
                                                <p className="text-xs text-gray-500">{product.stock} in stock</p>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>

                        {/* Current Bill */}
                        <div className="bg-white p-6 rounded-xl shadow-sm h-fit">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Receipt size={20} className="text-secondary" /> Current Bill
                            </h3>

                            {/* Customer Details */}
                            <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <input
                                    type="text"
                                    placeholder="Customer Name"
                                    className="w-full bg-transparent border-b border-gray-300 focus:border-secondary outline-none py-1 text-sm"
                                    value={billingCustomer.name}
                                    onChange={(e) => setBillingCustomer({ ...billingCustomer, name: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Phone Number"
                                    className="w-full bg-transparent border-b border-gray-300 focus:border-secondary outline-none py-1 text-sm"
                                    value={billingCustomer.phone}
                                    onChange={(e) => setBillingCustomer({ ...billingCustomer, phone: e.target.value })}
                                />
                            </div>

                            {/* Bill Items */}
                            <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto">
                                {billingItems.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm p-2 hover:bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <div className="font-medium">{item.name}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-gray-500 text-xs text-left">Price: ₹</span>
                                                <input
                                                    type="number"
                                                    value={item.price}
                                                    onChange={(e) => updateItemPrice(item.id, e.target.value)}
                                                    className="w-20 p-1 border rounded text-xs"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center border rounded bg-white">
                                                <button onClick={() => updateBillQuantity(item.id, item.quantity - 1)} className="px-2 hover:bg-gray-100 py-1">-</button>
                                                <span className="px-2 text-xs">{item.quantity}</span>
                                                <button onClick={() => updateBillQuantity(item.id, item.quantity + 1)} className="px-2 hover:bg-gray-100 py-1">+</button>
                                            </div>
                                            <button onClick={() => removeFromBill(item.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                                {billingItems.length === 0 && <p className="text-center text-gray-400 text-sm py-4">No items added</p>}
                            </div>

                            {/* Totals */}
                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span>₹{calculateBillTotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tax (18%)</span>
                                    <span>₹{(calculateBillTotal() * 0.18).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                                    <span>Total</span>
                                    <span className="text-secondary">₹{(calculateBillTotal() * 1.18).toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={generateInvoice}
                                className="w-full mt-6 bg-secondary text-white py-3 rounded-xl font-bold hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-secondary/30"
                            >
                                <Receipt size={18} /> Generate Invoice
                            </button>
                        </div>
                    </div>
                )}

                {/* Business Analysis Tab */}
                {activeTab === 'business' && (
                    <div className="space-y-8">
                        {/* 1. Key Performance Indicators (KPIs) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-gray-500 text-sm font-medium">Monthly Revenue</p>
                                        <h3 className="text-2xl font-bold text-gray-800 mt-1">₹45,250</h3>
                                    </div>
                                    <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                                        <DollarSign size={20} />
                                    </div>
                                </div>
                                <div className="flex items-center text-green-500 text-sm font-medium">
                                    <TrendingUp size={16} className="mr-1" />
                                    <span>+12.5%</span>
                                    <span className="text-gray-400 font-normal ml-2">vs last month</span>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-gray-500 text-sm font-medium">Total Orders</p>
                                        <h3 className="text-2xl font-bold text-gray-800 mt-1">1,254</h3>
                                    </div>
                                    <div className="p-2 bg-purple-50 text-purple-500 rounded-lg">
                                        <ShoppingCart size={20} />
                                    </div>
                                </div>
                                <div className="flex items-center text-green-500 text-sm font-medium">
                                    <TrendingUp size={16} className="mr-1" />
                                    <span>+8.2%</span>
                                    <span className="text-gray-400 font-normal ml-2">vs last month</span>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-gray-500 text-sm font-medium">Avg. Order Value</p>
                                        <h3 className="text-2xl font-bold text-gray-800 mt-1">₹350</h3>
                                    </div>
                                    <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
                                        <TrendingUp size={20} />
                                    </div>
                                </div>
                                <div className="flex items-center text-red-500 text-sm font-medium">
                                    <TrendingDown size={16} className="mr-1" />
                                    <span>-2.4%</span>
                                    <span className="text-gray-400 font-normal ml-2">vs last month</span>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-gray-500 text-sm font-medium">Conversion Rate</p>
                                        <h3 className="text-2xl font-bold text-gray-800 mt-1">3.8%</h3>
                                    </div>
                                    <div className="p-2 bg-green-50 text-green-500 rounded-lg">
                                        <Activity size={20} />
                                    </div>
                                </div>
                                <div className="flex items-center text-green-500 text-sm font-medium">
                                    <TrendingUp size={16} className="mr-1" />
                                    <span>+1.2%</span>
                                    <span className="text-gray-400 font-normal ml-2">vs last month</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Visual Analysis Charts (CSS Based) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Revenue Chart Trend */}
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                    <BarChart2 size={20} className="text-secondary" /> Revenue Trend (Last 6 Months)
                                </h3>
                                <div className="h-64 flex items-end justify-between gap-2 px-2">
                                    {[
                                        { month: 'Aug', val: 30, amount: '₹30k' },
                                        { month: 'Sep', val: 45, amount: '₹45k' },
                                        { month: 'Oct', val: 35, amount: '₹35k' },
                                        { month: 'Nov', val: 60, amount: '₹60k' },
                                        { month: 'Dec', val: 80, amount: '₹80k' },
                                        { month: 'Jan', val: 65, amount: '₹65k' }
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex flex-col items-center gap-2 group w-full">
                                            <div className="relative w-full bg-gray-100 rounded-t-lg overflow-hidden h-48 flex items-end">
                                                <div
                                                    className="w-full bg-secondary hover:bg-indigo-600 transition-all duration-500 rounded-t-lg relative group-hover:shadow-lg"
                                                    style={{ height: `${item.val}%` }}
                                                >
                                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {item.amount}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-xs font-medium text-gray-500">{item.month}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Top Categories */}
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                    <PieChart size={20} className="text-secondary" /> Top Categories Performance
                                </h3>
                                <div className="space-y-6">
                                    {[
                                        { name: 'Notebooks & Paper', percentage: 45, color: 'bg-blue-500', sales: '₹22,400' },
                                        { name: 'Office Supplies', percentage: 25, color: 'bg-purple-500', sales: '₹12,450' },
                                        { name: 'Art Supplies', percentage: 20, color: 'bg-pink-500', sales: '₹9,800' },
                                        { name: 'Tech Accessories', percentage: 10, color: 'bg-orange-500', sales: '₹4,500' },
                                    ].map((cat, idx) => (
                                        <div key={idx} className="mb-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                                                <span className="text-sm font-bold text-gray-900">{cat.sales}</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                                                <div
                                                    className={`h-2.5 rounded-full ${cat.color} transition-all duration-1000`}
                                                    style={{ width: `${cat.percentage}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-right mt-1">
                                                <span className="text-xs text-gray-500">{cat.percentage}% of total sales</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Transactions & Customer Insights */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                                <h3 className="text-lg font-bold mb-4">Latest Transactions</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                            <tr>
                                                <th className="p-3 text-left">Transaction ID</th>
                                                <th className="p-3 text-left">Customer</th>
                                                <th className="p-3 text-left">Date</th>
                                                <th className="p-3 text-right">Amount</th>
                                                <th className="p-3 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm divide-y">
                                            {[
                                                { id: '#TRX-9821', user: 'Rahul Kumar', date: '06 Feb, 2026', amt: '₹1,250', status: 'Completed' },
                                                { id: '#TRX-9820', user: 'Priya Sharma', date: '06 Feb, 2026', amt: '₹450', status: 'Pending' },
                                                { id: '#TRX-9819', user: 'Amit Singh', date: '05 Feb, 2026', amt: '₹2,100', status: 'Completed' },
                                                { id: '#TRX-9818', user: 'Sneha Gupta', date: '05 Feb, 2026', amt: '₹890', status: 'Failed' },
                                            ].map((trx, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="p-3 font-medium text-gray-700">{trx.id}</td>
                                                    <td className="p-3">{trx.user}</td>
                                                    <td className="p-3 text-gray-500">{trx.date}</td>
                                                    <td className="p-3 text-right font-bold">{trx.amt}</td>
                                                    <td className="p-3 text-center">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${trx.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                            trx.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-red-100 text-red-700'
                                                            }`}>
                                                            {trx.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="text-lg font-bold mb-4">Customer Insights</h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><Users size={16} /></div>
                                            <h4 className="font-bold text-sm">New Customers</h4>
                                        </div>
                                        <p className="text-2xl font-bold">145</p>
                                        <p className="text-xs text-green-500 flex items-center mt-1"><TrendingUp size={12} className="mr-1" /> +12 this week</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-purple-100 text-purple-600 rounded-full"><Clock size={16} /></div>
                                            <h4 className="font-bold text-sm">Avg. Session</h4>
                                        </div>
                                        <p className="text-2xl font-bold">4m 32s</p>
                                        <p className="text-xs text-green-500 flex items-center mt-1"><TrendingUp size={12} className="mr-1" /> +25s vs last week</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-orange-100 text-orange-600 rounded-full"><RefreshCw size={16} /></div>
                                            <h4 className="font-bold text-sm">Return Rate</h4>
                                        </div>
                                        <p className="text-2xl font-bold">2.4%</p>
                                        <p className="text-xs text-red-500 flex items-center mt-1"><TrendingDown size={12} className="mr-1" /> -0.5% vs last week</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Inventory Tab */}
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

                {/* Settings Tab */}
                {
                    activeTab === 'settings' && (
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-bold mb-6">Store Settings</h3>
                            <div className="space-y-6 max-w-2xl">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                                    <input type="text" defaultValue="SJG Stationery" className="w-full p-3 border rounded-lg focus:ring-2 ring-secondary/20 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                                    <select className="w-full p-3 border rounded-lg focus:ring-2 ring-secondary/20 outline-none">
                                        <option>INR (₹)</option>
                                        <option>USD ($)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                                    <input type="text" defaultValue="+91 93600 24821" className="w-full p-3 border rounded-lg focus:ring-2 ring-secondary/20 outline-none" />
                                </div>
                                <button className="bg-secondary text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-600 transition-colors flex items-center gap-2">
                                    <Save size={18} /> Save Settings
                                </button>
                            </div>
                        </div>
                    )}

            </main>

            {/* Product Add/Edit Modal */}
            {showProductModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowProductModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                            <button onClick={() => setShowProductModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                <input
                                    type="text"
                                    value={productForm.name}
                                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                    className="w-full p-3 border rounded-lg focus:ring-2 ring-secondary/20 outline-none"
                                    placeholder="Enter product name"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <input
                                        type="text"
                                        value={productForm.category}
                                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                                        className="w-full p-3 border rounded-lg focus:ring-2 ring-secondary/20 outline-none"
                                        placeholder="e.g. Stationery"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                    <input
                                        type="number"
                                        value={productForm.price}
                                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                        className="w-full p-3 border rounded-lg focus:ring-2 ring-secondary/20 outline-none"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                    <input
                                        type="number"
                                        value={productForm.stock}
                                        onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                                        className="w-full p-3 border rounded-lg focus:ring-2 ring-secondary/20 outline-none"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                    <input
                                        type="text"
                                        value={productForm.image}
                                        onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                                        className="w-full p-3 border rounded-lg focus:ring-2 ring-secondary/20 outline-none"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={productForm.description}
                                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                    className="w-full p-3 border rounded-lg focus:ring-2 ring-secondary/20 outline-none resize-none"
                                    rows={3}
                                    placeholder="Product description..."
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowProductModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveProduct}
                                    className="flex-1 px-4 py-3 bg-secondary text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Save size={18} /> {editingProduct ? 'Update' : 'Add'} Product
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Invoice Modal Template */}
            {showInvoiceModal && currentInvoice && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold flex items-center gap-2"><Receipt size={18} /> Invoice Generated</h3>
                            <button onClick={() => setShowInvoiceModal(false)} className="p-1 hover:bg-gray-200 rounded-full"><X size={20} /></button>
                        </div>

                        <div className="overflow-y-auto flex-1 bg-white" id="invoice-template">
                            <div className="p-8">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                                            <span className="font-bold text-2xl">SJG</span>
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">SJG Stationery</h1>
                                            <p className="text-gray-500 text-sm">Your One-Stop Shop</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
                                        <p className="text-gray-500 font-medium">Tax Invoice</p>
                                    </div>
                                </div>

                                {/* Bill To & From */}
                                <div className="flex justify-between mb-8 pl-1">
                                    <div className="w-1/2">
                                        <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider mb-2">Bill To:</h3>
                                        <div className="text-gray-600">
                                            <p className="font-bold text-lg text-gray-800">{currentInvoice.customer.name}</p>
                                            {currentInvoice.customer.phone && <p className="text-sm">{currentInvoice.customer.phone}</p>}
                                            {currentInvoice.customer.email && <p className="text-sm">{currentInvoice.customer.email}</p>}
                                            <p className="text-sm mt-1">Chennai, Tamil Nadu</p>
                                        </div>
                                    </div>
                                    <div className="text-right w-1/2">
                                        <p className="text-sm text-gray-500">123, Main Street, Tech Park</p>
                                        <p className="text-sm text-gray-500">Chennai - 600001</p>
                                        <p className="text-sm text-gray-500">Ph: +91 93600 24821</p>
                                    </div>
                                </div>

                                {/* Invoice Details Strip */}
                                <div className="bg-yellow-400 flex justify-between px-8 py-4 mb-8 rounded-none print:bg-yellow-400 print:text-black mt-4">
                                    <div>
                                        <p className="text-xs uppercase font-bold text-yellow-800 mb-1">Invoice No</p>
                                        <p className="font-bold text-lg text-black">{currentInvoice.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase font-bold text-yellow-800 mb-1">Issue Date</p>
                                        <p className="font-bold text-lg text-black">{currentInvoice.date}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase font-bold text-yellow-800 mb-1">Due Date</p>
                                        <p className="font-bold text-lg text-black">{currentInvoice.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs uppercase font-bold text-yellow-800 mb-1">Total Amount</p>
                                        <p className="font-bold text-xl text-black">₹{currentInvoice.grandTotal.toFixed(2)}</p>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <table className="w-full mb-8">
                                    <thead>
                                        <tr className="border-b-2 border-gray-100">
                                            <th className="py-3 text-left font-bold text-gray-600 uppercase text-xs w-1/2 pl-2">Description</th>
                                            <th className="py-3 text-center font-bold text-gray-600 uppercase text-xs">Quantity</th>
                                            <th className="py-3 text-right font-bold text-gray-600 uppercase text-xs">Unit Price</th>
                                            <th className="py-3 text-right font-bold text-gray-600 uppercase text-xs pr-2">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentInvoice.items.map((item, i) => (
                                            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                                                <td className="py-4 pl-2">
                                                    <p className="font-bold text-gray-700">{item.name}</p>
                                                </td>
                                                <td className="py-4 text-center text-gray-600 font-medium">{item.quantity}</td>
                                                <td className="py-4 text-right text-gray-600">₹{item.price.toFixed(2)}</td>
                                                <td className="py-4 text-right font-bold text-gray-800 pr-2">₹{(item.price * item.quantity).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Totals Section */}
                                <div className="flex justify-end mb-12">
                                    <div className="w-1/2 pr-2">
                                        <div className="flex justify-between py-2 border-b border-gray-100">
                                            <span className="font-medium text-gray-600">Subtotal</span>
                                            <span className="font-bold text-gray-800">₹{currentInvoice.total.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-100">
                                            <span className="font-medium text-gray-600">Tax (18% GST)</span>
                                            <span className="text-gray-800">₹{currentInvoice.tax.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between py-3 border-b-2 border-gray-800 mt-2 bg-gray-50 px-2 rounded">
                                            <span className="font-bold text-lg text-gray-800">Total Due</span>
                                            <span className="font-bold text-xl text-secondary">₹{currentInvoice.grandTotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer & Signature */}
                                <div className="grid grid-cols-2 gap-8 items-end mt-auto pt-8">
                                    <div>
                                        <p className="font-bold text-gray-800 mb-2">Payment Info:</p>
                                        <p className="text-sm text-gray-500">Bank: HDFC Bank</p>
                                        <p className="text-sm text-gray-500">Account: 1234 5678 9012</p>
                                        <p className="text-sm text-gray-500">IFSC: HDFC0001234</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="h-16 mb-2 flex items-end justify-end">
                                            {/* Signature Placeholder */}
                                            <span className="font-handwriting text-2xl text-gray-400 italic">S.J.G Stationery</span>
                                        </div>
                                        <div className="border-t border-gray-300 w-32 ml-auto"></div>
                                        <p className="text-xs text-gray-400 mt-2 font-medium uppercase tracking-wider">Authorized Signature</p>
                                    </div>
                                </div>

                                {/* Thank You */}
                                <div className="text-center mt-12 pb-4">
                                    <p className="font-bold text-gray-800">Thank you for your business!</p>
                                    <p className="text-xs text-gray-500 mt-1">www.sjgstationery.com</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                            <button onClick={printInvoice} className="bg-secondary text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-600 transition-colors flex items-center gap-2">
                                <Printer size={18} /> Print Invoice
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Home Content Modal */}
            {showHomeModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">{editingHomeItem.item ? 'Edit' : 'Add'} {editingHomeItem.type === 'banner' ? 'Banner' : 'Service'}</h3>
                            <button onClick={() => setShowHomeModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                        </div>

                        <div className="space-y-4">
                            {editingHomeItem.type === 'banner' ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Title</label>
                                        <input type="text" value={homeItemForm.title} onChange={e => setHomeItemForm({ ...homeItemForm, title: e.target.value })} className="w-full p-2.5 border rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Subtitle</label>
                                        <input type="text" value={homeItemForm.subtitle} onChange={e => setHomeItemForm({ ...homeItemForm, subtitle: e.target.value })} className="w-full p-2.5 border rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Image URL</label>
                                        <input type="text" value={homeItemForm.img} onChange={e => setHomeItemForm({ ...homeItemForm, img: e.target.value })} className="w-full p-2.5 border rounded-lg" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Button Text</label>
                                            <input type="text" value={homeItemForm.btnText} onChange={e => setHomeItemForm({ ...homeItemForm, btnText: e.target.value })} className="w-full p-2.5 border rounded-lg" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Button Link</label>
                                            <input type="text" value={homeItemForm.btnLink} onChange={e => setHomeItemForm({ ...homeItemForm, btnLink: e.target.value })} className="w-full p-2.5 border rounded-lg" />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Service Name</label>
                                        <input type="text" value={homeItemForm.name} onChange={e => setHomeItemForm({ ...homeItemForm, name: e.target.value })} className="w-full p-2.5 border rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Description</label>
                                        <textarea value={homeItemForm.desc} onChange={e => setHomeItemForm({ ...homeItemForm, desc: e.target.value })} className="w-full p-2.5 border rounded-lg h-20" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Icon Name</label>
                                            <select value={homeItemForm.icon} onChange={e => setHomeItemForm({ ...homeItemForm, icon: e.target.value })} className="w-full p-2.5 border rounded-lg">
                                                <option value="Printer">Printer</option>
                                                <option value="Copy">Xerox (Copy)</option>
                                                <option value="Layers">Lamination</option>
                                                <option value="BookOpen">Binding</option>
                                                <option value="FileText">Typing</option>
                                                <option value="Palette">Design</option>
                                                <option value="Sparkles">Premium</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Price Label</label>
                                            <input type="text" value={homeItemForm.price} onChange={e => setHomeItemForm({ ...homeItemForm, price: e.target.value })} className="w-full p-2.5 border rounded-lg" placeholder="e.g. From ₹10" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Color Theme (Tailwind classes)</label>
                                        <input type="text" value={homeItemForm.color} onChange={e => setHomeItemForm({ ...homeItemForm, color: e.target.value })} className="w-full p-2.5 border rounded-lg" placeholder="from-blue-500 to-blue-600" />
                                    </div>
                                </>
                            )}

                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setShowHomeModal(false)} className="flex-1 py-3 border rounded-xl font-bold">Cancel</button>
                                <button onClick={handleSaveHomeItem} className="flex-1 py-3 bg-secondary text-white rounded-xl font-bold shadow-lg shadow-secondary/30">Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
