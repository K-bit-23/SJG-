import os
import django
from datetime import datetime

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from api.mongodb import mongo_client

def seed_settings():
    db = mongo_client.get_database()
    collection = db['app_settings']
    
    settings = {
        'type': 'global',
        'store_name': 'SJG Stationery',
        'contact_email': 'contact@sjg.com',
        'contact_phone': '+91 1234567890',
        'currency': 'INR',
        'currency_symbol': '₹',
        'maintenance_mode': False,
        'tax_rate': 18.0,
        'logo_url': '',
        'footer_text': '© 2026 SJG Stationery. All rights reserved.',
        'updated_at': datetime.now()
    }
    
    # Upsert
    collection.update_one({'type': 'global'}, {'$set': settings}, upsert=True)
    print("Default application settings seeded successfully.")

if __name__ == "__main__":
    seed_settings()
