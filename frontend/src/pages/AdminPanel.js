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
                setProducts(productsRes.data);
            }
            if (activeTab === 'orders' || activeTab === 'dashboard') {
                const ordersRes = await axios.get('/api/orders/').catch(() => ({ data: [] }));
                setOrders(ordersRes.data);
            }
            if (activeTab === 'users') {
                const usersRes = await axios.get('/api/users/').catch(() => ({ data: [] }));
                setUsers(usersRes.data);
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
                                        {orders.slice(0, 5).map(order => (
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
                                    {products.map(product => (
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
                                        {users.map(u => (
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
                {
                    activeTab === 'content' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Home Page Editor Card */}
                                <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                                            <Home size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">Home Page</h3>
                                            <p className="text-gray-500 text-sm">Edit banners, services, and hero content</p>
                                        </div>
                                    </div>
                                    <button className="w-full bg-blue-50 text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                                        <Edit size={18} /> Edit Home Page
                                    </button>
                                </div>

                                {/* Products Page Editor Card */}
                                <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                                            <Box size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">Products Page</h3>
                                            <p className="text-gray-500 text-sm">Manage product listings and categories</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('inventory')}
                                        className="w-full bg-purple-50 text-purple-600 py-3 rounded-lg font-medium hover:bg-purple-100 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Edit size={18} /> Manage Products
                                    </button>
                                </div>

                                {/* Contact Info Card */}
                                <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-green-100 rounded-xl text-green-600">
                                            <UserCircle size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">Contact Info</h3>
                                            <p className="text-gray-500 text-sm">Update store contact details</p>
                                        </div>
                                    </div>
                                    <button className="w-full bg-green-50 text-green-600 py-3 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center justify-center gap-2">
                                        <Edit size={18} /> Edit Contact
                                    </button>
                                </div>

                                {/* Footer Card */}
                                <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
                                            <Settings size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">Footer & Links</h3>
                                            <p className="text-gray-500 text-sm">Manage footer links and social media</p>
                                        </div>
                                    </div>
                                    <button className="w-full bg-orange-50 text-orange-600 py-3 rounded-lg font-medium hover:bg-orange-100 transition-colors flex items-center justify-center gap-2">
                                        <Edit size={18} /> Edit Footer
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }

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
        </div>
    );
};

export default AdminPanel;
