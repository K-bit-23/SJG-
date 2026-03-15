import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useClerk, useSignIn, useSignUp } from '@clerk/clerk-react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const { user: clerkUser, isLoaded, isSignedIn } = useUser();
    const { signOut, setActive } = useClerk();
    const { signIn } = useSignIn();
    const { signUp } = useSignUp();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Sync user with backend
    const syncUserWithBackend = async (userData) => {
        try {
            await api.post('users/', {
                uid: userData.uid,
                email: userData.email,
                display_name: userData.name,
                role: userData.role || 'user'
            });
        } catch (error) {
            console.warn("Backend sync failed:", error.message);
        }
    };

    useEffect(() => {
        if (isLoaded) {
            if (isSignedIn && clerkUser) {
                const userData = {
                    uid: clerkUser.id,
                    email: clerkUser.primaryEmailAddress?.emailAddress,
                    name: clerkUser.fullName || clerkUser.username || 'User',
                    photoURL: clerkUser.imageUrl,
                    role: clerkUser.publicMetadata?.role || (clerkUser.primaryEmailAddress?.emailAddress === 'admin@sjg.com' ? 'admin' : 'user')
                };
                setUser(userData);
                syncUserWithBackend(userData);
            } else {
                setUser(null);
            }
            setLoading(false);
        }
    }, [isLoaded, isSignedIn, clerkUser]);

    const login = async (email, password) => {
        try {
            const result = await signIn.create({
                identifier: email,
                password,
            });
            if (result.status === 'complete') {
                await setActive({ session: result.createdSessionId });
            }
            return result;
        } catch (err) {
            throw err;
        }
    };

    const register = async (name, email, password) => {
        try {
            const result = await signUp.create({
                emailAddress: email,
                password,
            });
            // Clerk usually requires email verification after signup
            // For now, we assume simple signup if configured that way
            if (result.status === 'complete') {
                await setActive({ session: result.createdSessionId });
            }
            return result;
        } catch (err) {
            throw err;
        }
    };

    const logout = async () => {
        await signOut();
        setUser(null);
    };

    const googleLogin = async () => {
        try {
            await signIn.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/sso-callback",
                redirectUrlComplete: "/",
            });
        } catch (err) {
            console.error("Google login failed:", err);
        }
    };

    return (
        <AuthContext.Provider value={{ user, register, login, googleLogin, logout, loading, demoMode: false }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

