import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
    const { orderId } = useParams();
    const { getOrderById } = useOrders();
    const order = getOrderById(orderId);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!order) {
        return (
            <div className="confirmation-page error">
                <div className="container">
                    <h1>Order Not Found</h1>
                    <Link to="/" className="btn-home">Return Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="confirmation-page">
            <div className="container">
                <div className="confirmation-card">
                    <div className="success-icon">
                        <i className="fas fa-check-circle"></i>
                    </div>

                    <h1>Order Placed Successfully!</h1>
                    <p className="order-message">
                        Thank you for your purchase. Your order has been received and is being processed.
                    </p>

                    <div className="order-info">
                        <div className="info-item">
                            <span>Order ID:</span>
                            <strong>{order.id}</strong>
                        </div>
                        <div className="info-item">
                            <span>Date:</span>
                            <strong>{new Date(order.createdAt).toLocaleDateString()}</strong>
                        </div>
                        <div className="info-item">
                            <span>Total Amount:</span>
                            <strong>${order.total.toFixed(2)}</strong>
                        </div>
                        <div className="info-item">
                            <span>Payment Method:</span>
                            <strong>{order.paymentMethod}</strong>
                        </div>
                    </div>

                    <div className="action-buttons">
                        <Link to="/my-orders" className="btn-orders">
                            <i className="fas fa-box"></i> View My Orders
                        </Link>
                        <Link to="/products" className="btn-continue">
                            Continue Shopping <i className="fas fa-arrow-right"></i>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
