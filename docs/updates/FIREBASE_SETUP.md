# Firebase Authentication & Database Integration

This document explains how the Firebase integration works in the SJG E-commerce application.

## 🔥 Firebase Services Used

1. **Firebase Authentication** - For user login/registration
2. **Firebase Realtime Database** - For storing user data and profiles

## 📁 Project Structure

```
frontend/src/
├── config/
│   └── firebase.js              # Firebase configuration and initialization
├── services/
│   └── firebaseAuth.js          # Authentication service functions
├── context/
│   └── AuthContext.js           # Updated to use Firebase
└── utils/
    └── createAdminUser.js       # Utility to create admin user
```

## 🚀 Features Implemented

### 1. **User Registration**
- Email/Password registration
- Automatic user profile creation in Realtime Database
- User data stored with role (user/admin)
- Mobile number storage

### 2. **User Login**
- Email/Password authentication
- Google Sign-In integration
- Remember me functionality
- Automatic session management

### 3. **User Data Storage**

User data is stored in Firebase Realtime Database under `/users/{uid}`:

```json
{
  "users": {
    "user-uid-here": {
      "uid": "user-uid-here",
      "email": "user@example.com",
      "mobile": "+1234567890",
      "role": "user",
      "createdAt": "2026-01-05T13:00:00.000Z",
      "lastLogin": "2026-01-05T13:20:00.000Z"
    }
  }
}
```

### 4. **Admin Authentication**
- Separate admin role in database
- Admin users can access `/admin` routes
- Email: `sjgvxerox@gmail.com`
- Password: `password123`

## 🔧 Setup Instructions

### Step 1: Firebase Configuration (Already Done ✅)

Your Firebase project configuration is already set up in `frontend/src/config/firebase.js`:

- Project ID: `sjg-ecom`
- Database URL: `https://sjg-ecom-default-rtdb.firebaseio.com`

### Step 2: Install Dependencies (Already Done ✅)

```bash
cd frontend
npm install firebase
```

### Step 3: Firebase Console Setup

1. **Enable Authentication Methods:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `sjg-ecom`
   - Navigate to **Authentication** → **Sign-in method**
   - Enable:
     - ✅ Email/Password
     - ✅ Google (optional, for social login)

2. **Set Up Realtime Database:**
   - Navigate to **Realtime Database**
   - If not created, click **Create Database**
   - Choose location (e.g., us-central1)
   - Start in **test mode** for development
   
3. **Configure Database Rules:**
   
   Go to **Realtime Database** → **Rules** and update:

   ```json
   {
     "rules": {
       "users": {
         "$uid": {
           ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'",
           ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'"
         }
       }
     }
   }
   ```

   This ensures:
   - Users can only read/write their own data
   - Admins can read/write all user data

### Step 4: Create Admin User

#### Option A: Use Browser Console (Recommended)

1. Start your React app:
   ```bash
   cd frontend
   npm start
   ```

2. Open browser console (F12)

3. Run this code in the console:
   ```javascript
   // Import the function
   const createAdmin = async () => {
     const response = await fetch('/src/utils/createAdminUser.js');
     const module = await import('/src/utils/createAdminUser.js');
     await module.createAdminUser();
   };
   createAdmin();
   ```

#### Option B: Temporary Setup Component

Create a temporary component to register the admin user on first load.

1. Create `frontend/src/components/AdminSetup.js`:

```javascript
import React, { useState } from 'react';
import { createAdminUser } from '../utils/createAdminUser';

const AdminSetup = () => {
  const [result, setResult] = useState(null);
  
  const handleCreateAdmin = async () => {
    const res = await createAdminUser();
    setResult(res);
  };

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', margin: '20px' }}>
      <h2>Admin Setup</h2>
      <button onClick={handleCreateAdmin}>Create Admin User</button>
      {result && (
        <div style={{ marginTop: '10px' }}>
          {result.success ? (
            <p style={{ color: 'green' }}>✅ Admin created successfully!</p>
          ) : (
            <p style={{ color: 'red' }}>❌ Error: {result.error}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminSetup;
```

2. Temporarily add it to your Home page to create admin user
3. Remove it after admin is created

#### Option C: Firebase Console (Manual)

1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Email: `sjgvxerox@gmail.com`
4. Password: `password123`
5. Note the UID
6. Go to **Realtime Database**
7. Add this structure:
   ```json
   {
     "users": {
       "THE-UID-YOU-NOTED": {
         "uid": "THE-UID-YOU-NOTED",
         "email": "sjgvxerox@gmail.com",
         "role": "admin",
         "mobile": "",
         "createdAt": "2026-01-05T13:00:00.000Z"
       }
     }
   }
   ```

## 🧪 Testing the Integration

### Test User Registration:

1. Start the app: `npm start`
2. Click on "Register" or "Sign Up"
3. Fill in the form:
   - Email: `test@example.com`
   - Password: `Test123!`
   - Mobile: `1234567890`
4. Click "Register"
5. Check Firebase Console → Authentication → Users
6. Check Firebase Console → Realtime Database → users

### Test User Login:

1. Use the credentials you just created
2. Should redirect to home page
3. User should be logged in

### Test Admin Login:

1. Click "Login" and switch to "Admin" tab
2. Email: `sjgvxerox@gmail.com`
3. Password: `password123`
4. Should redirect to `/admin` dashboard

### Test Google Sign-In:

1. Click "Continue with Google"
2. Select a Google account
3. User should be logged in
4. Check Realtime Database for new user entry

## 📊 Database Structure

### Users Collection

```
users/
  └── {userId}/
      ├── uid: string
      ├── email: string
      ├── mobile: string (optional)
      ├── role: "user" | "admin"
      ├── displayName: string (for Google users)
      ├── photoURL: string (for Google users)
      ├── createdAt: timestamp
      ├── lastLogin: timestamp
      └── updatedAt: timestamp (when profile is updated)
```

## 🔐 Security Features

1. **Firebase Security Rules** - Control who can read/write data
2. **Email Verification** - Can be enabled in Firebase Console
3. **Password Requirements** - Minimum 6 characters (configurable)
4. **Role-based Access** - Users can't modify their own role
5. **Session Management** - Automatic token refresh

## 🐛 Troubleshooting

### Issue: "Firebase: Error (auth/unauthorized-domain)"

**Solution:** Add your domain to authorized domains:
1. Firebase Console → Authentication → Settings
2. Authorized domains → Add domain
3. Add `localhost` for development

### Issue: "Permission denied" when writing to database

**Solution:** Check your database rules:
1. Ensure rules allow authenticated users to write
2. For development, you can use test mode temporarily

### Issue: Google Sign-In popup blocked

**Solution:**
1. Allow popups in browser settings
2. Or use `signInWithRedirect` instead of `signInWithPopup`

### Issue: User not redirecting after login

**Solution:**
1. Check that user role is set correctly in database
2. Check console for errors
3. Ensure AuthContext is properly wrapping your app

## 🎯 Next Steps

1. ✅ Firebase SDK installed
2. ✅ Configuration set up
3. ✅ Authentication service created
4. ✅ Database integration complete
5. ⏳ Enable Email/Password auth in Firebase Console
6. ⏳ Set up database rules
7. ⏳ Create admin user
8. ⏳ Test login/registration

## 📚 Additional Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firebase Realtime Database Docs](https://firebase.google.com/docs/database)
- [Firebase Security Rules](https://firebase.google.com/docs/database/security)

## 💡 Tips

- Always use environment variables for sensitive config in production
- Enable email verification for added security
- Regularly backup your Realtime Database
- Monitor authentication usage in Firebase Console
- Set up proper security rules before production deployment
