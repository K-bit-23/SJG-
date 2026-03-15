import os
import pymongo
import certifi
from dotenv import load_dotenv

def test():
    load_dotenv()
    uri = os.environ.get('MONGODB_URI')
    name = os.environ.get('MONGODB_NAME')
    print(f"Testing connection to: {uri}")
    print(f"Database: {name}")
    
    try:
        client = pymongo.MongoClient(
            uri,
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=5000
        )
        client.admin.command('ping')
        print("✓ Connected successfully!")
    except Exception as e:
        print(f"✗ Failed: {e}")

if __name__ == "__main__":
    test()
