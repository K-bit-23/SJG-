import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import './OrderManagement.css';

const OrderManagement = () => {
    const { orders, updateOrderStatus } = useOrders();
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);

    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
        const searchString = searchTerm.toLowerCase();
        const orderId = (order.order_id || order.id).toLowerCase();
        const matchesSearch =
            orderId.includes(searchString) ||
            order.user_email?.toLowerCase().includes(searchString) ||
            order.user_name?.toLowerCase().includes(searchString);
        return matchesStatus && matchesSearch;
    });

    const sendEmailNotification = (order, newStatus) => {
        // In a real app, this would trigger a backend endpoint to send email
        console.log(`📧 Sending email to ${order.user_email}: Your order ${order.order_id || order.id} is now ${newStatus}`);
        // alert(`Notification sent to ${order.user_email}`); 
    };

    const handleStatusChange = (orderId, newStatus) => {
        updateOrderStatus(orderId, newStatus);
        const order = orders.find(o => o.id === orderId);
        if (order) {
            sendEmailNotification(order, newStatus);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'status-pending';
            case 'processing': return 'status-processing';
            case 'shipped': return 'status-shipped';
            case 'delivered': return 'status-delivered';
            case 'cancelled': return 'status-cancelled';
            default: return '';
        }
    };

    return (
        <div className="admin-page modern-admin">
            <div className="page-header">
                <div className="header-content">
                    <h1><i className="fas fa-boxes"></i> Order Management</h1>
                    <p className="subtitle">Manage and track customer orders efficiently</p>
                </div>
                <div className="header-actions">
                    <div className="stat-badge">
                        <span className="label">Total Orders</span>
                        <span className="value">{orders.length}</span>
                    </div>
                </div>
            </div>

            <div className="admin-controls">
                <div className="search-bar modern-search">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Search by Order ID, Email or Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <span className="filter-label">Filter by:</span>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="modern-select"
                    >
                        <option value="All">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="orders-table-container modern-table-container">
                <table className="admin-table modern-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map(order => (
                                <tr key={order.id} className="fade-in">
                                    <td className="order-id-cell">
                                        <span className="id-badge">{order.order_id || order.id}</span>
                                    </td>
                                    <td>
                                        <div className="date-cell">
                                            <i className="far fa-calendar-alt"></i>
                                            {new Date(order.created_at || order.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="customer-info">
                                            <div className="avatar-circle">
                                                {(order.user_name || 'G').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="info-text">
                                                <span className="customer-name">{order.user_name || order.customerName || 'Guest'}</span>
                                                <span className="customer-email">{order.user_email || order.customerEmail}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="amount-cell">₹{parseFloat(order.total_amount || order.total).toFixed(2)}</td>
                                    <td>
                                        <div className={`status-badge-modern ${getStatusColor(order.status)}`}>
                                            <span className="dot"></span>
                                            {order.status}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <select
                                                className="status-select-mini"
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancel</option>
                                            </select>
                                            <button
                                                className="btn-icon-view"
                                                onClick={() => setSelectedOrder(order)}
                                                title="View Details"
                                            >
                                                <i className="fas fa-eye"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="no-results">
                                    <i className="fas fa-inbox"></i>
                                    <p>No orders found matching your criteria</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selectedOrder && (
                <div className="modal-backdrop fade-in" onClick={() => setSelectedOrder(null)}>
                    <div className="modal-content order-modal modern-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="header-title">
                                <h2>Order Details</h2>
                                <span className="order-ref">#{selectedOrder.order_id || selectedOrder.id}</span>
                            </div>
                            <button className="btn-close" onClick={() => setSelectedOrder(null)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="modal-body-scroll">
                            <div className="status-tracker-bar">
                                {/* Visual progress bar based on status can go here */}
                                <div className={`progress-step ${['pending', 'processing', 'shipped', 'delivered'].includes(selectedOrder.status) ? 'active' : ''}`}>Placed</div>
                                <div className={`progress-line ${['processing', 'shipped', 'delivered'].includes(selectedOrder.status) ? 'active' : ''}`}></div>
                                <div className={`progress-step ${['processing', 'shipped', 'delivered'].includes(selectedOrder.status) ? 'active' : ''}`}>Processing</div>
                                <div className={`progress-line ${['shipped', 'delivered'].includes(selectedOrder.status) ? 'active' : ''}`}></div>
                                <div className={`progress-step ${['shipped', 'delivered'].includes(selectedOrder.status) ? 'active' : ''}`}>Shipped</div>
                                <div className={`progress-line ${['delivered'].includes(selectedOrder.status) ? 'active' : ''}`}></div>
                                <div className={`progress-step ${['delivered'].includes(selectedOrder.status) ? 'active' : ''}`}>Delivered</div>
                            </div>

                            <div className="order-details-grid">
                                <div className="detail-card">
                                    <h3><i className="fas fa-user"></i> Customer</h3>
                                    <div className="detail-row">
                                        <span className="label">Name:</span>
                                        <span className="value">{selectedOrder.user_name || selectedOrder.customerName}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Email:</span>
                                        <span className="value">{selectedOrder.user_email || selectedOrder.customerEmail}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Phone:</span>
                                        <span className="value">{selectedOrder.phone || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="detail-card">
                                    <h3><i className="fas fa-map-marker-alt"></i> Shipping</h3>
                                    <p className="address-text">{selectedOrder.shipping_address || selectedOrder.address}</p>
                                    <div className="detail-row">
                                        <span className="label">Method:</span>
                                        <span className="value">{selectedOrder.payment_method || selectedOrder.paymentMethod}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="order-items-section">
                                <h3>Items Ordered</h3>
                                <div className="items-list-modern">
                                    {(selectedOrder.items || []).map((item, index) => (
                                        <div key={index} className="item-row-modern">
                                            <div className="item-main">
                                                <div className="item-icon">
                                                    <i className="fas fa-box"></i>
                                                </div>
                                                <div className="item-meta">
                                                    <h4>{item.product_name || item.name}</h4>
                                                    <span>Qty: {item.quantity}</span>
                                                </div>
                                            </div>
                                            <div className="item-price">
                                                ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="order-total-modern">
                                    <span>Total Amount</span>
                                    <span className="total-value">₹{parseFloat(selectedOrder.total_amount || selectedOrder.total).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setSelectedOrder(null)}>Close</button>
                            <button className="btn-primary" onClick={() => window.print()}>Print Invoice</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagement;
