# MongoDB User Management Migration

I have migrated the "Admin Panel" user management system from Firebase Realtime Database to MongoDB.
Firebase Authentication is STILL USED for login/signup security, but all user profiles, roles, and management features now use MongoDB.

## Changes Made:

### Backend (Django)
1.  **New Collection**: `users` in MongoDB.
2.  **New Serializer**: `UserSerializer` in `backend/api/serializers.py` (fields: uid, email, display_name, photo_url, role, etc.).
3.  **New Views**: `UserListCreateView` and `UserDetailView` in `backend/api/views.py`.
    *   `POST /api/users/`: Upserts a user (creates if new, updates if exists). Used during login/signup sync.
    *   `GET /api/users/`: Lists all users (for Admin Panel).
    *   `PUT /api/users/<uid>/`: Updates specific user (e.g., changing roles).
4.  **Updated Dashboard**: `DashboardStatsView` now includes a count of `total_users`.

### Frontend (React)
1.  **Config**: Added `USERS` endpoint to `src/config.js`.
2.  **Service Migration**:
    *   Updated `src/services/firebaseUsers.js`: Now fetches all users, updates roles, and deletes users via the **MongoDB API** instead of Firebase Realtime DB.
    *   Updated `src/services/firebaseAuth.js`:
        *   `registerWithEmail`: Now saves the new user profile to MongoDB.
        *   `loginWithGoogle`: Now syncs/upserts the Google user profile to MongoDB.
        *   `loginWithEmail`: Now fetches the user profile from MongoDB.
        *   `getCurrentUserData`: Now fetches from MongoDB.
        *   `updateUserProfile`: Now updates MongoDB.

## How it works
1.  **Login**: User logs in via Firebase Auth.
2.  **Sync**: The frontend immediately sends the user data to the backend (`POST /api/users/`).
3.  **Storage**: Backend saves/updates the user in MongoDB.
4.  **Admin Panel**: The "User Management" page now fetches the list of users from MongoDB (`GET /api/users/`). Role updates are sent to the backend.

## Verification
1.  Log out and Log in.
2.  Check the Admin Dashboard -> User Management page. You should see users listed (initially empty or just you until you log in).
3.  The Dashboard stats should show the correct user count.
