# Migration Guide: Old Backend → New Backend

## ✅ What Was Done

### 1. **Created Fresh Django Project**
   - Clean Django 4.2.17 installation
   - No conflicting packages or legacy code
   - Proper project structure

### 2. **MongoDB Integration**
   - **Method**: PyMongo (direct connection)
   - **Why**: Djongo had compatibility issues with Django 4.2+
   - **Collections**: `products`, `orders`
   - **Connection**: Singleton pattern for efficiency

### 3. **API Endpoints Created**
   All endpoints your frontend needs:
   - Products CRUD operations
   - Orders management
   - Dashboard statistics

### 4. **Frontend Integration**
   - CORS configured for React app
   - Static files serving configured
   - Template path pointing to React build

## 🔄 Next Steps

### 1. **Replace Old Backend**
```bash
# After verifying everything works:
cd c:/Users/KARTHIKEYAN/OneDrive/Desktop/final/SJG-
Remove-Item -Recurse -Force backend  # Delete old backend
Rename-Item backend_new backend       # Rename new backend
```

### 2. **Verify MongoDB Connection**
The timeout error suggests:
- Check internet connection
- Verify MongoDB Atlas cluster is running
- Confirm IP address is whitelisted in Atlas
- Password might need URL encoding if it contains special characters

### 3. **Update MongoDB Atlas Settings** (if connection fails)
1. Go to MongoDB Atlas dashboard
2. Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
3. Database Access → Verify user 'karthi' exists with correct password
4. If password has special characters like `@`, URL-encode it:
   - `karthi07@sjg` → `karthi07%40sjg`

### 4. **Start the Server**
```bash
cd backend
python manage.py runserver
```

### 5. **Test API Endpoints**
Open browser/Postman and test:
- http://127.0.0.1:8000/api/products/
- http://127.0.0.1:8000/api/orders/
- http://127.0.0.1:8000/api/dashboard/stats/

## 📊 Database Structure

### Products Collection
```json
{
  "_id": "ObjectId",
  "name": "string",
  "category": "string",
  "price": "decimal",
  "description": "string",
  "image": "string",
  "stock": "number",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Orders Collection
```json
{
  "_id": "ObjectId",
  "user_email": "string",
  "user_name": "string",
  "items": [
    {
      "product_id": "string",
      "product_name": "string",
      "quantity": "number",
      "price": "decimal"
    }
  ],
  "total_amount": "decimal",
  "status": "string",
  "shipping_address": "string",
  "payment_method": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

## 🛠️ Troubleshooting

### MongoDB Connection Timeout
If you see `ServerSelectionTimeoutError`:
1. Check MongoDB Atlas dashboard
2. Ensure cluster is not paused
3. Whitelist your IP address
4. Test connection string in MongoDB Compass

### Frontend Not Loading
1. Ensure React app is built: `npm run build` in frontend
2. Check `STATICFILES_DIRS` in settings.py
3. Run `python manage.py collectstatic`

### API Returns 500 Error
1. Check MongoDB connection
2. Verify collection names match
3. Check Django console for error details

## 📝 Key Differences from Old Backend

| Aspect | Old Backend | New Backend |
|--------|-------------|-------------|
| MongoDB Library | Djongo (broken) | PyMongo (stable) |
| Database Engine | Mixed/Broken | SQLite + MongoDB |
| Dependencies | Conflicting | Clean |
| API Structure | Incomplete | Full CRUD |
| Frontend Serving | Not configured | Ready |

## ✨ Benefits

1. **Stable**: No dependency conflicts
2. **Clean**: Fresh codebase
3. **Complete**: All needed endpoints
4. **Documented**: README and comments
5. **Tested**: Connection verification included
6. **Scalable**: Proper MongoDB connection pooling
