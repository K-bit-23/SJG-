import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { productsData as dummyProducts } from '../data/productsData';
import { API_ENDPOINTS, API_BASE_URL } from '../config';

const ProductContext = createContext();

export const useProducts = () => {
    return useContext(ProductContext);
};

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Try fetching from API
                const response = await axios.get(API_ENDPOINTS.PRODUCTS);

                if (response.data && response.data.length > 0) {
                    setProducts(response.data);
                } else {
                    console.log("API returned empty, using dummy data");
                    // Use dummy data if API is empty (Demo Mode)
                    setProducts(dummyProducts);
                }
            } catch (error) {
                console.error('Error fetching products (using dummy data):', error);
                // Fallback to dummy data on error (Offline/Demo Mode)
                setProducts(dummyProducts);
            }
        };

        fetchProducts();
    }, []);

    const addProduct = async (productData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/products/`, productData);
            setProducts(prev => [...prev, response.data]);
            return response.data;
        } catch (error) {
            console.error('Error adding product:', error);
            throw error.response?.data || error;
        }
    };

    const updateProduct = async (productId, updatedData) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/api/products/${productId}/`, updatedData);
            setProducts(prev =>
                prev.map(product =>
                    product.id === productId ? response.data : product
                )
            );
        } catch (error) {
            console.error('Error updating product:', error);
            throw error.response?.data || error;
        }
    };

    const deleteProduct = async (productId) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/products/${productId}/`);
            setProducts(prev => prev.filter(product => product.id !== productId));
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error.response?.data || error;
        }
    };

    const getProductById = (productId) => {
        return products.find(product => product.id === productId);
    };

    const getProductStats = () => {
        // Safe check for undefined stats
        const safeProducts = products || [];
        const stats = {
            total: safeProducts.length,
            inStock: safeProducts.filter(product => (product.stock || 0) > 0).length,
            outOfStock: safeProducts.filter(product => (product.stock || 0) === 0).length,
            lowStock: safeProducts.filter(product => (product.stock || 0) > 0 && (product.stock || 0) < 10).length,
        };
        return stats;
    };

    const refreshProducts = async () => {
        try {
            const response = await axios.get(API_ENDPOINTS.PRODUCTS);
            if (response.data && response.data.length > 0) {
                setProducts(response.data);
            }
            return response.data;
        } catch (error) {
            console.error('Error refreshing products:', error);
            throw error;
        }
    };

    const value = {
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        getProductStats,
        refreshProducts,
    };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
};

export default ProductContext;
