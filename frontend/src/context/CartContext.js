import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotifications } from './NotificationContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { showAlert, showToast } = useNotifications();
    const [cart, setCart] = useState([]);

    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            setCart(JSON.parse(storedCart));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id || item.id === product._id);
            const currentQty = existing ? existing.quantity : 0;
            const stockLimit = product.stock !== undefined ? product.stock : 999;

            if (currentQty >= stockLimit) {
                showAlert(`Cannot add more. Only ${stockLimit} units available.`, 'warning', 'Stock Limit');
                return prev;
            }

            const newCart = existing 
                ? prev.map(item => (item.id === product.id || item.id === product._id) ? { ...item, quantity: item.quantity + 1 } : item)
                : [...prev, { ...product, id: product.id || product._id, quantity: 1 }];
            
            showToast(`${product.name || 'Item'} added to bag`, 'success');
            return newCart;
        });
        // Dispatch event for UI animations
        window.dispatchEvent(new Event('cartUpdate'));
    };

    const decrementFromCart = (id) => {
        const idStr = String(id);
        setCart(prev => {
            const existing = prev.find(item => String(item.id || item._id) === idStr);
            if (existing && existing.quantity > 1) {
                return prev.map(item => String(item.id || item._id) === idStr ? { ...item, quantity: item.quantity - 1 } : item);
            }
            // If quantity is 1, remove the item
            return prev.filter(item => String(item.id || item._id) !== idStr);
        });
    };

    const removeFromCart = (id) => {
        const idStr = String(id);
        console.log('Context: Removing item with ID:', idStr);
        setCart(prev => {
            const newCart = prev.filter(item => {
                const itemId = String(item.id || item._id || '');
                return itemId !== idStr;
            });
            console.log('Context: New cart length:', newCart.length);
            return newCart;
        });
    };

    const clearCart = () => {
        setCart([]);
    };

    const getCartTotal = () => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const getCartCount = () => {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, decrementFromCart, removeFromCart, clearCart, getCartTotal, getCartCount }}>
            {children}
        </CartContext.Provider>
    );
};
