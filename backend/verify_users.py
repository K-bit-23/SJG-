"""
Script to verify user accounts in MongoDB
Run this to see all registered users
"""

from api.mongodb import mongo_client
from datetime import datetime

def list_all_users():
    """List all users in the database"""
    try:
        collection = mongo_client.get_collection('users')
        users = list(collection.find())
        
        print(f"\n{'='*80}")
        print(f"TOTAL USERS IN DATABASE: {len(users)}")
        print(f"{'='*80}\n")
        
        for idx, user in enumerate(users, 1):
            print(f"User #{idx}")
            print(f"  UID: {user.get('uid')}")
            print(f"  Email: {user.get('email')}")
            print(f"  Name: {user.get('display_name', 'N/A')}")
            print(f"  Role: {user.get('role', 'user')}")
            print(f"  Mobile: {user.get('mobile', 'N/A')}")
            print(f"  Created: {user.get('created_at', 'N/A')}")
            print(f"  Last Updated: {user.get('updated_at', 'N/A')}")
            print(f"{'-'*80}\n")
            
        return users
        
    except Exception as e:
        print(f"Error: {e}")
        return []

if __name__ == "__main__":
    users = list_all_users()
    
    # Statistics
    admin_count = sum(1 for u in users if u.get('role') == 'admin')
    user_count = sum(1 for u in users if u.get('role') == 'user')
    
    print(f"\n📊 STATISTICS:")
    print(f"  Total Users: {len(users)}")
    print(f"  Admins: {admin_count}")
    print(f"  Regular Users: {user_count}")
