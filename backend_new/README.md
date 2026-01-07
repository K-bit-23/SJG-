# Django Backend with MongoDB Atlas

## 🎯 Overview
Fresh Django REST API backend with MongoDB Atlas integration for your e-commerce application.

## ✅ Features
- ✓ Django 4.2.17 with Django REST Framework
- ✓ MongoDB Atlas connection using PyMongo
- ✓ Complete CRUD API for Products and Orders
- ✓ Dashboard statistics endpoint
- ✓ CORS enabled for React frontend
- ✓ Ready to serve React build files

## 📦 API Endpoints

### Products
- `GET /api/products/` - List all products
- `POST /api/products/` - Create new product
- `GET /api/products/<id>/` - Get product details
- `PUT /api/products/<id>/` - Update product
- `DELETE /api/products/<id>/` - Delete product

### Orders
- `GET /api/orders/` - List all orders
- `POST /api/orders/` - Create new order  
- `GET /api/orders/<id>/` - Get order details
- `PATCH /api/orders/<id>/` - Update order status

### Dashboard
- `GET /api/dashboard/stats/` - Get statistics (products count, orders count, revenue)

## 🚀 Getting Started

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Run Migrations
```bash
python manage.py migrate
```

### Test MongoDB Connection
```bash
python test_mongodb.py
```

### Run Server
```bash
python manage.py runserver
```

Server will start at: `http://127.0.0.1:8000/`

## 🗄️ MongoDB Configuration
- **Database**: `sjg_db`
- **Collections**: `products`, `orders`
- **Connection**: Configured in `settings.py` with your MongoDB Atlas URI

## 🔗 Frontend Integration
The backend is configured to:
- Serve React build files from `../frontend/build`
- Allow CORS from `localhost:3000`
- Handle all API requests at `/api/` prefix

## 📁 Project Structure
```
backend_new/
├── api/
│   ├── mongodb.py          # MongoDB client singleton
│   ├── serializers.py      # DRF serializers
│   ├── views.py            # API views
│   └── urls.py             # API routes
├── backend_project/
│   ├── settings.py         # Django settings
│   └── urls.py             # Main URL config
├── manage.py
├── requirements.txt
└── test_mongodb.py         # Connection test script
```

## 🔧 Configuration
MongoDB settings in `backend_project/settings.py`:
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `MONGODB_NAME`: Database name (sjg_db)

## 📝 Notes
- SQLite is used for Django's authentication and admin tables
- MongoDB handles all application data (products, orders)
- Authentication endpoints can be added as needed
