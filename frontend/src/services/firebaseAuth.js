import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { API_ENDPOINTS } from '../config';

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

/**
 * Register a new user with email and password
 */
export const registerWithEmail = async (email, password, userData) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store additional user data in MongoDB
        const mongoUser = {
            uid: user.uid,
            email: user.email,
            display_name: userData.name || '',
            role: (user.email === 'sjgvxerox@gmail.com' || user.email === 'admin2.sjg@gmail.com') ? 'admin' : (userData.role || 'user'),
            mobile: userData.mobile || ''
        };

        await fetch(API_ENDPOINTS.USERS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mongoUser)
        });

        return {
            success: true,
            user: mongoUser
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

        // Get user data from MongoDB
        return await getCurrentUserData(user.uid);
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

        // Sync user with MongoDB (Upsert)
        const mongoUser = {
            uid: user.uid,
            email: user.email,
            display_name: user.displayName || '',
            photo_url: user.photoURL || '',
            role: (user.email === 'sjgvxerox@gmail.com' || user.email === 'admin2.sjg@gmail.com') ? 'admin' : 'user'
        };

        const response = await fetch(API_ENDPOINTS.USERS, {
            method: 'POST', // Backend handles upsert
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mongoUser)
        });

        const data = await response.json();

        return {
            success: true,
            user: data
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
 * Get current user data from database (MongoDB)
 */
export const getCurrentUserData = async (uid) => {
    try {
        const response = await fetch(`${API_ENDPOINTS.USERS}${uid}/`);

        if (response.ok) {
            const userData = await response.json();
            // Map backend fields to frontend expected fields if necessary
            // e.g. display_name -> displayName
            return {
                success: true,
                user: {
                    ...userData,
                    displayName: userData.display_name, // Map for compatibility
                    photoURL: userData.photo_url
                }
            };
        } else {
            // User might exist in Auth but not in Mongo yet?
            return {
                success: false,
                error: 'User data not found in MongoDB'
            };
        }
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
        // Map updates to backend format if needed
        const mongoUpdates = { ...updates };
        if (updates.displayName) mongoUpdates.display_name = updates.displayName;
        if (updates.photoURL) mongoUpdates.photo_url = updates.photoURL;

        const response = await fetch(`${API_ENDPOINTS.USERS}${uid}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mongoUpdates)
        });

        if (!response.ok) throw new Error('Failed to update');

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
