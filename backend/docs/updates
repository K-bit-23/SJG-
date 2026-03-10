# 🚀 RENDER DEPLOYMENT GUIDE

## ✅ Step 1: Prepare Git Repository (DONE ✓)

Your code is now committed to git locally.

---

## 📤 Step 2: Push to GitHub

### Option A: Create New Repository on GitHub
1. Go to https://github.com/new
2. Repository name: `sjg-backend`
3. Description: "SJG Stationery Backend API with MongoDB"
4. **Keep it Public** (or Private if you prefer)
5. **DO NOT** initialize with README, .gitignore, or license
6. Click **"Create repository"**

### Option B: Use Existing Repository
If you already have a repository, we'll push to that.

---

## 🔗 Step 3: Connect to GitHub

After creating the repository on GitHub, you'll see this:

```bash
# Copy and run these commands:

git branch -M main

git remote add origin https://github.com/YOUR_USERNAME/sjg-backend.git

git push -u origin main
```

**Replace `YOUR_USERNAME` with your GitHub username!**

---

## 🌐 Step 4: Deploy to Render

### A. Go to Render Dashboard
1. Visit: https://dashboard.render.com
2. Click **"New +"** button (top right)
3. Select **"Web Service"**

### B. Connect Repository
1. Click **"Connect a repository"**
2. If first time:
   - Click **"Connect GitHub"**
   - Authorize Render to access your GitHub
3. Find and select **"sjg-backend"** repository
4. Click **"Connect"**

### C. Configure Service
Fill in these settings:

**Name**: `sjg-backend` (or keep existing)

**Region**: Choose closest to you

**Branch**: `main`

**Root Directory**: Leave empty

**Runtime**: `Python 3`

**Build Command**:
```bash
./build.sh
```

**Start Command**:
```bash
gunicorn backend_project.wsgi:application
```

**Instance Type**: `Free`

### D. Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**

Add these variables:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://karthi:karthi07@sjg.cdlgflc.mongodb.net/?retryWrites=true&w=majority&appName=SJG` |
| `MONGODB_NAME` | `sjg_db` |
| `SECRET_KEY` | `your-secret-key-here-change-this` |
| `DEBUG` | `False` |
| `PYTHON_VERSION` | `3.12.0` |

**Important**: Generate a secure SECRET_KEY!

### E. Deploy
1. Click **"Create Web Service"**
2. Render will start building...
3. Watch the logs for progress
4. Wait 5-10 minutes for deployment

---

## ✅ Step 5: Verify Deployment

Once deployed, test these URLs:

### 1. Check API Endpoints
```
https://sjg-backend.onrender.com/api/products/
https://sjg-backend.onrender.com/api/orders/
https://sjg-backend.onrender.com/api/dashboard/stats/
```

### 2. Seed the Database
In Render Dashboard:
1. Go to your service
2. Click **"Shell"** tab
3. Run:
```bash
python seed_products.py
```

### 3. Verify Data
Refresh: https://sjg-backend.onrender.com/api/products/

You should see your 5 products!

---

## 🔧 Troubleshooting

### Build Failed?
- Check logs in Render Dashboard
- Verify `build.sh` has execute permissions
- Check `requirements.txt` is correct

### Server Error 500?
- Check environment variables are set
- View logs: Render Dashboard → Logs tab
- Verify MongoDB connection string

### Empty Products?
- Run seed script in Shell tab
- Check MongoDB Atlas allows Render IPs (0.0.0.0/0)

---

## 📱 Update Frontend

After successful deployment, your Firebase site will automatically work!

The `config.js` is already set to use:
```
https://sjg-backend.onrender.com
```

Just refresh the site and it should work!

---

## ⏱️ Expected Timeline

- Git setup: ✅ Done
- Create GitHub repo: 1 minute
- Push to GitHub: 1 minute
- Configure Render: 3 minutes
- Render build & deploy: 5-10 minutes
- Seed database: 2 minutes
- **Total: ~15 minutes**

---

## 🆘 Need Help?

If stuck at any step, check:
- Render Logs
- GitHub repository is public
- Environment variables are correct
- MongoDB Atlas allows all IPs

---

**Ready to proceed with GitHub?** Create the repository and I'll help you with the commands!
