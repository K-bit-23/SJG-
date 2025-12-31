import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './CartDropdown.css';

const CartDropdown = ({ onClose }) => {
    const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();

    const handleBackdropClick = (e) => {
        if (e.target.classList.contains('cart-dropdown-backdrop')) {
            onClose();
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="cart-dropdown-backdrop" onClick={handleBackdropClick}>
                <div className="cart-dropdown">
                    <div className="cart-header">
                        <h3>Shopping Cart</h3>
                        <button className="close-btn" onClick={onClose}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <div className="cart-empty">
                        <i className="fas fa-shopping-cart"></i>
                        <p>Your cart is empty</p>
                        <Link to="/products" className="btn-shop" onClick={onClose}>
                            Start Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-dropdown-backdrop" onClick={handleBackdropClick}>
            <div className="cart-dropdown">
                <div className="cart-header">
                    <h3>Shopping Cart ({cartItems.length})</h3>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="cart-items">
                    {cartItems.map((item) => (
                        <div key={item.id} className="cart-item">
                            <img src={item.image} alt={item.name} className="cart-item-image" />
                            <div className="cart-item-details">
                                <h4>{item.name}</h4>
                                <p className="cart-item-price">${item.price.toFixed(2)}</p>
                                <div className="quantity-controls">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="qty-btn"
                                    >
                                        <i className="fas fa-minus"></i>
                                    </button>
                                    <span className="quantity">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="qty-btn"
                                    >
                                        <i className="fas fa-plus"></i>
                                    </button>
                                </div>
                            </div>
                            <button
                                className="remove-btn"
                                onClick={() => removeFromCart(item.id)}
                                aria-label="Remove item"
                            >
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                    ))}
                </div>

                <div className="cart-footer">
                    <div className="cart-total">
                        <span>Total:</span>
                        <span className="total-amount">${getCartTotal().toFixed(2)}</span>
                    </div>
                    <button className="btn-checkout" onClick={onClose}>
                        <i className="fas fa-shopping-bag"></i>
                        <span>Checkout</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartDropdown;
