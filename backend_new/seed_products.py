from api.mongodb import mongo_client
from bson import ObjectId
from datetime import datetime

# Sample Product Data
sample_products = [
    {
        "name": "Premium Notebook",
        "category": "Stationery",
        "price": 129.99,
        "description": "High-quality spiral notebook with 200 pages",
        "stock": 50,
        "image": "notebook.jpg",
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    },
    {
        "name": "Ball Point Pen Set",
        "category": "Stationery",
        "price": 49.99,
        "description": "Pack of 10 smooth writing pens",
        "stock": 100,
        "image": "pens.jpg",
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    },
    {
        "name": "A4 Paper Ream",
        "category": "Paper Products",
        "price": 299.99,
        "description": "500 sheets premium quality A4 paper",
        "stock": 75,
        "image": "paper.jpg",
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
]

def seed_data():
    """Seed the database with sample products"""
    try:
        products_collection = mongo_client.get_collection('products')
        
        # Clear existing products (optional)
        # products_collection.delete_many({})
        
        # Insert sample products
        result = products_collection.insert_many(sample_products)
        print(f"✓ Successfully inserted {len(result.inserted_ids)} products")
        print(f"  Product IDs: {[str(id) for id in result.inserted_ids]}")
        
        # Verify
        count = products_collection.count_documents({})
        print(f"✓ Total products in database: {count}")
        
    except Exception as e:
        print(f"✗ Error seeding data: {e}")

if __name__ == '__main__':
    import os
    import django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
    django.setup()
    
    seed_data()
