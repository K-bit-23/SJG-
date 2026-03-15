import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState(() => {
        const saved = localStorage.getItem('wishlist');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        // Dispatch event for other components not yet using this context
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('wishlistUpdate'));
    }, [wishlist]);

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
