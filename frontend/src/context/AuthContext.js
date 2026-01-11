import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Check if Firebase is properly configured
const FIREBASE_CONFIGURED = process.env.REACT_APP_FIREBASE_API_KEY &&
    !process.env.REACT_APP_FIREBASE_API_KEY.includes('Dummy');

let auth = null;
let firebaseAuthMethods = {};

// Only import Firebase if configured
if (FIREBASE_CONFIGURED) {
    const { auth: firebaseAuth } = require('../firebaseConfig');
    const {
        createUserWithEmailAndPassword,
        signInWithEmailAndPassword,
        signOut,
        onAuthStateChanged,
        GoogleAuthProvider,
        signInWithPopup
    } = require('firebase/auth');

    auth = firebaseAuth;
    firebaseAuthMethods = {
        createUserWithEmailAndPassword,
        signInWithEmailAndPassword,
        signOut,
        onAuthStateChanged,
        GoogleAuthProvider,
        signInWithPopup
    };
}

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [demoMode] = useState(!FIREBASE_CONFIGURED);

    // Sync user with backend
    const syncUserWithBackend = async (userData) => {
        try {
            await axios.post('/api/users/', {
                uid: userData.uid,
                email: userData.email,
                display_name: userData.name,
                role: userData.role || 'user'
            });
        } catch (error) {
            console.warn("Backend sync failed (backend may be offline):", error.message);
        }
    };

    useEffect(() => {
        // Check localStorage first
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        if (FIREBASE_CONFIGURED && auth) {
            const unsubscribe = firebaseAuthMethods.onAuthStateChanged(auth, async (firebaseUser) => {
                if (firebaseUser) {
                    const userData = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        name: firebaseUser.displayName || 'User',
                        photoURL: firebaseUser.photoURL,
                        role: 'user'
                    };
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                } else if (!storedUser) {
                    setUser(null);
                }
                setLoading(false);
            });
            return () => unsubscribe();
        } else {
            setLoading(false);
        }
    }, []);

    const register = async (name, email, password) => {
        if (demoMode) {
            // DEMO MODE: Create local user
            const demoUser = {
                uid: 'demo_' + Date.now(),
                email: email,
                name: name,
                role: email.includes('admin') ? 'admin' : 'user'
            };
            setUser(demoUser);
            localStorage.setItem('user', JSON.stringify(demoUser));
            await syncUserWithBackend(demoUser);
            return { user: demoUser };
        }

        // FIREBASE MODE
        const result = await firebaseAuthMethods.createUserWithEmailAndPassword(auth, email, password);
        const userData = {
            uid: result.user.uid,
            email: result.user.email,
            name: name,
            role: 'user'
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        await syncUserWithBackend(userData);
        return result;
    };

    const login = async (email, password) => {
        if (demoMode) {
            // DEMO MODE: Accept any credentials
            // Special admin check
            const isAdmin = email === 'admin@sjg.com' && password === 'admin123';
            const demoUser = {
                uid: isAdmin ? 'admin_001' : 'user_' + Date.now(),
                email: email,
                name: isAdmin ? 'Admin User' : email.split('@')[0],
                role: isAdmin ? 'admin' : 'user'
            };
            setUser(demoUser);
            localStorage.setItem('user', JSON.stringify(demoUser));
            await syncUserWithBackend(demoUser);
            return { user: demoUser };
        }

        // FIREBASE MODE
        const result = await firebaseAuthMethods.signInWithEmailAndPassword(auth, email, password);
        const userData = {
            uid: result.user.uid,
            email: result.user.email,
            name: result.user.displayName || result.user.email.split('@')[0],
            role: 'user'
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        await syncUserWithBackend(userData);
        return result;
    };

    const googleLogin = async () => {
        if (demoMode) {
            // DEMO MODE: Simulate Google login
            const demoUser = {
                uid: 'google_demo_' + Date.now(),
                email: 'demo.google@gmail.com',
                name: 'Google Demo User',
                photoURL: 'https://ui-avatars.com/api/?name=Google+User&background=4285F4&color=fff',
                role: 'user'
            };
            setUser(demoUser);
            localStorage.setItem('user', JSON.stringify(demoUser));
            await syncUserWithBackend(demoUser);
            return { user: demoUser };
        }

        // FIREBASE MODE
        const provider = new firebaseAuthMethods.GoogleAuthProvider();
        const result = await firebaseAuthMethods.signInWithPopup(auth, provider);
        const userData = {
            uid: result.user.uid,
            email: result.user.email,
            name: result.user.displayName,
            photoURL: result.user.photoURL,
            role: 'user'
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        await syncUserWithBackend(userData);
        return result;
    };

    const logout = async () => {
        if (!demoMode && auth) {
            await firebaseAuthMethods.signOut(auth);
        }
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, register, login, googleLogin, logout, loading, demoMode }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
