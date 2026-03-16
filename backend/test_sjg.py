import os
import smtplib
from dotenv import load_dotenv

load_dotenv('d:/projects/SJG-/backend/.env')

def test_sjg_pairing():
    password = "ezelffqqcoewijsc"
    email = "sjgvxerox@gmail.com"
    
    print(f"Trying pairing: {email} with {password}")
    try:
        server = smtplib.SMTP("smtp.gmail.com", 587, timeout=10)
        server.starttls()
        server.login(email, password)
        print(f"✅ SUCCESS! This pairing works.")
        server.quit()
    except Exception as e:
        print(f"❌ Failed: {e}")

if __name__ == "__main__":
    test_sjg_pairing()
