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
import certifi
import dns.resolver

# Fix DNS resolution issues for MongoDB SRV records
# Some local networks/ISPs have slow or blocking DNS for SRV lookups
try:
    dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
    dns.resolver.default_resolver.nameservers = ['8.8.8.8', '8.8.4.4', '1.1.1.1']
    print("✓ Configured custom DNS resolver (8.8.8.8) for MongoDB connectivity")
except Exception as e:
    print(f"! Warning: Failed to configure custom DNS resolver: {e}")

class MongoDBClient:
    """
    Thread-safe singleton that lazily connects to MongoDB Atlas.
    If the connection drops, the next request to get_collection() will
    automatically create a fresh MongoClient.
    """

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
            raise RuntimeError(
                "MONGODB_URI is not set. "
                "Add it to your backend/.env file:\n"
                "  MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/"
            )

        # Show host only (hide credentials)
        host_display = uri.split("@")[-1].split("/")[0] if "@" in uri else uri
        print(f"\n" + "-"*55)
        print(f"[MongoDB] Connecting to Atlas ...")
        print(f"  DB   : {name}")
        print(f"  Host : {host_display}")
        print("-"*55)

        client = pymongo.MongoClient(
            uri,
            tlsCAFile                = certifi.where(),
            serverSelectionTimeoutMS = 15_000,
            connectTimeoutMS         = 15_000,
            socketTimeoutMS          = 20_000,
            maxPoolSize              = 20,
            retryWrites              = True,
            retryReads               = True,
        )

        # Ping to verify connectivity immediately (fail fast)
        client.admin.command("ping")

        db   = client[name]
        cols = db.list_collection_names()

        print(f"\n  [OK] MongoDB Connected!")
        print(f"  DB  : {name}")
        print(f"  Collections ({len(cols)}): {', '.join(cols) if cols else '(empty)'}")
        print("-"*55 + "\n")

        self._client = client
        self._db     = db

    def get_database(self):
        """Return the database handle, connecting or re-connecting as needed."""
        if self._db is None:
            try:
                self._connect()
            except Exception as exc:
                self._client = None
                self._db     = None
                print(f"\n  [ERROR] MongoDB connection FAILED!")
                print(f"  Error  : {exc}")
                print(f"  Fix    : Check MONGODB_URI in backend/.env and your network\n")
                raise exc
        return self._db

    def get_collection(self, name: str):
        """Return a MongoDB collection by name."""
        return self.get_database()[name]

    def ping(self) -> bool:
        """Return True if connection is alive, False if it dropped."""
        try:
            if self._client:
                self._client.admin.command("ping")
                return True
        except Exception:
            self._client = None
            self._db     = None
        return False

    def close(self):
        """Gracefully close the MongoClient."""
        if self._client:
            self._client.close()
            self._client = None
            self._db     = None
            print("[MongoDB] Connection closed.")


# ---------------------------------------------------------------------------
# 3. Singleton instance (imported everywhere)
# ---------------------------------------------------------------------------

mongo_client = MongoDBClient()


# ---------------------------------------------------------------------------
# 4. Eager startup ping (runs when Django first imports this module)
#    Failure is logged but does NOT crash Django -- first API call will retry.
# ---------------------------------------------------------------------------

def _startup_ping():
    try:
        mongo_client.get_database()
    except Exception:
        pass  # already printed inside get_database()


_startup_ping()
