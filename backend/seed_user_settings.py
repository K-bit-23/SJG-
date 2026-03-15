import os
import django
from datetime import datetime

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from api.mongodb import mongo_client

def seed_user_settings():
    db = mongo_client.get_database()
    collection = db['user_settings']
    
    # Karthi's settings
    karthi_settings = {
        'email': 'karthikeyankarthikeyan0414@gmail.com',
        'location_access': True,
        'notifications': True,
        'email_updates': True,
        'sms_alerts': True,
        'dark_mode': True,
        'floating_shortcut': True,
        'overlay_mode': False,
        'language': 'Tamil',
        'updated_at': datetime.now()
    }
    
    # Upsert
    collection.update_one({'email': karthi_settings['email']}, {'$set': karthi_settings}, upsert=True)
    print(f"Settings for {karthi_settings['email']} seeded successfully.")

if __name__ == "__main__":
    seed_user_settings()
