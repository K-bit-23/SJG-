import { API_ENDPOINTS } from '../config';

/**
 * Get all users from MongoDB API
 * Admin function only
 */
export const getAllUsers = async () => {
    try {
        const response = await fetch(API_ENDPOINTS.USERS);

        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }

        const users = await response.json();
        // Map backend 'uid' to 'id' for frontend compatibility
        const formattedUsers = users.map(user => ({
            ...user,
            id: user.uid
        }));

        return {
            success: true,
            users: formattedUsers
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
        const response = await fetch(`${API_ENDPOINTS.USERS}${uid}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role: newRole })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update user role');
        }

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
        const response = await fetch(`${API_ENDPOINTS.USERS}${uid}/`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete user');
        }

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
        const response = await fetch(`${API_ENDPOINTS.USERS}?role=${role}`);

        if (!response.ok) {
            throw new Error('Failed to fetch users by role');
        }

        const users = await response.json();
        const formattedUsers = users.map(user => ({
            ...user,
            id: user.uid
        }));

        return {
            success: true,
            users: formattedUsers
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
                        if (!u.last_login) return false;
                        const lastLogin = new Date(u.last_login);
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
