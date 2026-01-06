import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { useProducts } from '../../context/ProductContext';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { API_BASE_URL } from '../../config';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/dashboard/stats/`);
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Fallback or API Data
    const salesData = stats?.sales_data?.length > 0 ? stats.sales_data : [
        { name: 'No Data', orders: 0, revenue: 0 }
    ];

    const statusData = stats?.status_data?.length > 0 ? stats.status_data : [
        { name: 'No Data', value: 1, color: '#eee' }
    ];

    const totalStats = stats?.stats || {
        total_products: 0,
        total_orders: 0,
        pending_orders: 0,
        total_revenue: 0
    };

    if (loading) return <div className="admin-dashboard-content">Loading...</div>;

    return (
        <div className="admin-dashboard-content">
            <div className="admin-header">
                <h1>Dashboard Overview</h1>
                <p>Welcome back, {user?.name}!</p>
            </div>

            {/* --- Stats Cards --- */}
            <div className="stats-grid">
                <div className="stat-card products">
                    <div className="stat-icon"><i className="fas fa-box"></i></div>
                    <div className="stat-info">
                        <h3>{totalStats.total_products}</h3> <p>Total Products</p>
                    </div>
                </div>
                <div className="stat-card orders">
                    <div className="stat-icon"><i className="fas fa-shopping-cart"></i></div>
                    <div className="stat-info">
                        <h3>{totalStats.total_orders}</h3> <p>Total Orders</p>
                    </div>
                </div>
                <div className="stat-card pending">
                    <div className="stat-icon"><i className="fas fa-clock"></i></div>
                    <div className="stat-info">
                        <h3>{totalStats.pending_orders}</h3> <p>Pending Orders</p>
                    </div>
                </div>
                <div className="stat-card revenue">
                    <div className="stat-icon"><i className="fas fa-dollar-sign"></i></div>
                    <div className="stat-info">
                        <h3>₹{totalStats.total_revenue?.toLocaleString('en-IN') || '0'}</h3> <p>Total Revenue</p>
                    </div>
                </div>
            </div>

            {/* --- Charts --- */}
            <div className="charts-container">
                {/* Sales Overview */}
                <div className="chart-card sales-chart">
                    <h2>Sales & Revenue Overview</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                            <Area type="monotone" dataKey="revenue" stroke="#8884d8" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (₹)" />
                            <Area type="monotone" dataKey="orders" stroke="#82ca9d" fillOpacity={1} fill="url(#colorOrders)" name="Orders" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Sub Charts */}
                <div className="charts-row">
                    {/* Order Status */}
                    <div className="chart-card pie-chart">
                        <h2>Order Status Distribution</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%" cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color || '#888'} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Simple Bar Chart: Weekly Stats (Reusing Sales Data) */}
                    <div className="chart-card bar-chart">
                        <h2>Weekly Traffic</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={salesData.slice(-5)}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="orders" fill="#6e8efb" radius={[10, 10, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
