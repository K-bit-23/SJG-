import os
import smtplib
from dotenv import load_dotenv
from pathlib import Path

# Explicitly load .env
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

def diagnostic():
    emails = [
        'karthikeyankarthikeyan0414@gmail.com',
        'karthikeykarthikeyan64182@gmail.com',
        'karthikeyankarthikeyan0414@gmail.co',
        'karthikeyan0414@gmail.com'
    ]
    password = 'ezelffqqcoewijsc'
    
    results = []
    
    for email in emails:
        print(f"Testing {email}...")
        try:
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(email, password)
            results.append(f"SUCCESS: {email}")
            server.quit()
        except Exception as e:
            results.append(f"FAILED: {email} - {str(e)}")
            
    with open('diagnostic_results.txt', 'w') as f:
        f.write("\n".join(results))
    
    print("Diagnostics complete. Results saved to diagnostic_results.txt")

if __name__ == "__main__":
    diagnostic()
