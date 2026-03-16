import os
import smtplib
from dotenv import load_dotenv

load_dotenv('d:/projects/SJG-/backend/.env')

def test_ssl():
    host = "smtp.gmail.com"
    port = 465
    user = os.getenv('EMAIL_HOST_USER')
    password = os.getenv('EMAIL_HOST_PASSWORD').replace(' ', '')
    
    print(f"Trying SSL on {host}:{port} for {user}...")
    try:
        server = smtplib.SMTP_SSL(host, port, timeout=10)
        server.login(user, password)
        print("✅ SUCCESS with SSL!")
        server.quit()
    except Exception as e:
        print(f"❌ SSL Failed: {e}")

if __name__ == "__main__":
    test_ssl()
