import os
import smtplib
from dotenv import load_dotenv

# Path to .env
env_file = 'd:/projects/SJG-/backend/.env'
load_dotenv(env_file)

def test_smtp_smart():
    account_type = os.getenv('EMAIL_ACCOUNT', 'primary').lower()
    
    if account_type == 'secondary':
        user = os.getenv('SECONDARY_EMAIL_HOST_USER')
        password = os.getenv('SECONDARY_EMAIL_HOST_PASSWORD')
    else:
        user = os.getenv('PRIMARY_EMAIL_HOST_USER')
        password = os.getenv('PRIMARY_EMAIL_HOST_PASSWORD')
    
    if not user or not password:
        # Fallback to old keys
        user = os.getenv('EMAIL_HOST_USER')
        password = os.getenv('EMAIL_HOST_PASSWORD')

    host = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
    port = int(os.getenv('EMAIL_PORT', 587))
    
    print(f"--- Diagnostic ---")
    print(f"Account Mode: {account_type}")
    print(f"Target User: {user}")
    print(f"Target Host: {host}:{port}")
    
    if not user or not password:
        print("❌ FAILED: Missing credentials in .env")
        return

    try:
        server = smtplib.SMTP(host, port, timeout=10)
        server.starttls()
        server.login(user, password)
        print(f"✅ SUCCESS: Logged in as {user}")
        server.quit()
    except Exception as e:
        print(f"❌ FAILED: {e}")

if __name__ == "__main__":
    test_smtp_smart()
