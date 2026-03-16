import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [toast, setToast] = useState(null);
    const [alert, setAlert] = useState(null);
    const [barMessage, setBarMessage] = useState("Welcome to SJG - Quality Textiles & Modern Designs! 🚚 Free delivery on orders above ₹1000");

    const addNotification = (message, type = 'info', order_id = null) => {
        const id = Date.now();
        setNotifications(prev => [{ id, message, type, order_id, time: new Date() }, ...prev].slice(0, 10));
        
        // Also show as toast
        setToast({ id, message, type });
        setTimeout(() => setToast(current => current?.id === id ? null : current), 4000);
    };

    const showToast = (message, type = 'success') => {
        const id = Date.now();
        setToast({ id, message, type });
        setTimeout(() => setToast(current => current?.id === id ? null : current), 4000);
    };

    const showAlert = (message, type = 'success') => {
        const id = Date.now();
        setAlert({ id, message, type });
        setTimeout(() => setAlert(current => current?.id === id ? null : current), 5000);
    };

    const updateBarMessage = (msg) => setBarMessage(msg);

    return (
        <NotificationContext.Provider value={{ 
            notifications, 
            addNotification, 
            toast, 
            showToast, 
            alert,
            showAlert,
            barMessage, 
            updateBarMessage,
            clearToast: () => setToast(null),
            clearAlert: () => setAlert(null)
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
