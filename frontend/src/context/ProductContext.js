import React, { createContext, useContext, useState, useEffect } from 'react';
import productsData from '../data/productsData';

const ProductContext = createContext();

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
};

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState(() => {
        const savedProducts = localStorage.getItem('products');
        return savedProducts ? JSON.parse(savedProducts) : productsData;
    });

    useEffect(() => {
        localStorage.setItem('products', JSON.stringify(products));
    }, [products]);

    const addProduct = (productData) => {
        const newProduct = {
            id: Date.now(),
            ...productData,
            createdAt: new Date().toISOString()
        };

        setProducts(prev => [...prev, newProduct]);
        return newProduct;
    };

    const updateProduct = (productId, updatedData) => {
        setProducts(prev =>
            prev.map(product =>
                product.id === productId
                    ? { ...product, ...updatedData, updatedAt: new Date().toISOString() }
                    : product
            )
        );
    };

    const deleteProduct = (productId) => {
        setProducts(prev => prev.filter(product => product.id !== productId));
    };

    const getProductById = (productId) => {
        return products.find(product => product.id === productId);
    };

    const getAllProducts = () => {
        return products;
    };

    const getProductStats = () => {
        return {
            total: products.length,
            categories: [...new Set(products.map(p => p.category))].length,
            avgPrice: products.reduce((sum, p) => sum + p.price, 0) / products.length
        };
    };

    const value = {
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        getAllProducts,
        getProductStats
    };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
};

export default ProductContext;
