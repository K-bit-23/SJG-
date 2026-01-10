# Test Profile Update Functionality
# Run this to verify profile updates are working correctly

from api.mongodb import mongo_client
from datetime import datetime

def test_profile_update():
    """Test updating user profile in MongoDB"""
    
    # Get users collection
    collection = mongo_client.get_collection('users')
    
    # Example: Update a test user
    test_uid = "test_user_123"  # Replace with actual UID
    
    # Update user data
    update_data = {
        'display_name': 'Updated Test User',
        'mobile': '+91 98765 43210',
        'updated_at': datetime.now()
    }
    
    result = collection.update_one(
        {'uid': test_uid},
        {'$set': update_data}
    )
    
    if result.matched_count > 0:
        print(f"✅ Successfully updated user {test_uid}")
        print(f"   Modified count: {result.modified_count}")
        
        # Fetch updated user
        updated_user = collection.find_one({'uid': test_uid})
        print(f"\n📋 Updated User Data:")
        print(f"   Name: {updated_user.get('display_name')}")
        print(f"   Mobile: {updated_user.get('mobile')}")
        print(f"   Last Updated: {updated_user.get('updated_at')}")
    else:
        print(f"❌ User {test_uid} not found")

if __name__ == "__main__":
    print("🧪 Testing Profile Update Functionality\n")
    print("=" * 50)
    test_profile_update()
    print("=" * 50)
