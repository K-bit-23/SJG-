import pymongo
from django.conf import settings
import certifi

class MongoDBClient:
    _instance = None
    _client = None
    _db = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoDBClient, cls).__new__(cls)
        return cls._instance
    
    def get_database(self):
        """Get MongoDB database connection"""
        if self._db is None:
            try:
                self._client = pymongo.MongoClient(
                    settings.MONGODB_URI,
                    tlsCAFile=certifi.where()
                )
                self._db = self._client[settings.MONGODB_NAME]
                # Test connection
                self._client.admin.command('ping')
                print(f"✓ Successfully connected to MongoDB: {settings.MONGODB_NAME}")
            except Exception as e:
                print(f"✗ MongoDB connection error: {e}")
                raise e
        return self._db
    
    def get_collection(self, collection_name):
        """Get a specific MongoDB collection"""
        db = self.get_database()
        return db[collection_name]
    
    def close(self):
        """Close MongoDB connection"""
        if self._client:
            self._client.close()
            self._client = None
            self._db = None

# Singleton instance
mongo_client = MongoDBClient()
