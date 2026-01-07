"""
Comprehensive Backend + Database Check
Tests all aspects of the API and database integration
"""

import os
import django
import requests
import json
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def test_mongodb_connection():
    """Test direct MongoDB connection"""
    print_section("1. Testing MongoDB Connection")
    
    try:
        from api.mongodb import mongo_client
        db = mongo_client.get_database()
        
        # Test ping
        result = db.client.admin.command('ping')
        print(f"✓ MongoDB connected successfully")
        print(f"  Database: {db.name}")
        
        # List collections
        collections = db.list_collection_names()
        print(f"  Collections: {collections if collections else '(empty)'}")
        
        # Count documents
        if 'products' in collections:
            product_count = db['products'].count_documents({})
            print(f"  Products in DB: {product_count}")
        
        if 'orders' in collections:
            order_count = db['orders'].count_documents({})
            print(f"  Orders in DB: {order_count}")
        
        return True
        
    except Exception as e:
        print(f"✗ MongoDB connection failed")
        print(f"  Error: {str(e)[:100]}...")
        print(f"\n  ℹ️  This is expected if IP is not whitelisted in MongoDB Atlas")
        return False

def test_api_endpoints():
    """Test all API endpoints"""
    print_section("2. Testing API Endpoints")
    
    base_url = "http://127.0.0.1:8000/api"
    
    endpoints = [
        ("GET", "/products/", "List Products"),
        ("GET", "/orders/", "List Orders"),
        ("GET", "/dashboard/stats/", "Dashboard Stats"),
    ]
    
    results = []
    
    for method, endpoint, description in endpoints:
        url = f"{base_url}{endpoint}"
        try:
            response = requests.get(url, timeout=5)
            status = "✓" if response.status_code == 200 else "✗"
            
            print(f"{status} {description}")
            print(f"  URL: {url}")
            print(f"  Status: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if isinstance(data, list):
                        print(f"  Result: Array with {len(data)} items")
                    elif isinstance(data, dict):
                        print(f"  Result: Object with keys: {list(data.keys())}")
                except:
                    print(f"  Result: {response.text[:100]}")
            else:
                print(f"  Error: {response.text[:100]}")
            
            results.append((endpoint, response.status_code == 200))
            print()
            
        except requests.exceptions.ConnectionError:
            print(f"✗ {description}")
            print(f"  Error: Cannot connect to server")
            print(f"  Make sure Django server is running!")
            results.append((endpoint, False))
            print()
        except Exception as e:
            print(f"✗ {description}")
            print(f"  Error: {str(e)}")
            results.append((endpoint, False))
            print()
    
    return results

def test_create_product():
    """Test creating a product via API"""
    print_section("3. Testing Product Creation")
    
    url = "http://127.0.0.1:8000/api/products/"
    
    test_product = {
        "name": "Test Product",
        "category": "Test Category",
        "price": "99.99",
        "description": "Test product created by backend check script",
        "stock": 10,
        "image": "test.jpg"
    }
    
    try:
        print(f"→ Creating test product...")
        response = requests.post(url, json=test_product, timeout=5)
        
        if response.status_code == 201:
            print(f"✓ Product created successfully!")
            data = response.json()
            print(f"  Product ID: {data.get('id', 'N/A')}")
            print(f"  Name: {data.get('name')}")
            return data.get('id')
        else:
            print(f"✗ Failed to create product")
            print(f"  Status: {response.status_code}")
            print(f"  Response: {response.text[:200]}")
            return None
            
    except Exception as e:
        print(f"✗ Error creating product: {str(e)}")
        return None

def generate_report(mongo_ok, api_results):
    """Generate final report"""
    print_section("FINAL REPORT")
    
    print(f"MongoDB Connection: {'✓ Working' if mongo_ok else '✗ Not Connected'}")
    print(f"\nAPI Endpoints:")
    
    all_ok = True
    for endpoint, success in api_results:
        status = "✓ Working" if success else "✗ Failed"
        print(f"  {endpoint}: {status}")
        if not success:
            all_ok = False
    
    print(f"\n{'='*60}")
    
    if mongo_ok and all_ok:
        print("✓ EVERYTHING IS WORKING PERFECTLY!")
        print("\nYour backend is fully operational with MongoDB.")
        print("You can now:")
        print("  1. Use the API endpoints")
        print("  2. Create/Read/Update/Delete products and orders")
        print("  3. Connect your frontend")
    elif mongo_ok and not all_ok:
        print("⚠️  MONGODB WORKS BUT API HAS ISSUES")
        print("\nMongoDB is connected but some endpoints failed.")
        print("Check the Django server logs for errors.")
    elif not mongo_ok and all_ok:
        print("⚠️  API WORKS BUT MONGODB NOT CONNECTED")
        print("\nAPI endpoints respond but can't access MongoDB.")
        print("\nTO FIX:")
        print("  1. Go to https://cloud.mongodb.com")
        print("  2. Network Access → Add IP Address")
        print("  3. Select 'Allow Access from Anywhere'")
        print("  4. Wait 2 minutes and re-run this check")
    else:
        print("✗ MULTIPLE ISSUES DETECTED")
        print("\nBoth MongoDB and API have problems.")
        print("Check:")
        print("  1. Django server is running")
        print("  2. MongoDB Atlas IP whitelist")
        print("  3. Internet connection")
    
    print(f"{'='*60}\n")

if __name__ == '__main__':
    print("\n" + "="*60)
    print(" "*15 + "BACKEND HEALTH CHECK")
    print("="*60)
    
    # Run tests
    mongo_ok = test_mongodb_connection()
    api_results = test_api_endpoints()
    
    if mongo_ok:
        test_create_product()
    
    # Generate report
    generate_report(mongo_ok, api_results)
