import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from api.mongodb import mongo_client

def test_connection():
    try:
        db = mongo_client.get_database()
        print(f"\n✓ Successfully connected to MongoDB!")
        print(f"✓ Database name: {db.name}")
        
        # List collections
        collections = db.list_collection_names()
        print(f"✓ Collections: {collections if collections else 'None (database is empty)'}")
        
        # Test creating a collection if it doesn't exist
        if 'products' not in collections:
            db.create_collection('products')
            print("✓ Created 'products' collection")
        
        if 'orders' not in collections:
            db.create_collection('orders')
            print("✓ Created 'orders' collection")
        
        print("\n✓ MongoDB is ready for use!")
        return True
    except Exception as e:
        print(f"\n✗ Connection failed: {e}")
        return False

if __name__ == '__main__':
    test_connection()
