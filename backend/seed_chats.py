import os
from pymongo import MongoClient
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.environ.get('MONGODB_URI')
MONGODB_NAME = os.environ.get('MONGODB_NAME', 'sjg_db')

client = MongoClient(MONGODB_URI)
db = client[MONGODB_NAME]
messages_col = db['messages']

# Example chat/contact data
example_messages = [
    {
        "sender_name": "Arun Kumar",
        "email": "arun@example.com",
        "message": "Hi, do you have A3 color printing available today? I need to print 50 posters.",
        "created_at": datetime.now() - timedelta(hours=2)
    },
    {
        "sender_name": "Priya Sharma",
        "email": "priya.s@gmail.com",
        "message": "I ordered a Parker pen yesterday but haven't received the tracking ID yet. Order #OFF-1710567890",
        "created_at": datetime.now() - timedelta(hours=5)
    },
    {
        "sender_name": "Suresh Raina",
        "email": "suresh@workspace.in",
        "message": "Interested in bulk lamination for 100 ID cards. What would be the total cost including GST?",
        "created_at": datetime.now() - timedelta(days=1)
    },
    {
        "sender_name": "Meena Kumari",
        "email": "meena@edu.org",
        "message": "Thanks for the quick online form filling service today! Very helpful.",
        "created_at": datetime.now() - timedelta(days=2)
    }
]

# Support ChatMessageSerializer fields just in case
for msg in example_messages:
    msg['text'] = msg['message']
    msg['sender'] = 'user'
    msg['session_id'] = 'seed-session'

print(f"Seeding {len(example_messages)} messages...")
messages_col.insert_many(example_messages)
print("Done!")
