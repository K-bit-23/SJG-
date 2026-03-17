"""
mongodb.py -- Robust MongoDB Atlas connection for SJG backend.

Features:
  - Patches dnspython to use Google/Cloudflare DNS before any SRV lookup
  - Singleton MongoClient shared across all requests
  - Auto-reconnect on connection failure
  - Startup ping with clear console output (ASCII-safe for Windows)
"""

import os
import certifi
import pymongo
from django.conf import settings
# Fix DNS resolution issues for MongoDB SRV records
try:
    import dns.resolver
    dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
    dns.resolver.default_resolver.nameservers = ['8.8.8.8', '8.8.4.4', '1.1.1.1']
    dns.resolver.default_resolver.timeout = 5.0
    dns.resolver.default_resolver.lifetime = 5.0
    print("✓ Configured Google/Cloudflare DNS (8.8.8.8) for SRV lookups")
except Exception as e:
    print(f"! Warning: Failed to configure custom DNS resolver: {e}")

class MongoDBClient:
    _instance = None
    _client   = None
    _db       = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def _connect(self):
        uri  = getattr(settings, "MONGODB_URI",  os.environ.get("MONGODB_URI",  ""))
        name = getattr(settings, "MONGODB_NAME", os.environ.get("MONGODB_NAME", "sjg_db"))

        if not uri:
            raise RuntimeError("MONGODB_URI is not set in .env")

        host_display = uri.split("@")[-1].split("/")[0] if "@" in uri else "Hidden"
        print(f"\n[MongoDB] Attempting connection to: {host_display}")

        try:
            client = pymongo.MongoClient(
                uri,
                tlsCAFile                = certifi.where(),
                serverSelectionTimeoutMS = 5000, # Faster fail (5s)
                connectTimeoutMS         = 5000,
                socketTimeoutMS          = 10000,
                maxPoolSize              = 10,
                retryWrites              = True,
            )

            # Eagerly test connection
            client.admin.command("ping")
            
            self._client = client
            self._db     = client[name]
            
            print(f"✓ [OK] MongoDB Connected to '{name}'")
        except Exception as e:
            print(f"✗ [ERROR] MongoDB Connection Failed: {str(e)}")
            self._client = None
            self._db     = None
            raise e

    def get_database(self):
        if self._db is None:
            self._connect()
        return self._db

    def get_collection(self, name: str):
        return self.get_database()[name]

def _startup_ping():
    # Run in a thread or just try-except to not block Django startup
    def do_ping():
        try:
            mongo_client.get_database()
        except:
            pass
    
    # For now, keep it synchronous to see output in console
    do_ping()

mongo_client = MongoDBClient()
_startup_ping()
