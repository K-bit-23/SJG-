import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import './Checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { placeOrder } = useOrders();
    const { user, isAuthenticated, openAuthModal } = useAuth();

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.mobile || '',
        address: '',
        city: '',
        zipCode: '',
        paymentMethod: 'cod'
    });

    const [loading, setLoading] = useState(false);

    if (cartItems.length === 0) {
        navigate('/products');
        return null; // Don't render if empty
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            openAuthModal();
            return;
        }

        setLoading(true);
        // Simulate
        await new Promise(resolve => setTimeout(resolve, 1500));

        const orderData = {
            items: cartItems,
            total: getCartTotal(),
            customerName: formData.name,
            customerEmail: formData.email,
            phone: formData.phone,
            address: `${formData.address}, ${formData.city} - ${formData.zipCode}`,
            paymentMethod: formData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'
        };

        const newOrder = placeOrder(orderData);
        clearCart();
        setLoading(false);
        navigate(`/order-confirmation/${newOrder.id}`);
    };

    return (
        <div className="checkout-page">
            <div className="checkout-container">

                {/* Left: Form */}
                <div className="checkout-form-section">
                    <h2><i className="fas fa-shipping-fast"></i> Shipping Details</h2>

                    <form id="checkout-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label>Phone Number</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label>Delivery Address</label>
                            <textarea name="address" rows="3" value={formData.address} onChange={handleChange} required></textarea>
                        </div>

                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>City</label>
                                <input type="text" name="city" value={formData.city} onChange={handleChange} required />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Zip Code</label>
                                <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} required />
                            </div>
                        </div>

                        <h2 style={{ fontSize: '20px', marginTop: '30px' }}><i className="fas fa-wallet"></i> Payment Method</h2>
                        <div className="form-group">
                            <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}>
                                <option value="cod">Cash on Delivery (COD)</option>
                                <option value="online">Online Payment (UPI/Card)</option>
                            </select>
                        </div>
                    </form>
                </div>

                {/* Right: Summary */}
                <div className="order-summary-section">
                    <div className="summary-title">ORDER SUMMARY</div>

                    <div className="summary-items">
                        {cartItems.map(item => (
                            <div key={item.id} className="summary-item">
                                <span className="summary-item-name">{item.name} <small style={{ color: '#999' }}>x{item.quantity}</small></span>
                                <span className="summary-item-price">₹{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>

                    <div className="summary-total">
                        <span>Total Amount</span>
                        <span>₹{getCartTotal().toLocaleString()}</span>
                    </div>

                    <button type="submit" form="checkout-form" className="place-order-btn" disabled={loading}>
                        {loading ? 'Processing...' : 'PLACE ORDER'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Checkout;
