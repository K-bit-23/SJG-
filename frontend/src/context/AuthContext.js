import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Load user from localStorage on initialization
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // Save user to localStorage whenever it changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    const login = async (email, password, rememberMe = false) => {
        try {
            // Simulate API call
            // In production, this would be an actual API call
            const mockUser = {
                id: Date.now(),
                email: email,
                name: email.split('@')[0],
                role: 'user',
                mobile: '',
                avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=6e8efb&color=fff`
            };

            setUser(mockUser);
            setIsAuthModalOpen(false);
            return { success: true, user: mockUser };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const register = async (userData) => {
        try {
            // Simulate API call
            const newUser = {
                id: Date.now(),
                email: userData.email,
                name: userData.email.split('@')[0],
                role: userData.role || 'user',
                mobile: userData.mobile || '',
                avatar: `https://ui-avatars.com/api/?name=${userData.email.split('@')[0]}&background=6e8efb&color=fff`
            };

            setUser(newUser);
            setIsAuthModalOpen(false);
            return { success: true, user: newUser };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const loginWithGoogle = async () => {
        try {
            // Simulate Google OAuth
            const mockUser = {
                id: Date.now(),
                email: 'user@gmail.com',
                name: 'Google User',
                role: 'user',
                mobile: '',
                avatar: 'https://ui-avatars.com/api/?name=Google+User&background=6e8efb&color=fff',
                provider: 'google'
            };

            setUser(mockUser);
            setIsAuthModalOpen(false);
            return { success: true, user: mockUser };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const loginWithBiometric = async () => {
        try {
            // Check if WebAuthn is supported
            if (!window.PublicKeyCredential) {
                throw new Error('Biometric authentication is not supported on this device');
            }

            // Simulate biometric authentication
            const mockUser = {
                id: Date.now(),
                email: 'biometric@user.com',
                name: 'Biometric User',
                role: 'user',
                mobile: '',
                avatar: 'https://ui-avatars.com/api/?name=Biometric+User&background=6e8efb&color=fff',
                provider: 'biometric'
            };

            setUser(mockUser);
            setIsAuthModalOpen(false);
            return { success: true, user: mockUser };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const openAuthModal = () => {
        setIsAuthModalOpen(true);
    };

    const closeAuthModal = () => {
        setIsAuthModalOpen(false);
    };

    const value = {
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        login,
        register,
        loginWithGoogle,
        loginWithBiometric,
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
