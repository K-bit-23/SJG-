import os
import smtplib
from dotenv import load_dotenv

load_dotenv('d:/projects/SJG-/backend/.env')

def test_yesterday_pairing():
    # Trying the other password found in history
    password = "flfqjzykwemowreq"
    email = "karthikeyankarthikeyan64182@gmail.com"
    
    print(f"Trying yesterday's pairing: {email} with {password}")
    try:
        server = smtplib.SMTP("smtp.gmail.com", 587, timeout=10)
        server.starttls()
        server.login(email, password)
        print(f"✅ SUCCESS! This pairing works.")
        server.quit()
    except Exception as e:
        print(f"❌ Failed: {e}")

if __name__ == "__main__":
    test_yesterday_pairing()
