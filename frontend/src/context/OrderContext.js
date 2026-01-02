import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const OrderContext = createContext();

export const useOrders = () => {
    return useContext(OrderContext);
};

export const OrderProvider = ({ children }) => {
    const [orders, setOrders] = useState([]);
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        const fetchOrders = async () => {
            if (isAuthenticated) {
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get('http://localhost:8000/api/orders/', {
                        headers: { Authorization: `Token ${token}` }
                    });
                    setOrders(response.data);
                } catch (error) {
                    console.error('Error fetching orders:', error);
                }
            }
        };
        fetchOrders();
    }, [isAuthenticated]);

    const placeOrder = async (orderData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8000/api/orders/', orderData, {
                headers: { Authorization: `Token ${token}` }
            });
            setOrders(prev => [response.data, ...prev]);
            return response.data;
        } catch (error) {
            console.error('Error placing order:', error);
            throw error;
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.patch(`http://localhost:8000/api/orders/${orderId}/`, { status: newStatus }, {
                headers: { Authorization: `Token ${token}` }
            });
            setOrders(prev =>
                prev.map(order =>
                    order.id === orderId ? response.data : order
                )
            );
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    };
    
    const getOrderById = (orderId) => {
        return orders.find(order => order.id === orderId);
    };
    
    const getUserOrders = () => {
        if (!user) return [];
        return orders.filter(order => order.customer_email === user.email);
    };

    const value = {
        orders,
        placeOrder,
        updateOrderStatus,
        getOrderById,
        getUserOrders,
    };

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
};

export default OrderContext;