import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from api.email_utils import send_order_confirmation_after_delay

# Create a mock order
mock_order = {
    'order_id': 'TEST-RESEND',
    'user_name': 'Karthikeyan (Test)',
    'user_email': 'karthikeyankarthikeyan64182@gmail.com',
    'items': [
        {'product_name': 'Test Notebook', 'quantity': 2, 'price': 50.0},
        {'product_name': 'Test Pen', 'quantity': 5, 'price': 10.0}
    ],
    'total_amount': 150.0,
    'shipping_address': '123 Test Street, Test City',
    'payment_method': 'Credit Card',
    'status': 'pending'
}

print("Initiating test email send...")
try:
    send_order_confirmation_after_delay(mock_order, delay_seconds=0)
    print("Test finished. Please check the logs above to see if it sent via Resend API or SMTP fallback.")
except Exception as e:
    print(f"Error occurred during test: {e}")
