import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { API_BASE_URL } from '../../config';
import './AdminDashboard.css';


const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    // Fetch dashboard data
    const fetchDashboardData = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/dashboard/stats/`);
            setStats(response.data);
            setLastUpdate(new Date());
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch products for inventory overview
    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/products/`);
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        fetchProducts();

        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            fetchDashboardData();
            fetchProducts();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // --- Data Processing ---

    // Calculate real statistics from products
    const lowStockProducts = products.filter(p => (p.stock || 0) < 10);
    const outOfStockProducts = products.filter(p => (p.stock || 0) === 0);
    const totalProductValue = products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0);

    // 1. Revenue Wave Data
    const salesData = stats?.sales_data?.map(item => ({
        name: item.name,
        current: item.revenue,
    })) || [];

    const totalRevenue = stats?.total_revenue || 0;
    const totalOrders = stats?.total_orders || 0;
    const pendingOrders = stats?.pending_orders || 0;
    const totalProducts = products.length;
    const lowStockCount = lowStockProducts.length;

    // Status Distribution
    const statusData = stats?.status_data || [
        { name: 'Delivered', value: 0, color: '#00b894' },
        { name: 'Pending', value: 0, color: '#fdcb6e' },
        { name: 'Cancelled', value: 0, color: '#ff7675' }
    ];

    // Recent Orders
    const recentOrders = stats?.recent_orders || [];

    if (loading) return (
        <div className="dashboard-loading">
            <div className="spinner"></div>
        </div>
    );

    return (
        <div className="modern-dashboard">
            {/* --- Top Header --- */}
            <header className="dashboard-topbar">
                <div className="search-bar">
                    <i className="fas fa-search"></i>
                    <input type="text" placeholder="Search orders, products..." />
                </div>

                <div className="topbar-actions">
                    <div className="user-greeting" onClick={() => navigate('/admin/users')} style={{ cursor: 'pointer' }} title="Manage Users">
                        <div className="text-col" style={{ textAlign: 'right' }}>
                            <span className="greeting-text">Hello, <b>{user?.name || 'Admin'}</b></span>
                        </div>
                        <div className="top-avatar-icon">
                            <i className="fas fa-user-cog"></i>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- Dashboard Grid --- */}
            <div className="dashboard-grid ecommerce-layout">

                {/* 1. Revenue Chart (Wide) */}
                <div className="dash-card revenue-card">
                    <div className="card-header">
                        <div>
                            <h3>Total Revenue</h3>
                            <h1 className="main-stat-value">₹{totalRevenue.toLocaleString()}</h1>
                        </div>
                        <div className="period-badge">This Week</div>
                    </div>
                    <div className="revenue-chart-wrapper">
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={salesData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6e8efb" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#6e8efb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a0a0a0', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a0a0a0', fontSize: 12 }} />
                                <CartesianGrid vertical={false} stroke="#f0f0f0" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="current"
                                    stroke="#6e8efb"
                                    strokeWidth={4}
                                    fill="url(#colorCurrent)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Key Metrics Column */}
                <div className="metrics-column">

                    {/* Total Orders */}
                    <div className="dash-card metric-card-compact order-metric">
                        <div className="metric-icon-box blue">
                            <i className="fas fa-shopping-bag"></i>
                        </div>
                        <div className="metric-text-box">
                            <span className="label">Total Orders</span>
                            <h3>{totalOrders}</h3>
                        </div>
                    </div>

                    {/* Pending Orders */}
                    <div className="dash-card metric-card-compact pending-metric">
                        <div className="metric-icon-box orange">
                            <i className="fas fa-clock"></i>
                        </div>
                        <div className="metric-text-box">
                            <span className="label">Pending</span>
                            <h3>{pendingOrders}</h3>
                        </div>
                    </div>

                    {/* Low Stock Warning */}
                    <div className="dash-card metric-card-compact stock-metric">
                        <div className="metric-icon-box red">
                            <i className="fas fa-exclamation-triangle"></i>
                        </div>
                        <div className="metric-text-box">
                            <span className="label">Low Stock Items</span>
                            <h3>{lowStockCount || '3'}</h3>
                        </div>
                    </div>

                </div>

                {/* 3. Order Status Donut */}
                <div className="dash-card status-card">
                    <div className="card-header mini">
                        <h3>Order Status</h3>
                    </div>
                    <div className="donut-wrapper">
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. Recent Orders List (Replaces Generic List) */}
                <div className="dash-card recent-orders-card">
                    <div className="card-header">
                        <h3>Recent Orders</h3>
                        <a href="#/admin/orders" className="view-link">View All</a>
                    </div>
                    <div className="table-responsive">
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Status</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.length > 0 ? recentOrders.map((order, idx) => (
                                    <tr key={idx}>
                                        <td>#{order.id ? order.id.substring(0, 6) : idx + 100}</td>
                                        <td>{order.customer_name || 'Walk-in'}</td>
                                        <td>
                                            <span className={`status-badge ${order.status.toLowerCase()}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>₹{order.total_amount}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                                            No recent orders found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 5. Top Products (Keep) */}
                <div className="dash-card top-products-card">
                    <div className="card-header mini">
                        <h3>Top Selling</h3>
                    </div>
                    <div className="simple-list">
                        <div className="list-row">
                            <div className="prod-name">
                                <i className="fas fa-book-open"></i> Classmate Notebooks
                            </div>
                            <b>224 sold</b>
                        </div>
                        <div className="list-row">
                            <div className="prod-name">
                                <i className="fas fa-pen-nib"></i> Parker Vector
                            </div>
                            <b>185 sold</b>
                        </div>
                        <div className="list-row">
                            <div className="prod-name">
                                <i className="fas fa-palette"></i> Camlin Art Kit
                            </div>
                            <b>155 sold</b>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
