import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    useEffect(() => {
        const loadCart = async () => {
            try {
                const storedCart = await AsyncStorage.getItem('cart');
                if (storedCart) {
                    setCart(JSON.parse(storedCart));
                }
            } catch (error) {
                console.error('Error loading cart:', error);
            }
        };
        loadCart();
    }, []);

    useEffect(() => {
        const saveCart = async () => {
            try {
                await AsyncStorage.setItem('cart', JSON.stringify(cart));
            } catch (error) {
                console.error('Error saving cart:', error);
            }
        };
        saveCart();
    }, [cart]);

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
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