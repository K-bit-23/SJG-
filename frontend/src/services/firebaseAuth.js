import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    sendPasswordResetEmail
} from 'firebase/auth';
import { ref, set, get, update } from 'firebase/database';
import { auth, database } from '../config/firebase';

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

/**
 * Register a new user with email and password
 */
export const registerWithEmail = async (email, password, userData) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store additional user data in Realtime Database
        const userRef = ref(database, `users/${user.uid}`);
        await set(userRef, {
            uid: user.uid,
            email: user.email,
            mobile: userData.mobile || '',
            role: (user.email === 'sjgvxerox@gmail.com' || user.email === 'admin2.sjg@gmail.com') ? 'admin' : (userData.role || 'user'),
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        });

        return {
            success: true,
            user: {
                uid: user.uid,
                email: user.email,
                mobile: userData.mobile || '',
                role: (user.email === 'sjgvxerox@gmail.com' || user.email === 'admin2.sjg@gmail.com') ? 'admin' : (userData.role || 'user')
            }
        };
    } catch (error) {
        console.error('Registration error:', error);
        return {
            success: false,
            error: getErrorMessage(error.code)
        };
    }
};

/**
 * Sign in with email and password
 */
export const loginWithEmail = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Get user data from database
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);

        let userData = {
            uid: user.uid,
            email: user.email,
            role: (user.email === 'sjgvxerox@gmail.com' || user.email === 'admin2.sjg@gmail.com') ? 'admin' : 'user'
        };

        if (snapshot.exists()) {
            userData = { ...userData, ...snapshot.val() };

            // Update last login
            await update(userRef, {
                lastLogin: new Date().toISOString()
            });
        }

        return {
            success: true,
            user: userData
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            error: getErrorMessage(error.code)
        };
    }
};

/**
 * Sign in with Google
 */
export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if user exists in database
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);

        let userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: (user.email === 'sjgvxerox@gmail.com' || user.email === 'admin2.sjg@gmail.com') ? 'admin' : 'user'
        };

        if (!snapshot.exists()) {
            // New user, create profile
            await set(userRef, {
                ...userData,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            });
        } else {
            // Existing user, update last login
            userData = { ...userData, ...snapshot.val() };
            await update(userRef, {
                lastLogin: new Date().toISOString()
            });
        }

        return {
            success: true,
            user: userData
        };
    } catch (error) {
        console.error('Google login error:', error);
        return {
            success: false,
            error: getErrorMessage(error.code)
        };
    }
};

/**
 * Sign out
 */
export const logout = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        return {
            success: false,
            error: 'Failed to logout'
        };
    }
};

/**
 * Get current user data from database
 */
export const getCurrentUserData = async (uid) => {
    try {
        const userRef = ref(database, `users/${uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
            return {
                success: true,
                user: snapshot.val()
            };
        }

        return {
            success: false,
            error: 'User data not found'
        };
    } catch (error) {
        console.error('Get user data error:', error);
        return {
            success: false,
            error: 'Failed to fetch user data'
        };
    }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (uid, updates) => {
    try {
        const userRef = ref(database, `users/${uid}`);
        await update(userRef, {
            ...updates,
            updatedAt: new Date().toISOString()
        });

        return { success: true };
    } catch (error) {
        console.error('Update profile error:', error);
        return {
            success: false,
            error: 'Failed to update profile'
        };
    }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        console.error('Password reset error:', error);
        return {
            success: false,
            error: getErrorMessage(error.code)
        };
    }
};

/**
 * Listen to auth state changes
 */
export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};

/**
 * Get user-friendly error messages
 */
const getErrorMessage = (errorCode) => {
    switch (errorCode) {
        case 'auth/email-already-in-use':
            return 'This email is already registered. Please login instead.';
        case 'auth/invalid-email':
            return 'Invalid email address.';
        case 'auth/operation-not-allowed':
            return 'Operation not allowed. Please contact support.';
        case 'auth/weak-password':
            return 'Password is too weak. Please use at least 6 characters.';
        case 'auth/user-disabled':
            return 'This account has been disabled.';
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password.';
        case 'auth/invalid-credential':
            return 'Invalid email or password.';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your connection.';
        case 'auth/popup-closed-by-user':
            return 'Sign-in popup was closed.';
        default:
            return 'An error occurred. Please try again.';
    }
};
