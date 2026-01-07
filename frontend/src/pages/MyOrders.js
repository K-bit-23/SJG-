import React from 'react';
import { useOrders } from '../context/OrderContext';
import { Link } from 'react-router-dom';
import './MyOrders.css';

const MyOrders = () => {
    const { orders } = useOrders();

    return (
        <div className="my-orders-page">
            <div className="orders-container">
                <div className="orders-header">
                    <h2>My Orders</h2>
                </div>

                {orders.length === 0 ? (
                    <div className="no-orders">
                        <i className="fas fa-box-open" style={{ fontSize: '40px', color: '#ccc', marginBottom: '20px' }}></i>
                        <h3>You haven't placed any orders yet.</h3>
                        <Link to="/products" className="view-details-btn" style={{ marginTop: '20px', display: 'inline-block' }}>
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map(order => (
                            <div key={order.id} className="order-card">
                                <div className="order-card-header">
                                    <div>
                                        <span className="order-id-label">Order ID:</span>
                                        <span className="order-id-val">#{order.order_id || order.id}</span>
                                    </div>
                                    <span className={`order-status status-${order.status.toLowerCase()}`}>
                                        {order.status}
                                    </span>
                                </div>

                                <div className="order-card-body">
                                    <div className="order-info">
                                        <p><i className="far fa-calendar-alt"></i> {new Date(order.created_at || order.createdAt || order.date).toLocaleDateString()}</p>
                                        <p><i className="fas fa-shopping-basket"></i> {order.items.length} Items</p>
                                    </div>

                                    <div className="order-total-price">
                                        ₹{order.total.toLocaleString()}
                                    </div>

                                    <button className="view-details-btn">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
