import React from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import './MyOrders.css';

const MyOrders = () => {
    const { user } = useAuth();
    const { getUserOrders } = useOrders();

    const orders = getUserOrders(user?.email);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'status-pending';
            case 'Processing': return 'status-processing';
            case 'Shipped': return 'status-shipped';
            case 'Delivered': return 'status-delivered';
            default: return '';
        }
    };

    if (!user) {
        return (
            <div className="my-orders-page">
                <div className="container text-center">
                    <h1>Please Login</h1>
                    <p>You need to be logged in to view your orders.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="my-orders-page">
            <div className="container">
                <h1 className="page-title">My Orders</h1>

                {orders.length === 0 ? (
                    <div className="empty-orders">
                        <div className="empty-icon">
                            <i className="fas fa-box-open"></i>
                        </div>
                        <h2>No Orders Yet</h2>
                        <p>Looks like you haven't placed any orders yet.</p>
                        <Link to="/products" className="btn-shop">Start Shopping</Link>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map(order => (
                            <div key={order.id} className="order-card">
                                <div className="order-header">
                                    <div className="order-id-date">
                                        <h3>Order #{order.id}</h3>
                                        <span className="order-date">
                                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className={`order-status ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </div>
                                </div>

                                <div className="order-items-preview">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="preview-item">
                                            <img src={item.image} alt={item.name} />
                                            <span className="qty-badge">{item.quantity}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="order-footer">
                                    <div className="order-total">
                                        <span>Total Amount:</span>
                                        <strong>${order.total.toFixed(2)}</strong>
                                    </div>
                                    <Link to={`/order-confirmation/${order.id}`} className="btn-details">
                                        View Details
                                    </Link>
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
