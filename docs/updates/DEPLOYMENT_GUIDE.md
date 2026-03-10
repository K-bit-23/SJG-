# 🚀 SJG Stationery - Production Deployment Guide

## Prerequisites

- Node.js 16+ and npm
- Python 3.8+
- MongoDB Atlas account
- Firebase account
- Stripe account
- Domain name
- Hosting service (Vercel/Netlify for frontend, Render/Railway for backend)

---

## 📋 Pre-Deployment Checklist

### 1. **Environment Setup**

#### Backend (.env)
```bash
cd backend
cp .env.example .env
# Edit .env with your production values
```

#### Frontend (.env)
```bash
cd frontend
cp .env.example .env
# Edit .env with your production values
```

### 2. **Database Setup**

1. **MongoDB Atlas**:
   - Create a cluster at https://cloud.mongodb.com
   - Whitelist all IPs (0.0.0.0/0) for production
   - Get connection string
   - Update `MONGODB_URI` in backend `.env`

2. **Create Collections**:
   - `products`
   - `orders`
   - `users`
   - `messages`
   - `site_content`
   - `chatbot_settings`

### 3. **Firebase Setup**

1. Go to https://console.firebase.google.com
2. Create a new project
3. Enable Authentication → Google Sign-In
4. Get configuration from Project Settings
5. Update frontend `.env` with Firebase config

### 4. **Stripe Setup**

1. Go to https://dashboard.stripe.com
2. Get your **Live** API keys (not test keys)
3. Update both backend and frontend `.env` files
4. Configure webhooks for payment confirmations

---

## 🌐 Deployment Options

### **Option A: Vercel (Frontend) + Render (Backend)**

#### Deploy Backend to Render

1. **Create Render Account**: https://render.com
2. **New Web Service**:
   - Connect your GitHub repository
   - Root directory: `backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `gunicorn backend_project.wsgi:application`
   - Add environment variables from `.env`

3. **Add to `backend/requirements.txt`**:
```
gunicorn==21.2.0
whitenoise==6.6.0
```

4. **Update `backend/backend_project/settings.py`**:
```python
# Add to ALLOWED_HOSTS
ALLOWED_HOSTS = ['*']  # Or specify your Render URL

# Static files
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
```

#### Deploy Frontend to Vercel

1. **Create Vercel Account**: https://vercel.com
2. **Import Project**:
   - Connect GitHub repository
   - Root directory: `frontend`
   - Framework: Create React App
   - Add environment variables from `.env`

3. **Build Settings**:
   - Build command: `npm run build`
   - Output directory: `build`

4. **Update `frontend/package.json`**:
```json
{
  "homepage": "https://yourdomain.com"
}
```

---

### **Option B: Firebase Hosting (Full Stack)**

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python manage.py collectstatic --noinput
```

#### Frontend Build
```bash
cd frontend
npm run build
```

#### Firebase Deploy
```bash
npm install -g firebase-tools
firebase login
firebase init
firebase deploy
```

---

## 🔐 Security Hardening

### Backend Security

1. **Update `backend/backend_project/settings.py`**:

```python
# SECURITY SETTINGS
DEBUG = False
SECRET_KEY = os.environ.get('SECRET_KEY')
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

# HTTPS Settings
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# CORS
CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',')
CORS_ALLOW_CREDENTIALS = True
```

2. **Generate New Secret Key**:
```python
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

### Frontend Security

1. **Never commit `.env` files**
2. **Add to `.gitignore`**:
```
.env
.env.local
.env.production
```

---

## 📊 Database Initialization

### Add Sample Data (Optional)

```bash
cd backend
python manage.py shell
```

```python
from api.mongodb import mongo_client
from datetime import datetime

# Add sample products
products = mongo_client.get_collection('products')
products.insert_many([
    {
        "name": "Classmate Notebook",
        "category": "Notebooks",
        "price": 45.0,
        "description": "Premium quality notebook",
        "image": "https://example.com/image.jpg",
        "stock": 100,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
])
```

---

## 🧪 Testing Before Launch

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
npm run build  # Ensure build succeeds
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Google OAuth login
- [ ] Product browsing and search
- [ ] Add to cart functionality
- [ ] Checkout process
- [ ] Payment with Stripe (use test card: 4242 4242 4242 4242)
- [ ] Order confirmation
- [ ] Admin dashboard access
- [ ] Product management
- [ ] Order management
- [ ] User management

---

## 🔄 Post-Deployment

### 1. **DNS Configuration**
- Point your domain to Vercel/Render
- Add SSL certificate (automatic with Vercel/Render)

### 2. **Monitoring**
- Set up error tracking (Sentry)
- Monitor MongoDB Atlas metrics
- Check Stripe dashboard for payments

### 3. **Backup Strategy**
- Enable MongoDB Atlas automated backups
- Export database regularly

### 4. **Performance**
- Enable CDN for static assets
- Optimize images
- Enable caching headers

---

## 📱 Mobile Responsiveness

All pages are already responsive. Test on:
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

---

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Update `CORS_ALLOWED_ORIGINS` in backend settings
   - Ensure frontend URL is whitelisted

2. **MongoDB Connection Failed**:
   - Check IP whitelist in MongoDB Atlas
   - Verify connection string

3. **Stripe Payments Not Working**:
   - Use live API keys (not test)
   - Configure webhook endpoints

4. **Build Failures**:
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Clear Python cache: `find . -type d -name __pycache__ -exec rm -r {} +`

---

## 📞 Support

For issues, check:
- Backend logs in Render dashboard
- Frontend logs in Vercel dashboard
- MongoDB Atlas logs
- Stripe dashboard

---

## 🎉 Launch Checklist

- [ ] Environment variables configured
- [ ] Database populated with products
- [ ] Stripe live keys configured
- [ ] Firebase authentication working
- [ ] Domain configured with SSL
- [ ] All tests passing
- [ ] Admin account created
- [ ] Backup strategy in place
- [ ] Monitoring enabled
- [ ] Terms of Service & Privacy Policy added

---

**Your SJG Stationery store is ready for production! 🚀**
