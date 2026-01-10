import React, { useState } from 'react';
import { useOrders } from '../context/OrderContext';
import { Link } from 'react-router-dom';
import './MyOrders.css';

const MyOrders = () => {
    const { orders } = useOrders();
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');

    const toggleOrderDetails = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const filteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter(order => order.status.toLowerCase() === filterStatus);

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'fa-clock';
            case 'processing': return 'fa-cog fa-spin';
            case 'shipped': return 'fa-shipping-fast';
            case 'delivered': case 'completed': return 'fa-check-circle';
            case 'cancelled': return 'fa-times-circle';
            default: return 'fa-box';
        }
    };

    return (
        <div className="my-orders-page">
            <div className="orders-container-minimal">
                {/* Compact Header */}
                <div className="orders-header-minimal">
                    <div>
                        <h2>My Orders</h2>
                        <p>{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
                    </div>

                    {/* Filter Dropdown */}
                    <select
                        className="filter-dropdown"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="no-orders-minimal">
                        <i className="fas fa-box-open"></i>
                        <h3>{filterStatus === 'all' ? "No orders yet" : `No ${filterStatus} orders`}</h3>
                        <Link to="/products" className="shop-btn-minimal">
                            <i className="fas fa-shopping-bag"></i> Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="orders-list-minimal">
                        {filteredOrders.map(order => (
                            <div key={order.id} className="order-card-minimal">
                                {/* Compact Order Header */}
                                <div
                                    className="order-header-row"
                                    onClick={() => toggleOrderDetails(order.id)}
                                >
                                    <div className="order-main-info">
                                        <span className="order-id-minimal">
                                            #{(order.order_id || order.id).substring(0, 8)}
                                        </span>
                                        <span className="order-date-minimal">
                                            {new Date(order.created_at || order.createdAt || order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>

                                    <div className="order-summary-info">
                                        <span className={`status-badge-minimal status-${order.status.toLowerCase()}`}>
                                            <i className={`fas ${getStatusIcon(order.status)}`}></i>
                                            {order.status}
                                        </span>
                                        <span className="order-total-minimal">₹{order.total.toLocaleString()}</span>
                                        <i className={`fas fa-chevron-${expandedOrder === order.id ? 'up' : 'down'} expand-icon`}></i>
                                    </div>
                                </div>

                                {/* Expandable Order Details */}
                                {expandedOrder === order.id && (
                                    <div className="order-details-dropdown">
                                        <div className="order-items-list">
                                            <h4>Items ({order.items.length})</h4>
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="order-item-row">
                                                    <span className="item-name">{item.product_name || item.name}</span>
                                                    <span className="item-qty">x{item.quantity}</span>
                                                    <span className="item-price">₹{item.price}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="order-details-info">
                                            <div className="detail-row">
                                                <i className="fas fa-map-marker-alt"></i>
                                                <span>{order.shipping_address || 'Address not provided'}</span>
                                            </div>
                                            <div className="detail-row">
                                                <i className="fas fa-credit-card"></i>
                                                <span>{order.payment_method || 'COD'}</span>
                                            </div>
                                        </div>

                                        <div className="order-actions">
                                            <button className="track-btn">
                                                <i className="fas fa-truck"></i> Track Order
                                            </button>
                                            {order.status.toLowerCase() === 'delivered' && (
                                                <button className="reorder-btn">
                                                    <i className="fas fa-redo"></i> Reorder
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
