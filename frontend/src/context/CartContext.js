import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
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
                alert(`Cannot add more. Only ${stockLimit} units available in stock.`);
                return prev;
            }

            if (existing) {
                return prev.map(item => (item.id === product.id || item.id === product._id) ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, id: product.id || product._id, quantity: 1 }];
        });
        // Dispatch event for UI animations
        window.dispatchEvent(new Event('cartUpdate'));
    };

    const decrementFromCart = (id) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === id);
            if (existing && existing.quantity > 1) {
                return prev.map(item => item.id === id ? { ...item, quantity: item.quantity - 1 } : item);
            }
            // If quantity is 1, remove the item
            return prev.filter(item => item.id !== id);
        });
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
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
