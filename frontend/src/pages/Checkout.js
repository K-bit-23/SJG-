import React, { useState, useEffect } from 'react';
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

    // --- State ---
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
    const [locLoading, setLocLoading] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [selectedPaymentMode, setSelectedPaymentMode] = useState(null);

    // Enforce Login
    useEffect(() => {
        if (!isAuthenticated) {
            // Redirect to cart and open modal, or just open modal
            // Better UX: Show modal, but if they close it, they shouldn't be here.
            // For now, let's just trigger it.
            openAuthModal();
            navigate('/cart'); // Send them back to cart so they don't see the form
        }
    }, [isAuthenticated, navigate, openAuthModal]);

    // Redirect if empty
    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/products');
        }
    }, [cartItems, navigate]);

    if (cartItems.length === 0) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- 1. Current Location Logic ---
    const handleCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setLocLoading(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;

            try {
                // Free Reverse Geocoding via OpenStreetMap Nominatim
                // Note: Usage Limits apply. Should be fine for demo/low volume.
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await response.json();

                if (data && data.address) {
                    const addr = data.address;
                    // Construct Address String
                    const street = addr.road || addr.suburb || addr.hamlet || '';
                    const city = addr.city || addr.town || addr.village || '';
                    const postcode = addr.postcode || '';

                    setFormData(prev => ({
                        ...prev,
                        address: `${street}, ${addr.neighbourhood || ''}`,
                        city: city,
                        zipCode: postcode
                    }));
                }
            } catch (error) {
                console.error("Geocoding error", error);
                alert("Could not fetch address. Please enter manually.");
            } finally {
                setLocLoading(false);
            }

        }, (error) => {
            console.error(error);
            setLocLoading(false);
            alert('Unable to retrieve your location');
        });
    };

    // --- 2. Submit Logic ---
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            openAuthModal();
            return;
        }

        // If Online Payment -> Show Mock Modal
        if (formData.paymentMethod === 'online') {
            setShowPaymentModal(true);
        } else {
            // COD -> Process Directly
            processOrder();
        }
    };

    // Final Order Processing
    const processOrder = async (isPaid = false) => {
        setLoading(true);

        const orderData = {
            items: cartItems,
            total: getCartTotal(),
            customerName: formData.name,
            customerEmail: formData.email,
            phone: formData.phone,
            address: `${formData.address}, ${formData.city} - ${formData.zipCode}`,
            paymentMethod: formData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment',
            paymentStatus: isPaid ? 'Paid' : 'Pending'
        };

        try {
            const newOrder = await placeOrder(orderData);
            clearCart();
            setLoading(false);
            setShowPaymentModal(false);

            const orderId = newOrder.order_id || newOrder.id;
            navigate(`/order-confirmation/${orderId}`);
        } catch (error) {
            console.error("Order placement failed", error);
            setLoading(false);
            setPaymentProcessing(false);
            alert("Failed to place order. Please try again.");
        }
    };

    // Mock Payment Success
    const handlePaymentSuccess = () => {
        setPaymentProcessing(true);
        setTimeout(() => {
            processOrder(true);
        }, 2000);
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

                        <div className="form-group" style={{ position: 'relative' }}>
                            <label>Delivery Address</label>
                            <textarea name="address" rows="3" value={formData.address} onChange={handleChange} required></textarea>
                            <button
                                type="button"
                                className="location-btn"
                                onClick={handleCurrentLocation}
                                disabled={locLoading}
                                title="Use Current Location"
                            >
                                <i className={`fas ${locLoading ? 'fa-spinner fa-spin' : 'fa-map-marker-alt'}`}></i>
                                {locLoading ? ' Detecting...' : ' Use My Location'}
                            </button>
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
                        {loading ? 'Processing...' : (formData.paymentMethod === 'online' ? 'PAY NOW' : 'PLACE ORDER')}
                    </button>
                </div>

            </div>

            {/* Mock Payment Modal */}
            {showPaymentModal && (
                <div className="payment-modal-overlay">
                    <div className="payment-modal">
                        <div className="modal-header">
                            <h3>Secure Payment Gateway</h3>
                            <button className="close-modal-btn" onClick={() => setShowPaymentModal(false)}><i className="fas fa-times"></i></button>
                        </div>

                        {paymentProcessing ? (
                            <div className="processing-state">
                                <div className="spinner-large"></div>
                                <h4>Processing Payment...</h4>
                                <p>Please wait while we verify your details.</p>
                                <small>Do not close or refresh this window.</small>
                            </div>
                        ) : (
                            <div className="payment-content">
                                <div className="payment-amount-display">
                                    <span className="label">Total Payable</span>
                                    <span className="amount">₹{getCartTotal().toLocaleString()}</span>
                                </div>

                                {!selectedPaymentMode ? (
                                    <div className="payment-options-grid">
                                        <button className="pay-option-card" onClick={() => setSelectedPaymentMode('upi')}>
                                            <div className="icon-wrapper upi-bg"><i className="fas fa-mobile-alt"></i></div>
                                            <span>UPI / QR</span>
                                            <i className="fas fa-chevron-right arrow"></i>
                                        </button>
                                        <button className="pay-option-card" onClick={() => setSelectedPaymentMode('card')}>
                                            <div className="icon-wrapper card-bg"><i className="far fa-credit-card"></i></div>
                                            <span>Credit / Debit Card</span>
                                            <i className="fas fa-chevron-right arrow"></i>
                                        </button>
                                        <button className="pay-option-card" onClick={() => setSelectedPaymentMode('netbanking')}>
                                            <div className="icon-wrapper net-bg"><i className="fas fa-university"></i></div>
                                            <span>Net Banking</span>
                                            <i className="fas fa-chevron-right arrow"></i>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="selected-method-form">
                                        <button className="back-btn" onClick={() => setSelectedPaymentMode(null)}>
                                            <i className="fas fa-arrow-left"></i> Back to options
                                        </button>

                                        {selectedPaymentMode === 'upi' && (
                                            <div className="method-form animate-fade">
                                                <h4><i className="fas fa-mobile-alt" style={{ color: '#27ae60' }}></i> Pay via UPI</h4>
                                                <p className="helper-text">Enter your Virtual Payment Address (VPA)</p>
                                                <div className="input-group">
                                                    <input type="text" placeholder="e.g. username@okhdfcbank" className="payment-input" />
                                                </div>
                                                <button className="pay-now-action-btn" onClick={handlePaymentSuccess}>
                                                    VERIFY & PAY ₹{getCartTotal().toLocaleString()}
                                                </button>
                                                <div className="or-divider"><span>OR</span></div>
                                                <div className="qr-placeholder">
                                                    <i className="fas fa-qrcode"></i>
                                                    <p>Scan QR with any App</p>
                                                </div>
                                            </div>
                                        )}

                                        {selectedPaymentMode === 'card' && (
                                            <div className="method-form animate-fade">
                                                <h4><i className="far fa-credit-card" style={{ color: '#2980b9' }}></i> Pay via Card</h4>
                                                <div className="input-group">
                                                    <input type="text" placeholder="Card Number" className="payment-input" maxLength="16" />
                                                </div>
                                                <div className="row-inputs">
                                                    <input type="text" placeholder="MM/YY" className="payment-input small" maxLength="5" />
                                                    <input type="password" placeholder="CVV" className="payment-input small" maxLength="3" />
                                                </div>
                                                <button className="pay-now-action-btn" onClick={handlePaymentSuccess}>
                                                    PAY ₹{getCartTotal().toLocaleString()}
                                                </button>
                                            </div>
                                        )}

                                        {selectedPaymentMode === 'netbanking' && (
                                            <div className="method-form animate-fade">
                                                <h4><i className="fas fa-university" style={{ color: '#8e44ad' }}></i> Net Banking</h4>
                                                <div className="bank-list">
                                                    <div className="bank-item" onClick={handlePaymentSuccess}>HDFC</div>
                                                    <div className="bank-item" onClick={handlePaymentSuccess}>SBI</div>
                                                    <div className="bank-item" onClick={handlePaymentSuccess}>ICICI</div>
                                                    <div className="bank-item" onClick={handlePaymentSuccess}>Axis</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;
