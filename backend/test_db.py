import os
import django
from django.db import connections
from django.db.utils import OperationalError

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

db_conn = connections['default']
try:
    c = db_conn.cursor()
    print("MongoDB connection successful!")
except OperationalError:
    print("Authentication failed")
except Exception as e:
    print(f"Connection failed: {e}")
