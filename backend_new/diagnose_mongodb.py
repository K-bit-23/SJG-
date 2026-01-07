"""
MongoDB Connection Diagnostic Tool
Run this to identify connection issues with MongoDB Atlas
"""

import certifi

def test_basic_connection():
    """Test basic network connectivity"""
    print("=" * 60)
    print("MongoDB Atlas Connection Diagnostics")
    print("=" * 60)
    
    # Check if pymongo is installed
    print("\n1. Checking PyMongo installation...")
    try:
        import pymongo
        print(f"   ✓ PyMongo version: {pymongo.__version__}")
    except ImportError:
        print("   ✗ PyMongo not installed. Run: pip install pymongo")
        return
    
    # Check certifi
    print("\n2. Checking SSL certificates...")
    try:
        cert_path = certifi.where()
        print(f"   ✓ Certifi path: {cert_path}")
    except Exception as e:
        print(f"   ✗ Certifi error: {e}")
    
    # Test MongoDB connection with detailed error handling
    print("\n3. Testing MongoDB Atlas connection...")
    
    connection_string = 'mongodb+srv://karthi:karthi07@sjg.cdlgflc.mongodb.net/?retryWrites=true&w=majority&appName=SJG'
    
    print(f"   Connection string: {connection_string[:30]}...")
    
    try:
        # Try connection with various settings
        print("\n   Attempting connection...")
        client = pymongo.MongoClient(
            connection_string,
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000
        )
        
        # Force connection
        print("   Pinging server...")
        client.admin.command('ping')
        
        print("   ✓ Successfully connected!")
        
        # Get database info
        db = client['sjg_db']
        print(f"\n4. Database Information:")
        print(f"   Database name: {db.name}")
        
        collections = db.list_collection_names()
        print(f"   Collections: {collections if collections else 'None (empty database)'}")
        
        client.close()
        print("\n✓ All tests passed! MongoDB is accessible.")
        
    except pymongo.errors.ServerSelectionTimeoutError as e:
        print(f"   ✗ Server timeout error")
        print("\n   Possible causes:")
        print("   1. Internet connection issue")
        print("   2. MongoDB Atlas cluster is paused")
        print("   3. IP address not whitelisted in Atlas")
        print("   4. Firewall blocking connection")
        print("\n   Solutions:")
        print("   → Go to MongoDB Atlas → Network Access")
        print("   → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)")
        print("   → Ensure cluster is not paused")
        
    except pymongo.errors.OperationFailure as e:
        print(f"   ✗ Authentication error: {e}")
        print("\n   Possible causes:")
        print("   1. Incorrect username or password")
        print("   2. User doesn't have proper permissions")
        print("\n   Solutions:")
        print("   → Go to MongoDB Atlas → Database Access")
        print("   → Verify user 'karthi' exists")
        print("   → Check password is 'karthi07'")
        print("   → Grant 'Read and write to any database' permission")
        
    except Exception as e:
        print(f"   ✗ Connection error: {type(e).__name__}")
        print(f"   Details: {str(e)}")
    
    print("\n" + "=" * 60)

if __name__ == '__main__':
    test_basic_connection()
