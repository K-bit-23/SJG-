import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load user from storage (for demo purposes)
        const loadUser = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error('Error loading user:', error);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    const login = async (email, password) => {
        // Demo login - in real app, this would authenticate with backend
        const demoUser = {
            uid: 'demo-user',
            email: email,
            name: 'Demo User',
            role: 'user'
        };
        setUser(demoUser);
        await AsyncStorage.setItem('user', JSON.stringify(demoUser));
        return { success: true };
    };

    const register = async (name, email, password) => {
        // Demo registration
        const demoUser = {
            uid: 'demo-user',
            email: email,
            name: name,
            role: 'user'
        };
        setUser(demoUser);
        await AsyncStorage.setItem('user', JSON.stringify(demoUser));
        return { success: true };
    };

    const logout = async () => {
        setUser(null);
        await AsyncStorage.removeItem('user');
    };

    const googleLogin = async () => {
        // Demo Google login
        const demoUser = {
            uid: 'google-demo-user',
            email: 'demo@gmail.com',
            name: 'Google User',
            role: 'user'
        };
        setUser(demoUser);
        await AsyncStorage.setItem('user', JSON.stringify(demoUser));
        return { success: true };
    };

    return (
        <AuthContext.Provider value={{ user, register, login, googleLogin, logout, loading, demoMode: true }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};