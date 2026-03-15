import os
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv
from pathlib import Path

# Explicitly load .env
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

def test_email():
    host = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
    port = int(os.getenv('EMAIL_PORT', 587))
    user = os.getenv('EMAIL_HOST_USER')
    password = os.getenv('EMAIL_HOST_PASSWORD')
    
    with open('test_log.txt', 'w') as f:
        f.write(f"Loading env from: {env_path}\n")
        f.write(f"Attempting to connect to {host}:{port} as {user}...\n")
        f.write(f"Password: {password}\n")
        
        try:
            server = smtplib.SMTP(host, port)
            server.set_debuglevel(1)
            server.starttls()
            server.login(user, password)
            f.write("Successfully authenticated!\n")
            server.quit()
        except Exception as e:
            f.write(f"ERROR: {str(e)}\n")

if __name__ == "__main__":
    test_email()
