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
        return null;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            openAuthModal();
            return;
        }

        setLoading(true);

        // Simulate processing delay
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
            <div className="container">
                <h1 className="page-title">Checkout</h1>

                <div className="checkout-grid">
                    <div className="checkout-form-section">
                        <div className="section-header">
                            <h2>Shipping Information</h2>
                        </div>

                        <form id="checkout-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows="3"
                                    required
                                ></textarea>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Zip Code</label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        value={formData.zipCode}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="section-header">
                                <h2>Payment Method</h2>
                            </div>

                            <div className="payment-options">
                                <label className={`payment-option ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cod"
                                        checked={formData.paymentMethod === 'cod'}
                                        onChange={handleChange}
                                    />
                                    <div className="option-content">
                                        <i className="fas fa-money-bill-wave"></i>
                                        <span>Cash on Delivery</span>
                                    </div>
                                </label>

                                <label className={`payment-option ${formData.paymentMethod === 'online' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="online"
                                        checked={formData.paymentMethod === 'online'}
                                        onChange={handleChange}
                                    />
                                    <div className="option-content">
                                        <i className="fas fa-credit-card"></i>
                                        <span>Online Payment</span>
                                    </div>
                                </label>
                            </div>
                        </form>
                    </div>

                    <div className="order-summary-section">
                        <div className="summary-card">
                            <h2>Order Summary</h2>
                            <div className="summary-items">
                                {cartItems.map(item => (
                                    <div key={item.id} className="summary-item">
                                        <div className="item-details">
                                            <span className="item-name">{item.name}</span>
                                            <span className="item-qty">x{item.quantity}</span>
                                        </div>
                                        <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="summary-totals">
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>${getCartTotal().toFixed(2)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Shipping</span>
                                    <span>Free</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Total</span>
                                    <span>${getCartTotal().toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                form="checkout-form"
                                className="btn-place-order"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i> Processing...
                                    </>
                                ) : (
                                    <>
                                        Place Order <i className="fas fa-arrow-right"></i>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
