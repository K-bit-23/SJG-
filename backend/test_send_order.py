import sys
import os
import django
import traceback

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend_project.settings")
django.setup()

from api.views import send_order_email
from datetime import datetime

import sys
log_file = open('send_order_log.txt', 'w', encoding='utf-8')
sys.stdout = log_file
sys.stderr = log_file

order = {
    'order_id': 'TEST-555',
    'user_email': 'dkarthideepak@gmail.com',
    'user_name': 'Test User',
    'items': [],
    'total_amount': 100,
    'created_at': datetime.now()
}

print("Running send_order_email...")
try:
    send_order_email(order)
    print("Done calling send_order_email (but it runs in a thread... oh wait, send_order_email here is synchronous).")
except Exception as e:
    print(f"Exception: {e}")
    traceback.print_exc()

import time
time.sleep(5)
print("Finished script.")
