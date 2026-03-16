import time
from api.email_utils import send_order_status_notification

sample_order = {
    "order_id": "TEST-12345",
    "user_name": "Test User",
    "user_email": "dkarthideepak@gmail.com",
    "items": [
        {"product_name": "Premium Notebook", "quantity": 2, "price": 150.00},
        {"product_name": "Gel Pen Set", "quantity": 1, "price": 55.00}
    ],
    "total_amount": 355.00,
    "shipping_address": "123 Sample Street, Output City, 10001",
    "payment_method": "Cash on Delivery",
    "status": "completed"
}

print("Calling send_order_status_notification...")
send_order_status_notification(sample_order)

# Need to wait because the email sending happens in a daemon thread
print("Sleeping for 10 seconds to allow thread to finish...")
time.sleep(10)
print("Finished.")
