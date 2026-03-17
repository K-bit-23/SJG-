import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [toast, setToast] = useState(null);
    const [alert, setAlert] = useState(null);
    const [callout, setCallout] = useState({
        message: "Free delivery on orders above ₹1000! 🚚 Shop the new 2024 collection now.",
        type: "premium",
        title: "Exclusive Offer"
    });
    const [barMessage, setBarMessage] = useState("Welcome to SJG - Quality Textiles & Modern Designs!");

    const showCallout = (message, type = 'info', title = null) => {
        setCallout({ message, type, title });
    };

    const clearCallout = () => setCallout(null);

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

    const showAlert = (message, type = 'success', title = null) => {
        const id = Date.now();
        setAlert({ id, message, type, title });
        setTimeout(() => setAlert(current => current?.id === id ? null : current), 6000);
    };

    const updateBarMessage = (msg) => setBarMessage(msg);

    useEffect(() => {
        const handleBackendError = (event) => {
            const { message, type, title } = event.detail || {};
            showAlert(message || "A backend error occurred.", type || "error", title || "Server Connection Reset");
        };

        window.addEventListener('backend-error', handleBackendError);
        return () => window.removeEventListener('backend-error', handleBackendError);
    }, []);

    return (
        <NotificationContext.Provider value={{ 
            notifications, 
            addNotification, 
            toast, 
            showToast, 
            alert,
            showAlert,
            callout,
            showCallout,
            clearCallout,
            barMessage, 
            updateBarMessage,
            clearToast: () => setToast(null),
            clearAlert: () => setAlert(null)
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
