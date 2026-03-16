import os
import smtplib
from dotenv import load_dotenv

load_dotenv('d:/projects/SJG-/backend/.env')

def test_multiple_emails():
    # Password from screenshot (without spaces)
    password = "ezelffqqcoewijsc"
    emails = [
        "karthikeyankarthikeyan0414@gmail.com",
        "dkarthideepak@gmail.com",
        "karthikeyankarthikeyan64182@gmail.com",
        "sjgvxerox@gmail.com"
    ]
    
    for email in emails:
        print(f"DEBUG: Trying email: {email}")
        try:
            server = smtplib.SMTP("smtp.gmail.com", 587, timeout=10)
            server.starttls()
            server.login(email, password)
            print(f"SUCCESS: Working for {email}!")
            server.quit()
        except Exception as e:
            print(f"FAILED: Error for {email}: {str(e)[:100]}")

if __name__ == "__main__":
    test_multiple_emails()
