import os
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv

# Load .env file
load_dotenv('d:/projects/SJG-/backend/.env')

def test_smtp():
    host = os.getenv('EMAIL_HOST')
    port = int(os.getenv('EMAIL_PORT', 587))
    user = os.getenv('EMAIL_HOST_USER')
    password = os.getenv('EMAIL_HOST_PASSWORD')
    
    print(f"Attempting to connect to {host}:{port} as {user}...")
    
    msg = MIMEText("This is a test email to verify SMTP settings.")
    msg['Subject'] = "SMTP Test Script"
    msg['From'] = user
    msg['To'] = user
    
    try:
        server = smtplib.SMTP(host, port)
        server.set_debuglevel(1)
        server.starttls()
        server.login(user, password)
        server.send_message(msg)
        server.quit()
        print("SUCCESS: SMTP test email sent!")
    except Exception as e:
        print(f"FAILURE: SMTP test failed: {e}")

if __name__ == "__main__":
    test_smtp()
