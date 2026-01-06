import React from 'react';
import { useParams, Link } from 'react-router-dom';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
    const { orderId } = useParams();

    return (
        <div className="confirmation-page">
            <div className="confirmation-card">
                <div className="success-icon">
                    <i className="fas fa-check"></i>
                </div>

                <h2>Order Placed Successfully!</h2>
                <div className="order-id">
                    Order ID: <span>#{orderId}</span>
                </div>

                <p className="confirmation-message">
                    Thank you for your purchase. Your order has been received and is being processed.
                    You will receive an email confirmation shortly.
                </p>

                <div className="con-buttons">
                    <Link to="/products" className="btn-home">Continue Shopping</Link>
                    <Link to="/my-orders" className="btn-orders">View Orders</Link>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
