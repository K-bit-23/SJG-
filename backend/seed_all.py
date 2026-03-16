import os
from pymongo import MongoClient
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.environ.get('MONGODB_URI')
MONGODB_NAME = os.environ.get('MONGODB_NAME', 'sjg_db')

client = MongoClient(MONGODB_URI)
db = client[MONGODB_NAME]

def seed_chats():
    col = db['messages']
    data = [
        {"sender_name": "Arun Kumar", "email": "arun@example.com", "message": "Hi, do you have A3 color printing available today?", "created_at": datetime.now() - timedelta(hours=2)},
        {"sender_name": "Priya Sharma", "email": "priya.s@gmail.com", "message": "Order #OFF-1710567890 tracking update?", "created_at": datetime.now() - timedelta(hours=5)},
        {"sender_name": "Suresh Raina", "email": "suresh@workspace.in", "message": "Bulk lamination for 100 ID cards quote.", "created_at": datetime.now() - timedelta(days=1)}
    ]
    for m in data: 
        m['text'] = m['message']
        m['sender'] = 'user'
    col.insert_many(data)

def seed_users():
    col = db['users']
    data = [
        {"display_name": "Rahul Dravid", "phone": "9876543210", "email": "rahul@cricket.com", "role": "customer", "created_at": datetime.now()},
        {"display_name": "MS Dhoni", "phone": "9998887776", "email": "msd@finisher.com", "role": "customer", "created_at": datetime.now()}
    ]
    col.insert_many(data)

print("Completing Seed...")
seed_chats()
seed_users()
print("Success!")
