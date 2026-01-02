import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { useProducts } from '../../context/ProductContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { user } = useAuth();
    const { getOrderStats } = useOrders();
    const { getProductStats } = useProducts();

    const orderStats = getOrderStats();
    const productStats = getProductStats();

    return (
        <div className="admin-dashboard-content">
            <div className="admin-header">
                <h1>Dashboard Overview</h1>
                <p>Welcome back, {user?.name}!</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card products">
                    <div className="stat-icon">
                        <i className="fas fa-box"></i>
                    </div>
                    <div className="stat-info">
                        <h3>{productStats.total}</h3>
                        <p>Total Products</p>
                    </div>
                </div>

                <div className="stat-card orders">
                    <div className="stat-icon">
                        <i className="fas fa-shopping-cart"></i>
                    </div>
                    <div className="stat-info">
                        <h3>{orderStats.total}</h3>
                        <p>Total Orders</p>
                    </div>
                </div>

                <div className="stat-card pending">
                    <div className="stat-icon">
                        <i className="fas fa-clock"></i>
                    </div>
                    <div className="stat-info">
                        <h3>{orderStats.pending}</h3>
                        <p>Pending Orders</p>
                    </div>
                </div>

                <div className="stat-card revenue">
                    <div className="stat-icon">
                        <i className="fas fa-dollar-sign"></i>
                    </div>
                    <div className="stat-info">
                        <h3>${orderStats.totalRevenue.toFixed(2)}</h3>
                        <p>Total Revenue</p>
                    </div>
                </div>
            </div>

            <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="actions-grid">
                    <Link to="/admin/inventory" className="action-card">
                        <i className="fas fa-plus-circle"></i>
                        <span>Add New Product</span>
                    </Link>
                    <Link to="/admin/orders" className="action-card">
                        <i className="fas fa-list"></i>
                        <span>View All Orders</span>
                    </Link>
                    <Link to="/admin/users" className="action-card">
                        <i className="fas fa-users"></i>
                        <span>Manage Users</span>
                    </Link>
                    <Link to="/products" className="action-card">
                        <i className="fas fa-store"></i>
                        <span>View Store</span>
                    </Link>
                </div>
            </div>

            <div className="order-status-summary">
                <h2>Order Status Summary</h2>
                <div className="status-grid">
                    <div className="status-item">
                        <div className="status-bar pending" style={{ width: `${(orderStats.pending / orderStats.total * 100) || 0}%` }}></div>
                        <div className="status-label">
                            <span>Pending</span>
                            <strong>{orderStats.pending}</strong>
                        </div>
                    </div>
                    <div className="status-item">
                        <div className="status-bar processing" style={{ width: `${(orderStats.processing / orderStats.total * 100) || 0}%` }}></div>
                        <div className="status-label">
                            <span>Processing</span>
                            <strong>{orderStats.processing}</strong>
                        </div>
                    </div>
                    <div className="status-item">
                        <div className="status-bar shipped" style={{ width: `${(orderStats.shipped / orderStats.total * 100) || 0}%` }}></div>
                        <div className="status-label">
                            <span>Shipped</span>
                            <strong>{orderStats.shipped}</strong>
                        </div>
                    </div>
                    <div className="status-item">
                        <div className="status-bar delivered" style={{ width: `${(orderStats.delivered / orderStats.total * 100) || 0}%` }}></div>
                        <div className="status-label">
                            <span>Delivered</span>
                            <strong>{orderStats.delivered}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
