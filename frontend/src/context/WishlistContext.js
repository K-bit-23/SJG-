import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/api';

const WishlistContext = createContext();

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export const WishlistProvider = ({ children }) => {
    const { user } = useAuth();
    const [wishlist, setWishlist] = useState([]);
    const isInitialMount = useRef(true);

    // Initial Load
    useEffect(() => {
        const fetchWishlist = async () => {
            if (user) {
                try {
                    const userEmail = user.emailAddresses ? user.emailAddresses[0].emailAddress : user.email;
                    const { data } = await api.get(`/profile/${encodeURIComponent(userEmail)}/`);
                    if (data.wishlist) {
                        setWishlist(data.wishlist);
                    }
                } catch (err) {
                    console.error("Failed to fetch wishlist from DB:", err);
                    // Fallback to localStorage
                    const saved = localStorage.getItem('wishlist');
                    if (saved) setWishlist(JSON.parse(saved));
                }
            } else {
                const saved = localStorage.getItem('wishlist');
                if (saved) setWishlist(JSON.parse(saved));
            }
        };
        fetchWishlist();
    }, [user]);

    // Sync to DB and LocalStorage
    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        window.dispatchEvent(new Event('storage'));
        
        const syncWishlist = async () => {
            if (user && !isInitialMount.current) {
                try {
                    const userEmail = user.emailAddresses ? user.emailAddresses[0].emailAddress : user.email;
                    await api.post(`/profile/${encodeURIComponent(userEmail)}/`, { wishlist });
                } catch (err) {
                    console.error("Failed to sync wishlist to DB:", err);
                }
            }
            if (isInitialMount.current) isInitialMount.current = false;
        };
        
        const timeoutId = setTimeout(syncWishlist, 1000); // Debounce sync
        return () => clearTimeout(timeoutId);
    }, [wishlist, user]);

    const getProductId = (product) => product.id || product._id;

    const addToWishlist = (product) => {
        const productId = getProductId(product);
        setWishlist(prev => {
            if (prev.find(p => getProductId(p) === productId)) return prev;
            return [...prev, { ...product, id: productId }];
        });
    };

    const removeFromWishlist = (productId) => {
        setWishlist(prev => prev.filter(p => getProductId(p) !== productId));
    };

    const isInWishlist = (productId) => {
        return wishlist.some(p => getProductId(p) === productId);
    };

    const clearWishlist = () => {
        setWishlist([]);
    };

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, clearWishlist, getProductId }}>
            {children}
        </WishlistContext.Provider>
    );
};
