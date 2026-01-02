import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

const initialUsers = [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'Admin', avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=6e8efb&color=fff' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Customer', avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=6e8efb&color=fff' },
];

export const AuthProvider = ({ children }) => {
    const [users, setUsers] = useState(initialUsers);
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    const login = async (email, password, rememberMe = false) => {
        try {
            const mockUser = {
                id: Date.now(),
                email: email,
                name: email.split('@')[0],
                role: 'user',
                mobile: '',
                avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=6e8efb&color=fff`
            };

            setUser(mockUser);
            setUsers(prev => [...prev, mockUser]);
            setIsAuthModalOpen(false);
            return { success: true, user: mockUser };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const register = async (userData) => {
        try {
            const newUser = {
                id: Date.now(),
                email: userData.email,
                name: userData.email.split('@')[0],
                role: userData.role || 'user',
                mobile: userData.mobile || '',
                avatar: `https://ui-avatars.com/api/?name=${userData.email.split('@')[0]}&background=6e8efb&color=fff`
            };

            setUser(newUser);
            setUsers(prev => [...prev, newUser]);
            setIsAuthModalOpen(false);
            return { success: true, user: newUser };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const loginWithGoogle = async () => {
        try {
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
            setUsers(prev => [...prev, mockUser]);
            setIsAuthModalOpen(false);
            return { success: true, user: mockUser };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const loginWithBiometric = async () => {
        try {
            if (!window.PublicKeyCredential) {
                throw new Error('Biometric authentication is not supported on this device');
            }

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
            setUsers(prev => [...prev, mockUser]);
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

    const updateUserRole = (userId, newRole) => {
        setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user));
    };

    const deleteUser = (userId) => {
        setUsers(users.filter(user => user.id !== userId));
    };

    const value = {
        user,
        users,
        isAuthenticated: !!user,
        isAuthModalOpen,
        login,
        register,
        loginWithGoogle,
        loginWithBiometric,
        logout,
        openAuthModal,
        closeAuthModal,
        updateUserRole,
        deleteUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
