import React, { useEffect, useState } from 'react';
import {
    Package, TrendingUp, Users, DollarSign, Activity, AlertCircle, RefreshCw,
    Box, ShoppingCart, UserCircle, Home, Edit, Wifi, WifiOff, Plus, Trash2,
    Save, X, Eye, CheckCircle, Clock, Settings, Menu, LogOut
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
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
                    axios.get('/api/dashboard/stats/').catch(() => ({ data: { total_revenue: "5,00,000", active_orders: 45, customers_count: 120, products_count: 850 } })),
                    axios.get('/api/products/').catch(() => ({ data: [] }))
                ]);
                setStats(statsRes.data);
                setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
            }
            if (activeTab === 'orders' || activeTab === 'dashboard') {
                const ordersRes = await axios.get('/api/orders/').catch(() => ({ data: [] }));
                setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
            }
            if (activeTab === 'users') {
                const usersRes = await axios.get('/api/users/').catch(() => ({ data: [] }));
                setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
            }
            if (activeTab === 'content') {
                const contentRes = await axios.get('/api/content/home/').catch(() => ({ data: { banners: [], services: [], trust_strip: [] } }));
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
        { id: 'inventory', label: 'Inventory', icon: Box },
        { id: 'orders', label: 'Orders', icon: ShoppingCart },
        { id: 'users', label: 'Users', icon: Users },
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
            completed: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700'
        };
        return styles[status] || styles.pending;
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await axios.patch(`/api/orders/${orderId}/`, { status: newStatus });
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
                await axios.put(`/api/products/${editingProduct.id || editingProduct._id}/`, productData);
            } else {
                await axios.post('/api/products/', productData);
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
            await axios.delete(`/api/products/${productId}/`);
            setProducts(products.filter(p => (p.id || p._id) !== productId));
        } catch (err) {
            alert('Failed to delete product');
        }
    };

    // Home Content Functions
    const saveHomeContent = async (newContent) => {
        try {
            const res = await axios.post('/api/content/home/', newContent);
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
