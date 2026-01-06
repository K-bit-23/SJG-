# SJG Backend API

## Deployment on Render

### Quick Deploy Steps:

1. **Go to [Render Dashboard](https://dashboard.render.com/)**
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**

   | Setting | Value |
   |---------|-------|
   | **Name** | `sjg-backend` |
   | **Root Directory** | `backend` |
   | **Environment** | `Python 3` |
   | **Build Command** | `./build.sh` |
   | **Start Command** | `gunicorn backend_project.wsgi:application` |

5. **Add Environment Variables:**
   - `SECRET_KEY` = (generate a random string)
   - `DEBUG` = `False`
   - `PYTHON_VERSION` = `3.10.0`

6. **Click "Create Web Service"**

### After Deployment:

Your backend will be available at:
```
https://sjg-backend.onrender.com
```

Update your frontend config.js to use this URL.

## Local Development

```bash
cd backend
pip install -r requirements.txt
python manage.py runserver
```
