import urllib.request
import json
import uuid

url = "https://sjg-backend.onrender.com/api/orders/"

payload = {
    "user_email": "karthikeyankarthikeyan64182@gmail.com",
    "user_name": "Test User Backend",
    "user_id": str(uuid.uuid4()),
    "items": [
        {"product_name": "Backend Test Item", "quantity": 1, "price": 10.0}
    ],
    "total_amount": 10.0,
    "shipping_address": "Remote Test Address",
    "payment_method": "COD",
    "payment_status": "pending",
    "status": "pending"
}

req = urllib.request.Request(
    url, 
    data=json.dumps(payload).encode(),
    headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"}
)

print("Sending POST request to:", url)
try:
    with urllib.request.urlopen(req) as res:
        print("Status Code:", res.getcode())
        print("Response:", res.read().decode())
        print("If successful, the remote server is now sending the email via Resend API!")
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}: {e.reason}")
    print(e.read().decode())
except Exception as e:
    print(f"Error: {e}")
