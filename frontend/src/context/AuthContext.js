import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [modalView, setModalView] = useState('login'); // 'login' | 'register' | 'admin'

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get('http://localhost:8000/api/auth/user/', {
                        headers: { Authorization: `Token ${token}` }
                    });
                    setUser(response.data);
                } catch (error) {
                    localStorage.removeItem('token');
                }
            }
        };
        fetchUser();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:8000/api/auth/login/', { email, password });
            localStorage.setItem('token', response.data.token);
            setUser(response.data.user);
            setIsAuthModalOpen(false);
            return { success: true, user: response.data.user };
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'An unexpected error occurred.';
            return { success: false, error: errorMessage };
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post('http://localhost:8000/api/auth/register/', userData);
            localStorage.setItem('token', response.data.token);
            setUser(response.data.user);
            setIsAuthModalOpen(false);
            return { success: true, user: response.data.user };
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'An unexpected error occurred.';
            return { success: false, error: errorMessage };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const openAuthModal = (view = 'login') => {
        setModalView(view);
        setIsAuthModalOpen(true);
    };
    const closeAuthModal = () => setIsAuthModalOpen(false);

    const value = {
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        modalView,
        login,
        register,
        logout,
        openAuthModal,
        closeAuthModal
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;