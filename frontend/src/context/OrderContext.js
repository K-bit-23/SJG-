import React, { createContext, useContext, useState, useEffect } from 'react';

const OrderContext = createContext();

export const useOrders = () => {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useOrders must be used within an OrderProvider');
    }
    return context;
};

export const OrderProvider = ({ children }) => {
    const [orders, setOrders] = useState(() => {
        const savedOrders = localStorage.getItem('orders');
        return savedOrders ? JSON.parse(savedOrders) : [];
    });

    useEffect(() => {
        localStorage.setItem('orders', JSON.stringify(orders));
    }, [orders]);

    const placeOrder = (orderData) => {
        const newOrder = {
            id: `ORD-${Date.now()}`,
            ...orderData,
            status: 'Pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        setOrders(prev => [newOrder, ...prev]);
        return newOrder;
    };

    const updateOrderStatus = (orderId, newStatus) => {
        setOrders(prev =>
            prev.map(order =>
                order.id === orderId
                    ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
                    : order
            )
        );
    };

    const getOrderById = (orderId) => {
        return orders.find(order => order.id === orderId);
    };

    const getUserOrders = (userEmail) => {
        return orders.filter(order => order.customerEmail === userEmail);
    };

    const getAllOrders = () => {
        return orders;
    };

    const getOrderStats = () => {
        return {
            total: orders.length,
            pending: orders.filter(o => o.status === 'Pending').length,
            processing: orders.filter(o => o.status === 'Processing').length,
            shipped: orders.filter(o => o.status === 'Shipped').length,
            delivered: orders.filter(o => o.status === 'Delivered').length,
            totalRevenue: orders.reduce((sum, order) => sum + order.total, 0)
        };
    };

    const value = {
        orders,
        placeOrder,
        updateOrderStatus,
        getOrderById,
        getUserOrders,
        getAllOrders,
        getOrderStats
    };

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
};

export default OrderContext;
