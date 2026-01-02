import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ProductContext = createContext();

export const useProducts = () => {
    return useContext(ProductContext);
};

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/products/');
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }, []);

    const addProduct = async (productData) => {
        try {
            const response = await axios.post('http://localhost:8000/api/products/', productData);
            setProducts(prev => [...prev, response.data]);
            return response.data;
        } catch (error) {
            console.error('Error adding product:', error);
            throw error;
        }
    };

    const updateProduct = async (productId, updatedData) => {
        try {
            const response = await axios.put(`http://localhost:8000/api/products/${productId}/`, updatedData);
            setProducts(prev =>
                prev.map(product =>
                    product.id === productId ? response.data : product
                )
            );
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    };

    const deleteProduct = async (productId) => {
        try {
            await axios.delete(`http://localhost:8000/api/products/${productId}/`);
            setProducts(prev => prev.filter(product => product.id !== productId));
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    };
    
    const getProductById = (productId) => {
        return products.find(product => product.id === productId);
    };

    const value = {
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
    };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
};

export default ProductContext;
