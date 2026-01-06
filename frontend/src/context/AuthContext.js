import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle as firebaseGoogleLogin,
    logout as firebaseLogout,
    onAuthChange,
    getCurrentUserData
} from '../services/firebaseAuth';
import {
    getAllUsers as fetchAllUsers,
    updateUserRole as updateRole,
    deleteUserData
} from '../services/firebaseUsers';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [modalView, setModalView] = useState('login'); // 'login' | 'register' | 'admin'

    useEffect(() => {
        // Listen to Firebase auth state changes
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            if (firebaseUser) {
                // User is signed in, get additional data from database
                const result = await getCurrentUserData(firebaseUser.uid);
                if (result.success) {
                    const userData = result.user;
                    // HARDCODE ADMIN override for specific email
                    if (firebaseUser.email === 'sjgvxerox@gmail.com' || firebaseUser.email === 'admin2.sjg@gmail.com') {
                        userData.role = 'admin';
                    }
                    setUser(userData);
                } else {
                    // Fallback to basic user info
                    let assignedRole = 'user';
                    if (firebaseUser.email === 'sjgvxerox@gmail.com' || firebaseUser.email === 'admin2.sjg@gmail.com') {
                        assignedRole = 'admin';
                    }
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        role: assignedRole
                    });
                }
            } else {
                // User is signed out
                setUser(null);
            }
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const login = async (email, password, rememberMe = false) => {
        try {
            const result = await loginWithEmail(email, password);

            if (result.success) {
                setUser(result.user);
                setIsAuthModalOpen(false);

                // Store user preference for remember me (optional)
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                }
            }

            return result;
        } catch (error) {
            console.error('Login error in context:', error);
            return { success: false, error: 'Login failed. Please try again.' };
        }
    };

    const register = async (userData) => {
        try {
            const { email, password, ...additionalData } = userData;
            const result = await registerWithEmail(email, password, additionalData);

            if (result.success) {
                setUser(result.user);
                setIsAuthModalOpen(false);
            }

            return result;
        } catch (error) {
            console.error('Registration error in context:', error);
            return { success: false, error: 'Registration failed. Please try again.' };
        }
    };

    const loginWithGoogle = async () => {
        try {
            const result = await firebaseGoogleLogin();

            if (result.success) {
                setUser(result.user);
                setIsAuthModalOpen(false);
            }

            return result;
        } catch (error) {
            console.error('Google login error in context:', error);
            return { success: false, error: 'Google login failed. Please try again.' };
        }
    };

    const loginWithBiometric = async () => {
        // Placeholder for biometric authentication
        // You can implement Web Authentication API here
        return {
            success: false,
            error: 'Biometric authentication is not yet implemented.'
        };
    };

    const logout = async () => {
        try {
            await firebaseLogout();
            setUser(null);
            localStorage.removeItem('rememberMe');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const openAuthModal = (view = 'login') => {
        setModalView(view);
        setIsAuthModalOpen(true);
    };

    const closeAuthModal = () => setIsAuthModalOpen(false);

    // Admin User Management Functions
    const getAllUsers = async () => {
        const result = await fetchAllUsers();
        if (result.success) {
            setUsers(result.users);
        }
        return result;
    };

    const updateUserRole = async (uid, newRole) => {
        const result = await updateRole(uid, newRole);
        if (result.success) {
            // Update local state
            setUsers(prev => prev.map(u =>
                u.id === uid ? { ...u, role: newRole } : u
            ));
        }
        return result;
    };

    const deleteUser = async (uid) => {
        const result = await deleteUserData(uid);
        if (result.success) {
            // Update local state
            setUsers(prev => prev.filter(u => u.id !== uid));
        }
        return result;
    };

    // Fetch all users if admin
    useEffect(() => {
        if (user?.role === 'admin') {
            getAllUsers();
        }
    }, [user]);

    const value = {
        user,
        users,
        loading,
        isAuthenticated: !!user,
        isAuthModalOpen,
        modalView,
        login,
        register,
        loginWithGoogle,
        loginWithBiometric,
        logout,
        openAuthModal,
        closeAuthModal,
        // Admin functions
        getAllUsers,
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