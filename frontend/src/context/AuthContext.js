import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useUser, useClerk, useSignIn } from '@clerk/clerk-react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const { user: clerkUser, isLoaded, isSignedIn } = useUser();
    const { signOut, openSignIn, openSignUp } = useClerk();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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
        if (!isLoaded) return;

        if (isSignedIn && clerkUser) {
            const mappedUser = {
                uid: clerkUser.id,
                email: clerkUser.primaryEmailAddress?.emailAddress,
                name: clerkUser.fullName || clerkUser.username || 'User',
                photoURL: clerkUser.imageUrl,
                role: clerkUser.publicMetadata?.role || 'user'
            };
            setUser(mappedUser);
            localStorage.setItem('user', JSON.stringify(mappedUser));
            syncUserWithBackend(mappedUser);
        } else {
            setUser(null);
            localStorage.removeItem('user');
        }
        setLoading(false);
    }, [isLoaded, isSignedIn, clerkUser]);

    // Backward-compatible wrappers mapped to Clerk
    const login = () => {
        openSignIn();
    };

    const register = () => {
        openSignUp();
    };

    const logout = async () => {
        setLoading(true);
        await signOut();
        setUser(null);
        localStorage.removeItem('user');
        setLoading(false);
    };

    const { signIn, setActive } = useSignIn();

    const googleLogin = () => {
        openSignIn();
    };

    const biometricLogin = async () => {
        if (!signIn) return;
        try {
            const passkeySignIn = await signIn.authenticateWithPasskey();
            if (passkeySignIn.status === "complete") {
                await setActive({ session: passkeySignIn.createdSessionId });
            }
        } catch (err) {
            console.error("Biometric authentication failed:", err);
            // Optionally fallback to standard login if passkey fails
            openSignIn();
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            googleLogin,
            biometricLogin,
            demoMode: false
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
