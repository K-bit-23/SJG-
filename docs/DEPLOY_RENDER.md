# 🚀 Deploy to Render - Updated Backend

## Current Status
- **Your Render Backend**: https://sjg-backend.onrender.com/
- **Status**: ✅ Server running, API working
- **Database**: ✅ MongoDB connected (but empty)
- **Issue**: Missing seeded data and root path error

---

## 🎯 Deployment Steps

### Option A: Update via Git (Recommended)

#### 1. Initialize Git Repository
```bash
cd c:/Users/KARTHIKEYAN/OneDrive/Desktop/final/SJG-/backend_new

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Updated backend with MongoDB integration"
```

#### 2. Connect to GitHub
```bash
# Create new repo on GitHub: https://github.com/new
# Name it: sjg-backend

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/sjg-backend.git

# Push
git branch -M main
git push -u origin main
```

#### 3. Connect Render to GitHub
1. Go to https://dashboard.render.com
2. Click your existing service "sjg-backend"
3. Settings → Build & Deploy
4. Connect to your new GitHub repository
5. Click "Manual Deploy" → "Deploy latest commit"

---

### Option B: Manual File Upload

Since Render doesn't support direct file upload, you'll need to use Git (Option A).

---

## 📝 Environment Variables on Render

Make sure these are set in Render Dashboard:

1. Go to https://dashboard.render.com
2. Select your service
3. Environment → Environment Variables
4. Add/Update these:

```
MONGODB_URI=mongodb+srv://karthi:karthi07@sjg.cdlgflc.mongodb.net/?retryWrites=true&w=majority&appName=SJG
MONGODB_NAME=sjg_db
SECRET_KEY=your-secret-key-here
DEBUG=False
```

---

## 🔧 Configuration Files

### 1. Create `build.sh`
```bash
#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --no-input
```

### 2. Update `requirements.txt`
Already correct in your new backend.

### 3. Create `render.yaml` (Optional)
```yaml
services:
  - type: web
    name: sjg-backend
    env: python
    buildCommand: "./build.sh"
    startCommand: "gunicorn backend_project.wsgi:application"
    envVars:
      - key: PYTHON_VERSION
        value: 3.12.0
      - key: MONGODB_URI
        sync: false
      - key: MONGODB_NAME
        value: sjg_db
```

---

## 🌱 Seed Data After Deployment

### Method 1: Render Web Shell
1. Go to Render Dashboard → Your Service
2. Click "Shell" tab
3. Run:
```bash
python seed_products.py
```

### Method 2: Local Script to Remote DB
Create this file locally and run it:

```python
# seed_remote.py
import pymongo
import certifi
from datetime import datetime

# Use production MongoDB URI
uri = "mongodb+srv://karthi:karthi07@sjg.cdlgflc.mongodb.net/?retryWrites=true&w=majority&appName=SJG"

client = pymongo.MongoClient(uri, tlsCAFile=certifi.where())
db = client['sjg_db']

products = [
    {
        "name": "Premium Notebook",
        "category": "Stationery",
        "price": 129.99,
        "description": "High-quality spiral notebook",
        "stock": 50,
        "image": "notebook.jpg",
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    },
    # ... add all products
]

db.products.insert_many(products)
print(f"Seeded {len(products)} products!")
```

Run: `python seed_remote.py`

---

## ✅ Verify Deployment

After deploying, test these URLs:

1. **Products API**: https://sjg-backend.onrender.com/api/products/
   - Should show array of products

2. **Orders API**: https://sjg-backend.onrender.com/api/orders/
   - Should show empty array

3. **Dashboard**: https://sjg-backend.onrender.com/api/dashboard/stats/
   - Should show statistics

---

## 🔍 Troubleshooting

### "Application failed to respond"
- Check logs in Render Dashboard
- Verify `gunicorn` is in requirements.txt
- Check `WSGI_APPLICATION` setting

### "MongoDB connection timeout"
- Verify MongoDB Atlas allows Render IPs
- In Atlas: Network Access → Add `0.0.0.0/0`
- Check environment variables are set

### "Static files not found"
- Run `python manage.py collectstatic` in shell
- Verify `STATIC_ROOT` and `STATIC_URL` settings
- Check whitenoise is installed

---

## 🎯 Quick Deploy Checklist

- [ ] Git repository initialized
- [ ] Code committed to GitHub
- [ ] Render connected to GitHub repo
- [ ] Environment variables set
- [ ] Deploy triggered
- [ ] Build completed successfully
- [ ] Migrations run
- [ ] Data seeded
- [ ] API endpoints tested
- [ ] Frontend updated with new URL

---

## 📱 Update Frontend

After successful deployment, update your frontend's API URL:

```javascript
// In frontend/src/config.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  "https://sjg-backend.onrender.com";
```

---

## 🚀 Expected Timeline

| Step | Time |
|------|------|
| Git setup | 2 minutes |
| Push to GitHub | 1 minute |
| Render deployment | 5-10 minutes |
| Seed data | 2 minutes |
| Verify & test | 3 minutes |
| **Total** | **~15-20 minutes** |

---

**Note**: Render free tier may "spin down" after inactivity. First request might take 30-60 seconds to wake up the service.
