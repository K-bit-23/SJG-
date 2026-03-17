
import requests
import json
import sys

BASE_URL = "http://localhost:8000/api"

def test_admin_settings():
    print("Testing Admin Settings Integration...")
    payload = {
        "brand_name": "SJG Stationery",
        "currency": "INR (\u20b9)",
        "whatsapp": "+91 93600 24821",
        "address": "Sakthi Nagar, Thindal, Erode - 638 012"
    }
    
    try:
        # 1. Update Settings
        res = requests.post(f"{BASE_URL}/settings/", json=payload)
        if res.status_code in [200, 201]:
            print("  \u2705 POST /settings/ successful")
        else:
            print(f"  \u274c POST /settings/ failed: {res.status_code}")
            return False

        # 2. Verify settings
        res = requests.get(f"{BASE_URL}/settings/")
        if res.status_code == 200:
            data = res.json()
            if data.get('address') == payload['address']:
                print("  \u2705 GET /settings/ verify data match")
            else:
                print(f"  \u274c Data mismatch! Expected {payload['address']}, got {data.get('address')}")
                return False
        else:
            print(f"  \u274c GET /settings/ failed: {res.status_code}")
            return False
            
        return True
    except Exception as e:
        print(f"  \u274c Connection Error: {e}")
        return False

def test_profile_integration():
    print("\nTesting Profile & Address Integration...")
    email = "test@example.com"
    payload = {
        "fullName": "Test User",
        "email": email,
        "addresses": [
            {
                "id": 123456789,
                "type": "Home",
                "addressLine1": "123 Test Street",
                "city": "Erode",
                "state": "Tamil Nadu",
                "pincode": "638012"
            }
        ]
    }
    
    try:
        # 1. Save Profile
        res = requests.post(f"{BASE_URL}/profile/{email}/", json=payload)
        if res.status_code in [200, 201]:
            print("  \u2705 POST /profile/{email}/ successful")
        else:
            print(f"  \u274c POST /profile/{email}/ failed: {res.status_code}")
            return False

        # 2. Fetch and Verify
        res = requests.get(f"{BASE_URL}/profile/{email}/")
        if res.status_code == 200:
            data = res.json()
            if len(data.get('savedAddresses', [])) > 0 or len(data.get('addresses', [])) > 0:
                 print("  \u2705 GET /profile/ addresses found")
            else:
                 print("  \u274c GET /profile/ addresses missing in response")
                 return False
        else:
            print(f"  \u274c GET /profile/ failed: {res.status_code}")
            return False
            
        return True
    except Exception as e:
        print(f"  \u274c Error: {e}")
        return False

if __name__ == "__main__":
    print("-" * 50)
    print("SJG SYSTEM VALIDATION REPORT")
    print("-" * 50)
    
    s1 = test_admin_settings()
    s2 = test_profile_integration()
    
    print("-" * 50)
    if s1 and s2:
        print("ALL TESTS PASSED SUCCESSFULLY \ud83d\ude80")
        sys.exit(0)
    else:
        print("SOME TESTS FAILED \u26a0\ufe0f")
        sys.exit(1)
