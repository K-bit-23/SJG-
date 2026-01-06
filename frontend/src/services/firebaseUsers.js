import { ref, get, update, remove, query, orderByChild } from 'firebase/database';
import { database } from '../config/firebase';

/**
 * Get all users from Firebase Realtime Database
 * Admin function only
 */
export const getAllUsers = async () => {
    try {
        const usersRef = ref(database, 'users');
        const snapshot = await get(usersRef);

        if (snapshot.exists()) {
            const usersData = snapshot.val();
            // Convert object to array
            const usersArray = Object.keys(usersData).map(uid => ({
                id: uid,
                ...usersData[uid]
            }));

            return {
                success: true,
                users: usersArray
            };
        }

        return {
            success: true,
            users: []
        };
    } catch (error) {
        console.error('Get all users error:', error);
        return {
            success: false,
            error: 'Failed to fetch users'
        };
    }
};

/**
 * Update user role
 * Admin function only
 */
export const updateUserRole = async (uid, newRole) => {
    try {
        const userRef = ref(database, `users/${uid}`);
        await update(userRef, {
            role: newRole,
            updatedAt: new Date().toISOString()
        });

        return { success: true };
    } catch (error) {
        console.error('Update user role error:', error);
        return {
            success: false,
            error: 'Failed to update user role'
        };
    }
};

/**
 * Delete user
 * Admin function only - this only removes from database, not from Auth
 */
export const deleteUserData = async (uid) => {
    try {
        const userRef = ref(database, `users/${uid}`);
        await remove(userRef);

        return { success: true };
    } catch (error) {
        console.error('Delete user error:', error);
        return {
            success: false,
            error: 'Failed to delete user'
        };
    }
};

/**
 * Get users by role
 */
export const getUsersByRole = async (role) => {
    try {
        const usersRef = ref(database, 'users');
        const usersQuery = query(usersRef, orderByChild('role'));
        const snapshot = await get(usersQuery);

        if (snapshot.exists()) {
            const usersData = snapshot.val();
            const usersArray = Object.keys(usersData)
                .map(uid => ({ id: uid, ...usersData[uid] }))
                .filter(user => user.role === role);

            return {
                success: true,
                users: usersArray
            };
        }

        return {
            success: true,
            users: []
        };
    } catch (error) {
        console.error('Get users by role error:', error);
        return {
            success: false,
            error: 'Failed to fetch users by role'
        };
    }
};

/**
 * Get user statistics
 */
export const getUserStats = async () => {
    try {
        const result = await getAllUsers();

        if (result.success) {
            const users = result.users;
            return {
                success: true,
                stats: {
                    total: users.length,
                    admins: users.filter(u => u.role === 'admin').length,
                    users: users.filter(u => u.role === 'user').length,
                    activeToday: users.filter(u => {
                        const lastLogin = new Date(u.lastLogin);
                        const today = new Date();
                        return lastLogin.toDateString() === today.toDateString();
                    }).length
                }
            };
        }

        return result;
    } catch (error) {
        console.error('Get user stats error:', error);
        return {
            success: false,
            error: 'Failed to get user statistics'
        };
    }
};
