import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-cart">
          <img
            src="https://rukminim1.flixcart.com/www/800/800/promos/16/05/2019/d438a32e-765a-4d8b-b4a6-520b560971e8.png?q=90"
            alt="Empty Cart"
            className="empty-cart-img"
          />
          <h3>Your cart is empty!</h3>
          <p style={{ marginBottom: '20px', color: '#888' }}>Explore our premium products and add them to your cart.</p>
          <Link to="/products" className="shop-now-btn-cart">Shop Now</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">

        {/* Left Section */}
        <div className="cart-items-section">
          <div className="cart-header">
            <h2>Shopping Cart</h2>
            <span className="cart-count-badge">{cartItems.length} Items</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>

                <div className="item-details">
                  <div className="item-title">{item.name}</div>
                  <div className="item-meta">Category: {item.category || 'Stationery'}</div>

                  <div className="item-actions">
                    <div className="item-price">₹{item.price.toLocaleString('en-IN')}</div>

                    <div className="quantity-controls">
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                        <i className="fas fa-minus"></i>
                      </button>
                      <div className="qty-val">{item.quantity}</div>
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>

                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                      <i className="fas fa-trash-alt"></i> REMOVE
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section */}
        <div className="price-details-section">
          <div className="price-header">Order Summary</div>

          <div className="price-row">
            <span>Subtotal</span>
            <span>₹{getCartTotal().toLocaleString('en-IN')}</span>
          </div>
          <div className="price-row">
            <span>Discount</span>
            <span style={{ color: '#27ae60' }}>₹0</span>
          </div>
          <div className="price-row">
            <span>Shipping</span>
            <span style={{ color: '#27ae60' }}>Free</span>
          </div>

          <div className="price-row row-total">
            <span>Total</span>
            <span>₹{getCartTotal().toLocaleString('en-IN')}</span>
          </div>

          <button className="checkout-btn" onClick={() => navigate('/checkout')}>
            Proceed to Checkout
          </button>
        </div>

      </div>
    </div>
  );
};

export default Cart;
