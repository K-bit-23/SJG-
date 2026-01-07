"""
Seed data to MongoDB (works for both local and production)
Can target local or remote MongoDB by setting MONGODB_URI
"""
import os
import sys

# For production seeding
USE_PRODUCTION = '--production' in sys.argv

if USE_PRODUCTION:
    # Direct connection without Django
    import pymongo
    import certifi
    from datetime import datetime
    
    uri = "mongodb+srv://karthi:karthi07@sjg.cdlgflc.mongodb.net/?retryWrites=true&w=majority&appName=SJG"
    db_name = "sjg_db"
    
    print(f"\n🌐 Targeting PRODUCTION MongoDB")
    print(f"   Database: {db_name}")
    
    client = pymongo.MongoClient(uri, tlsCAFile=certifi.where())
    db = client[db_name]
    collection = db['products']
    
else:
    # Local development with Django
    import django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
    django.setup()
    
    from api.mongodb import mongo_client
    from datetime import datetime
    
    print(f"\n💻 Targeting LOCAL MongoDB")
    
    db = mongo_client.get_database()
    collection = db['products']

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
    },
    {
        "name": "Pencil Box",
        "category": "Stationery",
        "price": 79.99,
        "description": "Durable pencil box with compartments",
        "stock": 60,
        "image": "pencilbox.jpg",
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    },
    {
        "name": "Sticky Notes Pack",
        "category": "Office Supplies",
        "price": 39.99,
        "description": "Colorful sticky notes - 5 pads",
        "stock": 120,
        "image": "stickynotes.jpg",
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
]

try:
    # Clear existing products (optional - comment out to keep existing)
    # collection.delete_many({})
    
    # Insert new products
    result = collection.insert_many(sample_products)
    
    print(f"\n✓ Successfully inserted {len(result.inserted_ids)} products")
    print(f"  Product IDs:")
    for idx, product_id in enumerate(result.inserted_ids, 1):
        product_name = sample_products[idx-1]['name']
        print(f"    {idx}. {product_name}: {product_id}")
    
    # Verify count
    total = collection.count_documents({})
    print(f"\n✓ Total products in database: {total}")
    
    if USE_PRODUCTION:
        client.close()
    
    print(f"\n✅ Seeding complete!\n")
    
except Exception as e:
    print(f"\n✗ Error seeding data: {e}\n")
    sys.exit(1)
