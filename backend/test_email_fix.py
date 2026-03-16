"""
test_email_fix.py
Quick test: simulates exact email_utils._send() logic with ORDER_NOTIFY_EMAIL as a list,
then fires a real SMTP email using credentials from .env
"""

import os, sys, smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

# ── Simulate settings ──────────────────────────────────────────────────────
_admin_str = os.environ.get(
    'ORDER_NOTIFY_EMAIL',
    'dkarthideepak@gmail.com,karthikeyankarthikeyan64182@gmail.com'
)
ORDER_NOTIFY_EMAIL = [e.strip() for e in _admin_str.split(',') if e.strip()]   # list

HOST_USER     = os.environ.get('PRIMARY_EMAIL_HOST_USER', '')
HOST_PASSWORD = os.environ.get('PRIMARY_EMAIL_HOST_PASSWORD', '')
HOST          = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
PORT          = int(os.environ.get('EMAIL_PORT', 587))

print(f"Host        : {HOST}:{PORT}")
print(f"User        : {HOST_USER}")
print(f"Notify list : {ORDER_NOTIFY_EMAIL}")

# ── Simulate recipient building ───────────────────────────────────────────
customer_email = 'dkarthideepak@gmail.com'   # fake customer

if isinstance(ORDER_NOTIFY_EMAIL, list):
    all_emails = ORDER_NOTIFY_EMAIL + [customer_email]
elif ORDER_NOTIFY_EMAIL:
    all_emails = [ORDER_NOTIFY_EMAIL, customer_email]
else:
    all_emails = [HOST_USER, customer_email]

recipients = list({e.strip() for e in all_emails if e and e.strip()})
print(f"Recipients  : {recipients}")

# ── Send real test email ───────────────────────────────────────────────────
try:
    msg = MIMEText("This is a test email from the SJG email fix verification script.", "plain")
    msg['Subject'] = "[SJG TEST] Email fix verification"
    msg['From']    = HOST_USER
    msg['To']      = ', '.join(recipients)

    with smtplib.SMTP(HOST, PORT, timeout=30) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(HOST_USER, HOST_PASSWORD)
        server.sendmail(HOST_USER, recipients, msg.as_string())

    print("\n✅ SUCCESS — email sent to:", recipients)
except Exception as e:
    print(f"\n❌ FAILED: {e}")
    sys.exit(1)
