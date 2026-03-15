# 🔐 Admin Account Setup Instructions

## Quick Setup (3 Steps)

### Step 1: Visit the Admin Setup Page
Open your browser and navigate to:
```
http://localhost:3001/admin-setup
```

### Step 2: Click "Create Admin Account"
- Email: **sjgvxerox@gmail.com**
- Password: **password123**
- Role: **Admin**

Click the **"🚀 Create Admin Account"** button.

### Step 3: Login
Once the admin account is created:
1. Go back to home page or click "← Back to Home"
2. Click the "Login" button in the navbar
3. Enter credentials:
   - **Email:** sjgvxerox@gmail.com
   - **Password:** password123
4. Click "Login"
5. **You'll be automatically redirected to the admin dashboard!** 🎉

---

## ⚠️ Important Notes

### Before Creating Admin:
- ✅ Make sure Firebase Authentication is enabled
- ✅ Enable Email/Password sign-in method in Firebase Console
- ✅ Create Realtime Database in Firebase Console
- ✅ Set up database security rules

### After Creating Admin:
- 🗑️ **Delete the admin setup page** for security:
  - Delete: `frontend/src/pages/AdminSetupPage.js`
  - Remove from `App.js`: Import and route
  
---

## 🔄 Alternative: Manual Creation in Firebase Console

If the setup page doesn't work, create manually:

### 1. Firebase Console > Authentication
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select **sjg-ecom** project
3. Click **Authentication** → **Users**
4. Click **Add User**
5. Email: `sjgvxerox@gmail.com`
6. Password: `password123`
7. Click **Add User**
8. **Note the UID** (copy it)

### 2. Firebase Console > Realtime Database
1. Go to **Realtime Database**
2. Navigate to root
3. Add this structure:
```json
{
  "users": {
    "PASTE-THE-UID-HERE": {
      "uid": "PASTE-THE-UID-HERE",
      "email": "sjgvxerox@gmail.com",
      "role": "admin",
      "mobile": "",
      "createdAt": "2026-01-05T13:00:00.000Z",
      "lastLogin": "2026-01-05T13:00:00.000Z"
    }
  }
}
```
4. Click **Add**

---

## 🧪 Testing Admin Login

### Test Steps:
1. Open your app: http://localhost:3001
2. Click **Login** button (top right)
3. Enter:
   - Email: `sjgvxerox@gmail.com`
   - Password: `password123`
4. Click **Login**

### Expected Result:
✅ Successfully logged in  
✅ Automatically redirected to `/admin` dashboard  
✅ Admin navbar visible  
✅ Access to: Dashboard, Inventory, Orders, Users  

---

## 🔒 Security Checklist

After admin is created and tested:

- [ ] Delete `AdminSetupPage.js`
- [ ] Remove route from `App.js`
- [ ] Change admin password (recommended)
- [ ] Enable email verification
- [ ] Set up 2FA (optional)
- [ ] Review Firebase security rules

---

## 🆘 Troubleshooting

### "Email already in use"
✅ Good! Admin already exists. Just login.

### "Permission denied"
- Check Firebase Authentication is enabled
- Verify Email/Password provider is enabled
- Check internet connection

### "User created but can't login"
- Check Realtime Database has user data
- Verify user has `role: "admin"`
- Check Firebase Console for the user

### "Redirects but shows blank page"
- Check browser console for errors
- Verify all admin components are imported
- Check Firebase config is correct

---

## 📞 Need Help?

1. Check browser console (F12) for errors
2. Check Firebase Console for user creation
3. Verify database rules allow write access
4. Review `FIREBASE_SETUP.md` for detailed setup

---

**Quick Link:** http://localhost:3001/admin-setup

**Default Admin:**
- Email: sjgvxerox@gmail.com
- Password: password123
