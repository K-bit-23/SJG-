"""
Simple MongoDB Connection Test
This bypasses Django to test raw MongoDB connectivity
"""

def test_connection():
    print("\n" + "="*60)
    print("SIMPLE MONGODB CONNECTION TEST")
    print("="*60)
    
    try:
        import pymongo
        import certifi
        from datetime import datetime
        
        print("\n✓ Imports successful")
        print(f"  PyMongo: {pymongo.__version__}")
        
        # Connection string
        uri = "mongodb+srv://karthi:karthi07@sjg.cdlgflc.mongodb.net/?retryWrites=true&w=majority&appName=SJG"
        
        print(f"\n→ Connecting to MongoDB Atlas...")
        print(f"  Host: sjg.cdlgflc.mongodb.net")
        
        # Create client with extended timeout
        client = pymongo.MongoClient(
            uri,
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=30000,  # 30 seconds
            connectTimeoutMS=30000,
            socketTimeoutMS=30000
        )
        
        print(f"  Client created, testing connection...")
        
        # Test connection
        result = client.admin.command('ping')
        print(f"\n✓ CONNECTION SUCCESSFUL!")
        print(f"  Ping result: {result}")
        
        # Get database
        db = client['sjg_db']
        print(f"\n✓ Database: {db.name}")
        
        # List collections
        collections = db.list_collection_names()
        print(f"✓ Collections: {collections if collections else '(none - empty database)'}")
        
        # Try to create a test document
        print(f"\n→ Testing write operation...")
        test_collection = db['connection_test']
        test_doc = {
            'test': True,
            'timestamp': datetime.now(),
            'message': 'Backend connection successful!'
        }
        result = test_collection.insert_one(test_doc)
        print(f"✓ Write successful! Document ID: {result.inserted_id}")
        
        # Clean up test document
        test_collection.delete_one({'_id': result.inserted_id})
        print(f"✓ Cleanup successful")
        
        client.close()
        
        print("\n" + "="*60)
        print("✓ ALL TESTS PASSED - MONGODB IS FULLY OPERATIONAL!")
        print("="*60 + "\n")
        
        return True
        
    except pymongo.errors.ServerSelectionTimeoutError:
        print(f"\n✗ CONNECTION TIMEOUT")
        print(f"\n⚠️  ISSUE: Cannot reach MongoDB Atlas servers")
        print(f"\n📋 SOLUTION CHECKLIST:")
        print(f"   □ Check internet connection")
        print(f"   □ Go to https://cloud.mongodb.com")
        print(f"   □ Click 'Network Access' (left sidebar)")
        print(f"   □ Click 'Add IP Address'")
        print(f"   □ Select 'ALLOW ACCESS FROM ANYWHERE'")
        print(f"   □ Click 'Confirm' and wait 1-2 minutes")
        print(f"   □ Check if cluster is paused (Database → Clusters)")
        print("\n" + "="*60 + "\n")
        return False
        
    except pymongo.errors.OperationFailure as e:
        print(f"\n✗ AUTHENTICATION FAILED")
        print(f"  Error: {e}")
        print(f"\n📋 SOLUTION:")
        print(f"   □ Go to https://cloud.mongodb.com")
        print(f"   □ Click 'Database Access' (left sidebar)")
        print(f"   □ Verify user 'karthi' exists")
        print(f"   □ Reset password to 'karthi07'")
        print(f"   □ Ensure 'Read and write to any database' permission")
        print("\n" + "="*60 + "\n")
        return False
        
    except Exception as e:
        print(f"\n✗ UNEXPECTED ERROR")
        print(f"  Type: {type(e).__name__}")
        print(f"  Details: {str(e)}")
        print("\n" + "="*60 + "\n")
        return False

if __name__ == '__main__':
    success = test_connection()
    exit(0 if success else 1)
