import { registerWithEmail } from '../services/firebaseAuth';

/**
 * Utility function to create an admin user
 * This should be run once to create the initial admin account
 */
export const createAdminUser = async () => {
    const adminData = {
        email: 'sjgvxerox@gmail.com',
        password: 'password123',
        mobile: '',
        role: 'admin'
    };

    try {
        const result = await registerWithEmail(
            adminData.email,
            adminData.password,
            {
                mobile: adminData.mobile,
                role: adminData.role
            }
        );

        if (result.success) {
            console.log('✅ Admin user created successfully:', result.user);
            return result;
        } else {
            console.error('❌ Failed to create admin user:', result.error);
            return result;
        }
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Instructions:
 * 
 * To create the admin user, open browser console on your app and run:
 * 
 * import { createAdminUser } from './utils/createAdminUser';
 * createAdminUser();
 * 
 * Or you can add a temporary button in your app that calls this function.
 */
